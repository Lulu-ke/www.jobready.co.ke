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
// Vercel serverless.
//
// In Node.js environments (including Vercel serverless), pdfjs-dist v5
// automatically detects the Node runtime and disables the web worker,
// using a "fake worker" that runs on the main thread. It then dynamically
// imports the worker module via `import(workerSrc)`. We must NOT override
// workerSrc — the default `"./pdf.worker.mjs"` resolves correctly relative
// to pdfjs-dist's own build directory.

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Do NOT set GlobalWorkerOptions.workerSrc — let pdfjs use its default.
  // In Node.js it defaults to "./pdf.worker.mjs" which resolves relative
  // to the pdfjs-dist build directory, and the fake worker uses dynamic
  // import() which works in both local and Vercel environments.

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
    } catch (error: any) {
      const errMsg = error?.message || String(error)
      console.error('[file-parser] PDF parse error:', errMsg, error?.stack?.substring(0, 500))
      return {
        text: '',
        error: `Failed to parse PDF: ${errMsg}`,
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
