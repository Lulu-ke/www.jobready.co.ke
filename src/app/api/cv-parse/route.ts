import { NextRequest, NextResponse } from 'next/server';
import { parseCVFile } from '@/lib/file-parser';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream', // Some browsers / OS send PDFs/DOCX with this generic MIME
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/cv-parse
 *
 * Accepts multipart/form-data with a `file` field.
 * Validates type (pdf/docx) and size (≤10 MB), then extracts text.
 *
 * Returns:
 *   { success: true, text: string, fileName: string }
 *   { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Request must be multipart/form-data with a file field.' },
        { status: 400 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request format. Please upload a file using multipart/form-data.' },
        { status: 400 },
      );
    }
    const file = formData.get('file') as File | null;

    // ── Validate file exists ────────────────────────────────────────────────
    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded. Please select a PDF or DOCX file.' },
        { status: 400 },
      );
    }

    // ── Validate file size ──────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { success: false, error: `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.` },
        { status: 400 },
      );
    }

    // ── Validate file extension ─────────────────────────────────────────────
    const fileName = file.name;
    const lastDot = fileName.lastIndexOf('.');
    const ext = lastDot === -1 ? '' : fileName.slice(lastDot).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 },
      );
    }

    // ── Validate MIME type (tolerant: accept application/* for generic browser types) ──
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith('application/')) {
      console.warn('[CV Parse] Rejected MIME type:', file.type, 'for file:', fileName);
      return NextResponse.json(
        { success: false, error: `Invalid file type (${file.type}). Please upload a PDF or DOCX file.` },
        { status: 400 },
      );
    }

    // ── Parse the file ──────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    let result: any;
    try {
      result = await parseCVFile(buffer, fileName, file.type);
    } catch (parseErr: any) {
      console.error('[CV Parse] parseCVFile threw:', parseErr?.message, parseErr?.stack?.substring(0, 500));
      return NextResponse.json(
        { success: false, error: `Parse error: ${parseErr?.message || 'Unknown'}` },
        { status: 500 },
      );
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    if (!result.text || result.text.trim().length < 20) {
      console.warn('[CV Parse] Insufficient text extracted:', result.text?.length ?? 0, 'chars from:', fileName);
      return NextResponse.json(
        {
          success: false,
          error: 'The file contains too little text to analyze. It may be image-based, scanned, or empty. Try a text-based PDF/DOCX or paste your CV text directly.',
        },
        { status: 400 },
      );
    }

    // ── Success ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      text: result.text,
      fileName,
    });
  } catch (error) {
    console.error('[CV Parse] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse the file. Please try again or paste your CV text directly.' },
      { status: 500 },
    );
  }
}
