import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({ where: { slug } });
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    // Increment view count (fire-and-forget)
    db.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
