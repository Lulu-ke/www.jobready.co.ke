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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const salaryMin = searchParams.get('salaryMin')
      ? parseInt(searchParams.get('salaryMin')!)
      : undefined;
    const salaryMax = searchParams.get('salaryMax')
      ? parseInt(searchParams.get('salaryMax')!)
      : undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const county = searchParams.get('county') || '';
    const orgType = searchParams.get('orgType') || '';
    const featured = searchParams.get('featured') === 'true';
    const deadline = searchParams.get('deadline') || '';

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { employer: { companyName: { contains: search } } },
        { category: { name: { contains: search } } },
      ];
    }
    if (location) {
      const locationFilter = [
        { location: { contains: location } },
        { county: { contains: location } },
      ];
      if (where.OR) {
        where.OR = [...(Array.isArray(where.OR) ? where.OR : []), ...locationFilter];
      } else {
        where.OR = locationFilter;
      }
    }
    if (category) {
      where.category = {
        OR: [
          { slug: category },
          { name: { contains: category } },
        ],
      };
    }
    if (type) {
      if (type === 'Remote') {
        where.isRemote = true;
      } else {
        where.type = type;
      }
    }
    if (salaryMin !== undefined) {
      where.salaryMin = { gte: salaryMin };
    }
    if (salaryMax !== undefined) {
      where.salaryMax = { lte: salaryMax };
    }
    if (experienceLevel) {
      where.experienceLevel = experienceLevel as any;
    }
    if (county) {
      where.county = { contains: county };
    }
    if (orgType) {
      where.employer = { ...where.employer, orgType: orgType as any };
    }
    if (featured) {
      where.isFeatured = true;
    }
    if (deadline === 'soon') {
      where.closingDate = {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }

    const orderBy: Record<string, string> = {};
    if (sort === 'newest') {
      orderBy.postedAt = 'desc';
    } else if (sort === 'salary-high') {
      orderBy.salaryMax = 'desc';
    } else if (sort === 'salary-low') {
      orderBy.salaryMin = 'asc';
    } else if (sort === 'featured') {
      orderBy.isFeatured = 'desc';
    } else if (sort === 'trending') {
      orderBy.views = 'desc';
    } else if (sort === 'deadline') {
      orderBy.closingDate = 'asc';
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
              icon: true,
              color: true,
            },
          },
        },
      }),
      db.job.count({ where }),
    ]);

    const formattedJobs = jobs.map((job) => ({
      ...job,
      company: job.employer?.companyName || null,
      logo: job.employer?.logoUrl || null,
      isUrgent: deriveIsUrgent(job.closingDate),
      salaryFormatted: formatSalary(job.salaryMin, job.salaryMax, job.currency),
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
