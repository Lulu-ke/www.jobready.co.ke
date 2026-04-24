import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ savedIds: [] });
    }

    const body = await request.json();
    const { jobIds } = body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({ savedIds: [] });
    }

    const saved = await db.savedJob.findMany({
      where: {
        userId: session.user.id,
        jobId: { in: jobIds },
      },
      select: { jobId: true },
    });

    return NextResponse.json({ savedIds: saved.map((s) => s.jobId) });
  } catch (error) {
    console.error('POST /api/saved-jobs/check error:', error);
    return NextResponse.json({ savedIds: [] });
  }
}
