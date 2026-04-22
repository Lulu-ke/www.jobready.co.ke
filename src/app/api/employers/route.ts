import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const employers = await db.employer.findMany({
      orderBy: { companyName: 'asc' },
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        orgType: true,
        slug: true,
      },
    });
    return NextResponse.json({ employers });
  } catch (error) {
    console.error('Error fetching employers:', error);
    return NextResponse.json({ error: 'Failed to fetch employers' }, { status: 500 });
  }
}
