import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const employers = await db.employer.findMany({
      where: { isVerified: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, logo: true, industry: true, size: true },
    });
    return NextResponse.json({ employers });
  } catch (error) {
    console.error('Error fetching employers:', error);
    return NextResponse.json({ error: 'Failed to fetch employers' }, { status: 500 });
  }
}
