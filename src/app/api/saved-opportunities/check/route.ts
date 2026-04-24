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
    const { opportunityIds } = body;

    if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return NextResponse.json({ savedIds: [] });
    }

    const saved = await db.savedOpportunity.findMany({
      where: {
        userId: session.user.id,
        opportunityId: { in: opportunityIds },
      },
      select: { opportunityId: true },
    });

    return NextResponse.json({ savedIds: saved.map((s) => s.opportunityId) });
  } catch (error) {
    console.error('POST /api/saved-opportunities/check error:', error);
    return NextResponse.json({ savedIds: [] });
  }
}
