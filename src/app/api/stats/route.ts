import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalJobs,
      totalEmployers,
      totalCategories,
      featuredJobs,
      remoteJobs,
      opportunityCount,
    ] = await Promise.all([
      db.job.count(),
      db.employer.count(),
      db.category.count(),
      db.job.count({ where: { isFeatured: true, isActive: true } }),
      db.job.count({ where: { isRemote: true, isActive: true } }),
      db.opportunity.count(),
    ]);

    // Top locations by county
    const locations = await db.job.groupBy({
      by: ['county'],
      _count: { county: true },
      orderBy: { _count: { county: 'desc' } },
      take: 10,
    });

    // Experience level stats
    const experienceLevels = await db.job.groupBy({
      by: ['experienceLevel'],
      _count: { experienceLevel: true },
      where: { isActive: true },
      orderBy: { _count: { experienceLevel: 'desc' } },
    });

    // Org type stats
    const orgTypes = await db.employer.groupBy({
      by: ['orgType'],
      _count: { orgType: true },
      orderBy: { _count: { orgType: 'desc' } },
    });

    // Opportunity type stats
    const opportunityTypes = await db.opportunity.groupBy({
      by: ['type'],
      _count: { type: true },
      where: { isActive: true },
      orderBy: { _count: { type: 'desc' } },
    });

    return NextResponse.json({
      totalJobs,
      totalEmployers,
      totalCategories,
      featuredJobs,
      remoteJobs,
      opportunityCount,
      topLocations: locations.map((l) => ({ county: l.county, count: l._count.county })),
      experienceLevels: experienceLevels.map((e) => ({
        level: e.experienceLevel,
        count: e._count.experienceLevel,
      })),
      orgTypes: orgTypes.map((o) => ({
        type: o.orgType,
        count: o._count.orgType,
      })),
      opportunityTypes: opportunityTypes.map((o) => ({
        type: o.type,
        count: o._count.type,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
