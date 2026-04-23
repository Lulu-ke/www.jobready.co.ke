import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');

    const where: Prisma.JobApplicationWhereInput = {};
    if (session.user.id) {
      where.userId = session.user.id;
    }
    if (status && ['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      where.status = status as Prisma.EnumApplicationStatusFilter['equals'];
    }

    const applications = await db.jobApplication.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            type: true,
            employer: { select: { companyName: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: { applications } });
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, coverLetter } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    // Check if already applied
    const existing = await db.jobApplication.findUnique({
      where: {
        jobId_applicantEmail: {
          jobId,
          applicantEmail: session.user.email,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already applied to this job' }, { status: 409 });
    }

    // Get user profile for CV info
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      select: { cvUrl: true },
    });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    });

    const application = await db.jobApplication.create({
      data: {
        jobId,
        userId: session.user.id,
        applicantName: user?.name || session.user.name,
        applicantEmail: user?.email || session.user.email,
        applicantPhone: user?.phone || null,
        cvUrl: profile?.cvUrl || null,
        coverLetter: coverLetter || null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit application' }, { status: 500 });
  }
}
