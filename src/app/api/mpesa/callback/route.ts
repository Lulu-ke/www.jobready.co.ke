import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone } from '@/lib/phone';

interface CallbackMetadataItem {
  Name: string;
  Value?: string | number;
}

interface StkCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: CallbackMetadataItem[];
      };
    };
  };
}

function extractMetadata(items: CallbackMetadataItem[], name: string): string | number | undefined {
  const item = items.find((i) => i.Name === name);
  return item?.Value;
}

export async function POST(request: NextRequest) {
  try {
    const body: StkCallbackBody = await request.json();
    const { stkCallback } = body.Body;

    const {
      MerchantRequestID: merchantReqId,
      CheckoutRequestID: checkoutReqId,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
      CallbackMetadata: callbackMetadata,
    } = stkCallback;

    if (!checkoutReqId) {
      console.error('[M-Pesa Callback] Missing CheckoutRequestID');
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Find the payment record
    const payment = await db.mpesaPayment.findUnique({
      where: { checkoutReqId },
    });

    if (!payment) {
      console.error(`[M-Pesa Callback] No payment found for checkoutReqId: ${checkoutReqId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      // Payment successful
      const amount = callbackMetadata
        ? Number(extractMetadata(callbackMetadata.Item, "Amount") ?? payment.amount)
        : payment.amount;
      const mpesaReceiptNumber = callbackMetadata
        ? String(extractMetadata(callbackMetadata.Item, "MpesaReceiptNumber") ?? "")
        : "";
      const phoneNumber = callbackMetadata
        ? String(extractMetadata(callbackMetadata.Item, "PhoneNumber") ?? payment.phone)
        : payment.phone;

      if (payment.purpose === 'pro_subscription') {
        // Handle Pro subscription activation/extension
        const existingSub = await db.proSubscription.findUnique({
          where: payment.userId ? { userId: payment.userId } : undefined,
        });

        if (existingSub && existingSub.status === 'ACTIVE' && new Date(existingSub.currentPeriodEnd) > new Date()) {
          // Extend existing subscription by 30 days
          const currentEnd = new Date(existingSub.currentPeriodEnd);
          currentEnd.setDate(currentEnd.getDate() + 30);
          await db.proSubscription.update({
            where: { id: existingSub.id },
            data: {
              currentPeriodEnd: currentEnd,
              amountPaid: { increment: amount },
              mpesaRef: mpesaReceiptNumber,
            },
          });
          console.log(`[M-Pesa Callback] Pro subscription EXTENDED for user ${payment.userId}`);
        } else if (payment.userId) {
          // Create new Pro subscription
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);
          await db.proSubscription.upsert({
            where: { userId: payment.userId },
            create: {
              userId: payment.userId,
              status: 'ACTIVE',
              amountPaid: amount,
              mpesaRef: mpesaReceiptNumber,
              dailyScanLimit: 4,
              scansToday: 0,
              currentPeriodEnd: periodEnd,
            },
            update: {
              status: 'ACTIVE',
              amountPaid: amount,
              mpesaRef: mpesaReceiptNumber,
              scansToday: 0,
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
            },
          });
          console.log(`[M-Pesa Callback] Pro subscription CREATED for user ${payment.userId}`);
        }

        // Update payment record
        await db.mpesaPayment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            mpesaRef: mpesaReceiptNumber,
            resultDesc,
            callbackRaw: body as any,
            merchantReqId,
          },
        });
      } else {
        // Handle scan credits purchase
        const normalizedPhone = normalizePhone(phoneNumber) || payment.phone;
        const credit = await db.scanCredit.create({
          data: {
            phone: normalizedPhone,
            totalScans: 4,
            scansUsed: 0,
            amountPaid: amount,
            mpesaRef: mpesaReceiptNumber,
            isActive: true,
            userId: payment.userId,
          },
        });

        await db.mpesaPayment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            mpesaRef: mpesaReceiptNumber,
            resultDesc,
            callbackRaw: body as any,
            merchantReqId,
            creditId: credit.id,
          },
        });

        console.log(
          `[M-Pesa Callback] SUCCESS — checkoutReqId: ${checkoutReqId}, receipt: ${mpesaReceiptNumber}, amount: ${amount}, creditId: ${credit.id}`
        );
      }
    } else {
      // Payment failed
      await db.mpesaPayment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          resultDesc,
          callbackRaw: body as any,
          merchantReqId,
        },
      });

      console.log(
        `[M-Pesa Callback] FAILED — checkoutReqId: ${checkoutReqId}, resultCode: ${resultCode}, resultDesc: ${resultDesc}`
      );
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[M-Pesa Callback] Error processing callback:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
