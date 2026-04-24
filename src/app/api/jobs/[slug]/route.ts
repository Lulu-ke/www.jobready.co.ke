import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function deriveIsUrgent(closingDate: Date | null): boolean {
  if (!closingDate) return false;
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return closingDate <= sevenDaysFromNow;
}

function formatSalary(
  salaryMin: number | null,
  salaryMax: number | null,
  currency: string
): string {
  const symbol = currency || 'KSh';
  if (salaryMin && salaryMax) {
    return `${symbol} ${Math.round(salaryMin / 1000)}K - ${Math.round(salaryMax / 1000)}K`;
  }
  if (salaryMin) {
    return `From ${symbol} ${Math.round(salaryMin / 1000)}K`;
  }
  return 'Not disclosed';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const job = await db.job.findUnique({
      where: { slug },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            orgType: true,
            slug: true,
            description: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            description: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    db.job.update({
      where: { id: job.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    const formattedJob = {
      ...job,
      company: job.employer?.companyName || 'Unknown Company',
      logo: job.employer?.logoUrl || null,
      isUrgent: deriveIsUrgent(job.closingDate),
      salaryFormatted: formatSalary(job.salaryMin, job.salaryMax, job.currency),
    };

    // Get related jobs from same category
    const relatedJobs = job.categoryId
      ? await db.job.findMany({
          where: {
            categoryId: job.categoryId,
            id: { not: job.id },
            isActive: true,
          },
          take: 4,
          orderBy: { postedAt: 'desc' },
          include: {
            employer: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                orgType: true,
                slug: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        })
      : [];

    const formattedRelatedJobs = relatedJobs.map((rj) => ({
      ...rj,
      company: rj.employer?.companyName || 'Unknown Company',
      logo: rj.employer?.logoUrl || null,
      isUrgent: deriveIsUrgent(rj.closingDate),
      salaryFormatted: formatSalary(rj.salaryMin, rj.salaryMax, rj.currency),
    }));

    return NextResponse.json({
      job: formattedJob,
      relatedJobs: formattedRelatedJobs,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}
