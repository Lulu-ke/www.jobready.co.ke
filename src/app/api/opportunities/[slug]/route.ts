import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const opportunity = await db.opportunity.findUnique({
      where: { slug },
      include: {
        provider: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            orgType: true,
            slug: true,
            description: true,
          },
        },
      },
    });
    if (!opportunity) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });

    // Increment view count (fire-and-forget)
    db.opportunity.update({
      where: { id: opportunity.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}
