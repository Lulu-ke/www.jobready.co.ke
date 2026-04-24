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

// ─── parseCVFile ─────────────────────────────────────────────────────────────

/**
 * Parse a CV file (PDF or DOCX) and extract its raw text content.
 *
 * Uses dynamic imports so mammoth/pdf-parse only load when actually needed
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
      const pdfParse = await import('pdf-parse')
      const pdf = (pdfParse as any).default || pdfParse
      const result = await pdf(buffer)
      const text = (result.text || '').trim()

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
