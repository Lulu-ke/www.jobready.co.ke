import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
      include: {
        employer: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const formattedJob = {
      ...job,
      salaryFormatted: job.salaryMin && job.salaryMax
        ? `KSh ${Math.round(job.salaryMin / 1000)}K - ${Math.round(job.salaryMax / 1000)}K`
        : job.salaryMin ? `From KSh ${Math.round(job.salaryMin / 1000)}K` : 'Not disclosed',
    };

    // Get related jobs from same category
    const relatedJobs = await db.job.findMany({
      where: {
        category: job.category,
        id: { not: job.id },
        isFeatured: true,
      },
      take: 4,
      orderBy: { postedAt: 'desc' },
      include: {
        employer: { select: { name: true, logo: true, isVerified: true } },
      },
    });

    return NextResponse.json({
      job: formattedJob,
      relatedJobs,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}
