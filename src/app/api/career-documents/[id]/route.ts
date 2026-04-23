import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const document = await db.careerDocument.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Fetch career document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch document.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { content, title, isPublic } = body;

    const existing = await db.careerDocument.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Document not found.' },
        { status: 404 }
      );
    }

    const updateData: any = { version: { increment: 1 } };
    if (content !== undefined) updateData.content = String(content);
    if (title !== undefined) updateData.title = String(title).slice(0, 200);
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

    const document = await db.careerDocument.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Update career document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update document.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await db.careerDocument.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Document not found.' },
        { status: 404 }
      );
    }

    await db.careerDocument.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete career document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document.' },
      { status: 500 }
    );
  }
}
