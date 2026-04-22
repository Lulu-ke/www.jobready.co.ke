import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (type) {
      where.type = type as Prisma.EnumOpportunityTypeFilter['equals'];
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    const opportunities = await db.opportunity.findMany({
      where,
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
      include: {
        provider: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            orgType: true,
            slug: true,
          },
        },
      },
    });

    const formattedOpportunities = opportunities.map((opp) => ({
      ...opp,
      providerName: opp.provider?.companyName || null,
      providerLogo: opp.provider?.logoUrl || null,
    }));

    return NextResponse.json({ opportunities: formattedOpportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
