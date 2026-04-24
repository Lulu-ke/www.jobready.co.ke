import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const savedArticles = await db.savedArticle.findMany({
      where: { userId: session.user.id },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            author: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { savedArticles } });
  } catch (error) {
    console.error('GET /api/saved-articles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'Article ID is required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await db.savedArticle.findUnique({
      where: { userId_articleId: { userId: session.user.id, articleId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Article already saved' }, { status: 409 });
    }

    const savedArticle = await db.savedArticle.create({
      data: { userId: session.user.id, articleId },
    });

    return NextResponse.json({ success: true, data: savedArticle }, { status: 201 });
  } catch (error) {
    console.error('POST /api/saved-articles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'Article ID is required' }, { status: 400 });
    }

    await db.savedArticle.delete({
      where: { userId_articleId: { userId: session.user.id, articleId } },
    });

    return NextResponse.json({ success: true, message: 'Article unsaved' });
  } catch (error) {
    console.error('DELETE /api/saved-articles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to unsave article' }, { status: 500 });
  }
}
