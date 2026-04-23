import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Scan ID is required.' },
        { status: 400 }
      );
    }

    const scan = await db.cVScan.findUnique({
      where: { id },
    });

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scan: {
        id: scan.id,
        cvText: scan.cvText,
        jobDescription: scan.jobDescription,
        atsScore: scan.atsScore,
        keywordMatch: scan.keywordMatch,
        formatScore: scan.formatScore,
        sectionScore: scan.sectionScore,
        readabilityScore: scan.readabilityScore,
        skillGaps: scan.skillGaps,
        suggestions: scan.suggestions,
        improvements: scan.improvements,
        issues: scan.issues,
        isAnalyzed: scan.isAnalyzed,
        email: scan.email,
        createdAt: scan.createdAt,
      },
    });
  } catch (error) {
    console.error('Fetch CV scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scan results.' },
      { status: 500 }
    );
  }
}
