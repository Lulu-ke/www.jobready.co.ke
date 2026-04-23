import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: any = { userId: session.user.id };
    if (type) {
      where.type = type;
    }

    const documents = await db.careerDocument.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        version: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Fetch career documents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, content } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Type, title, and content are required.' },
        { status: 400 }
      );
    }

    const validTypes = ['CV', 'COVER_LETTER', 'LINKEDIN_PROFILE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const document = await db.careerDocument.create({
      data: {
        userId: session.user.id,
        type,
        title: String(title).slice(0, 200),
        content: String(content),
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Create career document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create document.' },
      { status: 500 }
    );
  }
}
