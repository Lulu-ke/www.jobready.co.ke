import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id || slug) {
      const employer = await db.employer.findUnique({
        where: slug ? { slug } : { id: id! },
      });
      if (!employer) {
        return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
      }
      return NextResponse.json({ employer });
    }

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
