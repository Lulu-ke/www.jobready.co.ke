import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const update = await db.jobUpdate.findUnique({ where: { id } });
    if (!update) return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    return NextResponse.json({ update });
  } catch (error) {
    console.error('Error fetching update:', error);
    return NextResponse.json({ error: 'Failed to fetch update' }, { status: 500 });
  }
}
