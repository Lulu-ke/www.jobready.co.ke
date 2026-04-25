// ─── DOMMatrix polyfill for Node.js / Vercel serverless ───────────────────────

const _polyfillDOMMatrix = () => {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    (globalThis as any).DOMMatrix = class DOMMatrixImpl {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
      m11 = 1; m12 = 0; m21 = 0; m22 = 1; m41 = 0; m42 = 0
      is2D = true
      isIdentity = true

      constructor(init?: string | number[]) {
        if (typeof init === 'string') {
          const nums = init.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || []
          if (nums.length >= 6) {
            this.a = nums[0]; this.b = nums[1]; this.c = nums[2]
            this.d = nums[3]; this.e = nums[4]; this.f = nums[5]
          }
        } else if (Array.isArray(init)) {
          this.a = init[0] ?? 1; this.b = init[1] ?? 0; this.c = init[2] ?? 0
          this.d = init[3] ?? 1; this.e = init[4] ?? 0; this.f = init[5] ?? 0
        }
        this.m11 = this.a; this.m12 = this.b
        this.m21 = this.c; this.m22 = this.d
        this.m41 = this.e; this.m42 = this.f
        this.isIdentity = this.a === 1 && this.b === 0 && this.c === 0 &&
          this.d === 1 && this.e === 0 && this.f === 0
      }

      multiply(other: DOMMatrixImpl): DOMMatrixImpl {
        return new DOMMatrixImpl([
          this.a * other.a + this.c * other.b,
          this.b * other.a + this.d * other.b,
          this.a * other.c + this.c * other.d,
          this.b * other.c + this.d * other.d,
          this.a * other.e + this.c * other.f + this.e,
          this.b * other.e + this.d * other.f + this.f,
        ])
      }

      inverse(): DOMMatrixImpl {
        const det = this.a * this.d - this.b * this.c
        if (det === 0) return new DOMMatrixImpl()
        return new DOMMatrixImpl([
          this.d / det, -this.b / det, -this.c / det, this.a / det,
          (this.c * this.f - this.d * this.e) / det,
          (this.b * this.e - this.a * this.f) / det,
        ])
      }

      toString(): string {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`
      }
    }
  }
}
_polyfillDOMMatrix()

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
// pdfjs-dist v5 uses DOMMatrix (polyfilled above) and a "fake worker" in Node.js.
// We use a CDN URL for the worker to avoid Vercel serverless file-resolution issues.

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Use CDN worker — avoids all local file resolution issues on Vercel.
  // The version is read dynamically from the installed pdfjs-dist package.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
  }

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

export async function parseCVFile(
  file: Buffer | Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<ParseResult> {
  const ext = getFileExtension(fileName)
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file)

  if (isPdfType(mimeType, ext)) {
    try {
      const text = await extractPdfText(buffer).then(t => t.trim())
      if (text.length < 50) {
        return { text: '', error: 'This PDF appears to be image-based and cannot be parsed. Please paste your CV text directly or use a text-based PDF.' }
      }
      return { text }
    } catch (error: any) {
      const errMsg = error?.message || String(error)
      console.error('[file-parser] PDF parse error:', errMsg, error?.stack?.substring(0, 500))
      return { text: '', error: `Failed to parse PDF: ${errMsg}` }
    }
  }

  if (isDocxType(mimeType, ext)) {
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      const text = (result.value || '').trim()
      if (!text) return { text: '', error: 'The DOCX file appears to be empty.' }
      return { text }
    } catch (error) {
      console.error('[file-parser] DOCX parse error:', error)
      return { text: '', error: 'Failed to parse DOCX.' }
    }
  }

  if (ext === '.doc') {
    return { text: '', error: 'Old .DOC format not supported. Please save as .DOCX or PDF.' }
  }

  return { text: '', error: 'Unsupported file format. Please upload a PDF or DOCX file.' }
}
