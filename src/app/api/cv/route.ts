import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'cvs');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { cvUrl: true, cvFileName: true, updatedAt: true },
    });

    if (!profile?.cvUrl) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        cvUrl: profile.cvUrl,
        cvFileName: profile.cvFileName,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error) {
    console.error('GET /api/cv error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch CV info' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB.' }, { status: 400 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueName = `${session.user.id}-${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const cvUrl = `/uploads/cvs/${uniqueName}`;

    // Delete old CV file if exists
    const existingProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { cvUrl: true },
    });

    if (existingProfile?.cvUrl) {
      const oldPath = path.join(process.cwd(), 'public', existingProfile.cvUrl);
      try { await unlink(oldPath); } catch {}
    }

    // Upsert profile with CV info
    await db.profile.upsert({
      where: { userId: session.user.id },
      update: { cvUrl, cvFileName: file.name },
      create: { userId: session.user.id, cvUrl, cvFileName: file.name },
    });

    return NextResponse.json({ success: true, data: { cvUrl, cvFileName: file.name } });
  } catch (error) {
    console.error('POST /api/cv error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload CV' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { cvUrl: true },
    });

    if (profile?.cvUrl) {
      const filePath = path.join(process.cwd(), 'public', profile.cvUrl);
      try { await unlink(filePath); } catch {}
    }

    await db.profile.update({
      where: { userId: session.user.id },
      data: { cvUrl: null, cvFileName: null },
    });

    return NextResponse.json({ success: true, message: 'CV deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/cv error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete CV' }, { status: 500 });
  }
}
