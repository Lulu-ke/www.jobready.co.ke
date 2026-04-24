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

    const alerts = await db.jobAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { alerts } });
  } catch (error) {
    console.error('GET /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { keywords, location, category, frequency } = body;

    if (!keywords && !location && !category) {
      return NextResponse.json({ success: false, error: 'At least one of keywords, location, or category is required' }, { status: 400 });
    }

    const alert = await db.jobAlert.create({
      data: {
        userId: session.user.id,
        keywords: keywords || null,
        location: location || null,
        category: category || null,
        frequency: frequency || 'DAILY',
      },
    });

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (error) {
    console.error('POST /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create alert' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive, keywords, location, category, frequency } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Alert ID is required' }, { status: 400 });
    }

    // Verify the alert belongs to the user
    const existing = await db.jobAlert.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (keywords !== undefined) data.keywords = keywords;
    if (location !== undefined) data.location = location;
    if (category !== undefined) data.category = category;
    if (frequency !== undefined) data.frequency = frequency;

    const alert = await db.jobAlert.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    console.error('PATCH /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update alert' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Alert ID is required' }, { status: 400 });
    }

    // Verify the alert belongs to the user
    const existing = await db.jobAlert.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }

    await db.jobAlert.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('DELETE /api/alerts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete alert' }, { status: 500 });
  }
}
