import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Calculate remaining credits for this scan
    let scansRemaining: number | null = null;
    let totalScans: number | null = null;

    if (scan.creditId) {
      const credit = await db.scanCredit.findUnique({
        where: { id: scan.creditId },
      });
      if (credit) {
        scansRemaining = credit.totalScans - credit.scansUsed;
        totalScans = credit.totalScans;
      }
    }

    // For PRO scans, fetch daily remaining
    if (scan.scanType === 'PRO' && scan.userId) {
      const proSub = await db.proSubscription.findUnique({
        where: { userId: scan.userId },
      });
      if (proSub) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastScanDate = proSub.lastScanDate ? new Date(proSub.lastScanDate) : null;
        lastScanDate?.setHours(0, 0, 0, 0);

        let scansToday = proSub.scansToday;
        if (!lastScanDate || lastScanDate.getTime() < today.getTime()) {
          scansToday = 0;
        }

        scansRemaining = proSub.dailyScanLimit - scansToday;
        totalScans = proSub.dailyScanLimit;
      }
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
        scanType: scan.scanType,
        phone: scan.phone,
        fileName: scan.fileName,
        scansRemaining,
        totalScans,
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
