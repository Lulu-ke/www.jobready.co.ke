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

    const savedOpportunities = await db.savedOpportunity.findMany({
      where: { userId: session.user.id },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            provider: { select: { companyName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { savedOpportunities } });
  } catch (error) {
    console.error('GET /api/saved-opportunities error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { opportunityId } = body;

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: 'Opportunity ID is required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await db.savedOpportunity.findUnique({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Opportunity already saved' }, { status: 409 });
    }

    const savedOpportunity = await db.savedOpportunity.create({
      data: { userId: session.user.id, opportunityId },
    });

    return NextResponse.json({ success: true, data: savedOpportunity }, { status: 201 });
  } catch (error) {
    console.error('POST /api/saved-opportunities error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save opportunity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: 'Opportunity ID is required' }, { status: 400 });
    }

    await db.savedOpportunity.delete({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId } },
    });

    return NextResponse.json({ success: true, message: 'Opportunity unsaved' });
  } catch (error) {
    console.error('DELETE /api/saved-opportunities error:', error);
    return NextResponse.json({ success: false, error: 'Failed to unsave opportunity' }, { status: 500 });
  }
}
