import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ savedIds: [] });
    }

    const body = await request.json();
    const { articleIds } = body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json({ savedIds: [] });
    }

    const saved = await db.savedArticle.findMany({
      where: {
        userId: session.user.id,
        articleId: { in: articleIds },
      },
      select: { articleId: true },
    });

    return NextResponse.json({ savedIds: saved.map((s) => s.articleId) });
  } catch (error) {
    console.error('POST /api/saved-articles/check error:', error);
    return NextResponse.json({ savedIds: [] });
  }
}
