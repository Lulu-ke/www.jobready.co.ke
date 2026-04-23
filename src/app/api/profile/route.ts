import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: profile || {} });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, summary, skills, experience, education, location, county, isPublic } = body;

    // Validate skills is an array if provided
    if (skills !== undefined && !Array.isArray(skills)) {
      return NextResponse.json({ success: false, error: 'Skills must be an array' }, { status: 400 });
    }

    // Validate experience is an array if provided
    if (experience !== undefined && !Array.isArray(experience)) {
      return NextResponse.json({ success: false, error: 'Experience must be an array' }, { status: 400 });
    }

    // Validate education is an array if provided
    if (education !== undefined && !Array.isArray(education)) {
      return NextResponse.json({ success: false, error: 'Education must be an array' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (summary !== undefined) data.summary = summary;
    if (skills !== undefined) data.skills = JSON.stringify(skills);
    if (experience !== undefined) data.experience = experience;
    if (education !== undefined) data.education = education;
    if (location !== undefined) data.location = location;
    if (county !== undefined) data.county = county;
    if (isPublic !== undefined) data.isPublic = isPublic;

    const profile = await db.profile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
