import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/mpesa/status
 *
 * Query params:
 *   ?checkoutRequestId=xxx  — look up a specific payment
 *   ?phone=xxx              — look up the latest payment for a phone number
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');
    const phone = searchParams.get('phone');

    if (!checkoutRequestId && !phone) {
      return NextResponse.json(
        { error: 'Provide either "checkoutRequestId" or "phone" query parameter.' },
        { status: 400 }
      );
    }

    // Look up by checkout request ID (takes priority)
    if (checkoutRequestId) {
      const payment = await db.mpesaPayment.findUnique({
        where: { checkoutReqId: checkoutRequestId },
        include: { credit: true },
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found for the given checkoutRequestId.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: payment.status,
        amount: payment.amount,
        phone: payment.phone,
        mpesaRef: payment.mpesaRef,
        resultDesc: payment.resultDesc,
        createdAt: payment.createdAt,
        ...(payment.credit
          ? {
              credit: {
                id: payment.credit.id,
                totalScans: payment.credit.totalScans,
                scansUsed: payment.credit.scansUsed,
                remainingScans: payment.credit.totalScans - payment.credit.scansUsed,
                isActive: payment.credit.isActive,
              },
            }
          : {}),
      });
    }

    // Look up latest payment by phone number
    if (phone) {
      const payment = await db.mpesaPayment.findFirst({
        where: { phone },
        orderBy: { createdAt: 'desc' },
        include: { credit: true },
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'No payments found for the given phone number.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: payment.status,
        amount: payment.amount,
        phone: payment.phone,
        mpesaRef: payment.mpesaRef,
        resultDesc: payment.resultDesc,
        createdAt: payment.createdAt,
        ...(payment.credit
          ? {
              credit: {
                id: payment.credit.id,
                totalScans: payment.credit.totalScans,
                scansUsed: payment.credit.scansUsed,
                remainingScans: payment.credit.totalScans - payment.credit.scansUsed,
                isActive: payment.credit.isActive,
              },
            }
          : {}),
      });
    }

    // Should never reach here, but TypeScript needs it
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (error) {
    console.error('[M-Pesa Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status.' },
      { status: 500 }
    );
  }
}
