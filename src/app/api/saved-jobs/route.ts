import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const savedJobs = await db.savedJob.findMany({
      where: { userId: session.user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { savedJobs } });
  } catch (error) {
    console.error('GET /api/saved-jobs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await db.savedJob.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Job already saved' }, { status: 409 });
    }

    const savedJob = await db.savedJob.create({
      data: { userId: session.user.id, jobId },
    });

    return NextResponse.json({ success: true, data: savedJob }, { status: 201 });
  } catch (error) {
    console.error('POST /api/saved-jobs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save job' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    await db.savedJob.delete({
      where: { userId_jobId: { userId: session.user.id, jobId } },
    });

    return NextResponse.json({ success: true, message: 'Job unsaved' });
  } catch (error) {
    console.error('DELETE /api/saved-jobs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to unsave job' }, { status: 500 });
  }
}
