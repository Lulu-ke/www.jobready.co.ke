import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone } from '@/lib/phone';

interface CreditsResponse {
  hasCredits: boolean;
  remainingScans: number;
  tier: 'anonymous' | 'logged_in' | 'pro';
  isPro: boolean;
}

/**
 * GET /api/credits/check
 *
 * Query params:
 *   ?phone=xxx   — check scan credits for a phone number (anonymous/paid user)
 *   ?userId=xxx  — check scan credits for a registered user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const userId = searchParams.get('userId');

    if (!phone && !userId) {
      return NextResponse.json(
        { error: 'Provide either "phone" or "userId" query parameter.' },
        { status: 400 }
      );
    }

    // ── Phone-based check (anonymous or paid-credits flow) ──
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      const activeCredits = normalizedPhone
        ? await db.scanCredit.findMany({
            where: {
              phone: normalizedPhone,
              isActive: true,
            },
          })
        : [];

      const totalRemaining = activeCredits.reduce(
        (sum, credit) => sum + (credit.totalScans - credit.scansUsed),
        0
      );

      return NextResponse.json<CreditsResponse>({
        hasCredits: totalRemaining > 0,
        remainingScans: totalRemaining,
        tier: 'anonymous',
        isPro: false,
      });
    }

    // ── User-based check ──
    if (userId) {
      // Look up the user to get their phone (for ScanCredit matching)
      const user = await db.user.findUnique({
        where: { id: userId! },
        select: { phone: true, proSubscription: true },
      });

      if (!user) {
        // User ID invalid — return no-credits response instead of 404
        return NextResponse.json<CreditsResponse>({
          hasCredits: true,
          remainingScans: 1,
          tier: 'logged_in',
          isPro: false,
        });
      }

      // 1. Check for active Pro subscription
      const now = new Date();
      if (
        user.proSubscription &&
        user.proSubscription.status === 'ACTIVE' &&
        user.proSubscription.currentPeriodEnd > now
      ) {
        const sub = user.proSubscription;

        // Reset scansToday if lastScanDate is not today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastScan = sub.lastScanDate ? new Date(sub.lastScanDate) : null;
        const lastScanDay = lastScan
          ? new Date(lastScan.getFullYear(), lastScan.getMonth(), lastScan.getDate())
          : null;

        let scansToday = sub.scansToday;

        if (lastScanDay && lastScanDay.getTime() !== today.getTime()) {
          // Different day — reset counter
          scansToday = 0;
          await db.proSubscription.update({
            where: { userId },
            data: { scansToday: 0 },
          });
        } else if (!lastScan) {
          // No scans yet today
          scansToday = 0;
        }

        const remaining = Math.max(0, sub.dailyScanLimit - scansToday);

        return NextResponse.json<CreditsResponse>({
          hasCredits: remaining > 0,
          remainingScans: remaining,
          tier: 'pro',
          isPro: true,
        });
      }

      // 2. No active pro sub — check for free scan (logged-in free tier)
      const freeScanCount = await db.cVScan.count({
        where: {
          userId,
          scanType: 'LOGGED_IN_FREE',
        },
      });

      if (freeScanCount === 0) {
        // Has 1 free scan remaining
        return NextResponse.json<CreditsResponse>({
          hasCredits: true,
          remainingScans: 1,
          tier: 'logged_in',
          isPro: false,
        });
      }

      // 3. Check for active ScanCredits (by userId or phone)
      const activeCredits = await db.scanCredit.findMany({
        where: {
          isActive: true,
          OR: [
            { userId },
            ...(user.phone ? [{ phone: user.phone }] : []),
          ],
        },
      });

      const totalRemaining = activeCredits.reduce(
        (sum, credit) => sum + (credit.totalScans - credit.scansUsed),
        0
      );

      if (totalRemaining > 0) {
        return NextResponse.json<CreditsResponse>({
          hasCredits: true,
          remainingScans: totalRemaining,
          tier: 'logged_in',
          isPro: false,
        });
      }

      // No credits available
      return NextResponse.json<CreditsResponse>({
        hasCredits: false,
        remainingScans: 0,
        tier: 'logged_in',
        isPro: false,
      });
    }

    // Should never reach here
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (error) {
    console.error('[Credits Check] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check scan credits.' },
      { status: 500 }
    );
  }
}
