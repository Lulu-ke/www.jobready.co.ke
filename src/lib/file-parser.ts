// ─── Types ───────────────────────────────────────────────────────────────────

interface ParseResult {
  text: string
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return ''
  return fileName.slice(lastDot).toLowerCase()
}

function isPdfType(mimeType: string, ext: string): boolean {
  return mimeType === 'application/pdf' || ext === '.pdf'
}

function isDocxType(mimeType: string, ext: string): boolean {
  return (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  )
}

// ─── PDF text extraction using pdfjs-dist directly ───────────────────────────
// We use pdfjs-dist/legacy/build/pdf.mjs instead of pdf-parse v2 because
// pdf-parse v2 depends on @napi-rs/canvas (native module) which fails in
// Vercel serverless.  pdfjs-dist is pure JS and works everywhere.

let workerSrcResolved = false

async function ensureWorkerSrc(pdfjs: any): Promise<void> {
  if (workerSrcResolved || pdfjs.GlobalWorkerOptions.workerSrc) return

  // Try multiple strategies to locate the pdfjs worker file
  const candidates = [
    // 1. require.resolve via createRequire (works in most Node envs)
    async () => {
      const { createRequire } = await import('module')
      const req = createRequire(import.meta.url)
      return req.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
    },
    // 2. Relative to process.cwd()/node_modules
    async () => {
      const nodePath = await import('path')
      return nodePath.join(
        process.cwd(),
        'node_modules',
        'pdfjs-dist',
        'legacy',
        'build',
        'pdf.worker.min.mjs',
      )
    },
  ]

  for (const strategy of candidates) {
    try {
      const src = await strategy()
      // Verify the file exists
      const fs = await import('fs')
      fs.accessSync(src)
      pdfjs.GlobalWorkerOptions.workerSrc = src
      workerSrcResolved = true
      return
    } catch {
      // Try next strategy
    }
  }

  // All strategies failed — the workerSrc is already set or pdfjs will fail.
  // This shouldn't happen in a properly deployed environment.
  workerSrcResolved = true
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  await ensureWorkerSrc(pdfjs)

  const data = new Uint8Array(buffer)
  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: false,
  }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()
    const lines: string[] = []
    let lastY: number | null = null

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue
      const y = item.transform?.[5] ?? 0

      // New line when Y position changes significantly (new text line)
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push('\n')
      }
      lastY = y
      lines.push(item.str)
    }
    pageTexts.push(lines.join(''))
    page.cleanup()
  }

  return pageTexts.join('\n\n')
}

// ─── parseCVFile ─────────────────────────────────────────────────────────────

/**
 * Parse a CV file (PDF or DOCX) and extract its raw text content.
 *
 * Uses dynamic imports so mammoth/pdfjs-dist only load when actually needed
 * (avoids crashes in serverless / edge environments).
 */
export async function parseCVFile(
  file: Buffer | Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<ParseResult> {
  const ext = getFileExtension(fileName)
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file)

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (isPdfType(mimeType, ext)) {
    try {
      const text = await extractPdfText(buffer).then(t => t.trim())

      if (text.length < 50) {
        return {
          text: '',
          error:
            'This PDF appears to be image-based and cannot be parsed. Please paste your CV text directly or use a text-based PDF.',
        }
      }

      return { text }
    } catch (error) {
      console.error('[file-parser] PDF parse error:', error)
      return {
        text: '',
        error: 'Failed to parse PDF. The file may be corrupted or password-protected.',
      }
    }
  }

  // ── DOCX ─────────────────────────────────────────────────────────────────
  if (isDocxType(mimeType, ext)) {
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      const text = (result.value || '').trim()

      if (!text) {
        return {
          text: '',
          error: 'The DOCX file appears to be empty. Please upload a file that contains text.',
        }
      }

      return { text }
    } catch (error) {
      console.error('[file-parser] DOCX parse error:', error)
      return {
        text: '',
        error: 'Failed to parse DOCX. The file may be corrupted or in an unsupported format.',
      }
    }
  }

  // ── Legacy .DOC ─────────────────────────────────────────────────────────
  if (ext === '.doc') {
    return {
      text: '',
      error: 'Old .DOC format not supported. Please save as .DOCX or PDF.',
    }
  }

  // ── Unsupported ──────────────────────────────────────────────────────────
  return {
    text: '',
    error: 'Unsupported file format. Please upload a PDF or DOCX file.',
  }
}
