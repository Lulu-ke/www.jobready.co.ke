import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalJobs, totalEmployers, totalCategories, featuredJobs, remoteJobs, scholarshipCount] = await Promise.all([
      db.job.count(),
      db.employer.count(),
      db.category.count(),
      db.job.count({ where: { isFeatured: true } }),
      db.job.count({ where: { isRemote: true } }),
      db.scholarship.count(),
    ]);

    const locations = await db.job.groupBy({
      by: ['county'],
      _count: { county: true },
      orderBy: { _count: { county: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      totalJobs,
      totalEmployers,
      totalCategories,
      featuredJobs,
      remoteJobs,
      scholarshipCount,
      topLocations: locations.map((l) => ({ county: l.county, count: l._count.county })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
