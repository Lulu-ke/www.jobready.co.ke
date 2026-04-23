import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
