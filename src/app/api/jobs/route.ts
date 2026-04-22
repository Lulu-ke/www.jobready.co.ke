import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const salaryMin = searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined;
    const salaryMax = searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (location) {
      where.OR = where.OR
        ? [...(where.OR as Array<Record<string, unknown>>), { location: { contains: location } }, { county: { contains: location } }]
        : [{ location: { contains: location } }, { county: { contains: location } }];
    }
    if (category) {
      where.category = category;
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

    const orderBy: Record<string, string> = {};
    if (sort === 'newest') {
      orderBy.postedAt = 'desc';
    } else if (sort === 'salary-high') {
      orderBy.salaryMax = 'desc';
    } else if (sort === 'salary-low') {
      orderBy.salaryMin = 'asc';
    } else if (sort === 'featured') {
      orderBy.isFeatured = 'desc';
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          employer: {
            select: { name: true, logo: true, industry: true, isVerified: true },
          },
        },
      }),
      db.job.count({ where }),
    ]);

    const formattedJobs = jobs.map((job) => ({
      ...job,
      salaryFormatted: job.salaryMin && job.salaryMax
        ? `KSh ${Math.round(job.salaryMin / 1000)}K - ${Math.round(job.salaryMax / 1000)}K`
        : job.salaryMin ? `From KSh ${Math.round(job.salaryMin / 1000)}K` : 'Not disclosed',
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
