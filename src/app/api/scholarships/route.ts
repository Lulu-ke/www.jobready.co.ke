import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const level = request.nextUrl.searchParams.get('level');
    const where: Record<string, unknown> = {};
    if (level) where.level = level;

    const scholarships = await db.scholarship.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { deadline: 'asc' }],
    });

    return NextResponse.json({ scholarships });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return NextResponse.json({ error: 'Failed to fetch scholarships' }, { status: 500 });
  }
}
