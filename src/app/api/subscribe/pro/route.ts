import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { initiateSTKPush } from '@/lib/mpesa'

/**
 * POST /api/subscribe/pro
 *
 * Initiates a Pro subscription payment via M-Pesa STK Push.
 * The callback at /api/mpesa/callback handles the actual subscription activation.
 *
 * Request body:
 *   phone   – string  (Kenyan phone number, e.g. "0712345678")
 *   userId? – string  (optional — linked user id for logged-in users)
 */
export async function POST(req: NextRequest) {
  try {
    // ── Parse & validate request body ──────────────────────────────────────
    const body = (await req.json()) as {
      phone?: string
      userId?: string
    }

    const { phone, userId } = body

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 },
      )
    }

    // Validate phone format — Kenyan phone number
    const cleanedPhone = phone.replace(/[\s\-\+]/g, '')
    const phoneRegex = /^(\+?254|0)?[71]\d{8}$/
    if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid phone number. Provide a valid Kenyan number (e.g. 0712345678).',
        },
        { status: 400 },
      )
    }

    // ── Check if user already has an active Pro subscription ──────────────
    if (userId) {
      const existingSub = await db.proSubscription.findUnique({
        where: { userId },
      })

      if (existingSub && existingSub.status === 'ACTIVE') {
        // Check if subscription is still within the current period
        if (new Date(existingSub.currentPeriodEnd) > new Date()) {
          return NextResponse.json(
            {
              success: false,
              error:
                'You already have an active Pro subscription. It will be extended when you renew.',
              currentPeriodEnd: existingSub.currentPeriodEnd,
            },
            { status: 409 },
          )
        }
      }
    }

    // ── Constants ──────────────────────────────────────────────────────────
    const PRO_AMOUNT = 500 // KES
    const DESCRIPTION = 'Pro CV Sub'

    // ── Determine environment ──────────────────────────────────────────────
    const isProduction = process.env.NODE_ENV === 'production'

    // ── Initiate M-Pesa STK Push ───────────────────────────────────────────
    const stkResult = await initiateSTKPush({
      phone: cleanedPhone,
      amount: PRO_AMOUNT,
      description: DESCRIPTION,
      userId,
      isProduction,
    })

    // If Daraja returned a non-zero ResponseCode the request was not accepted
    if (stkResult.ResponseCode !== '0') {
      return NextResponse.json(
        {
          success: false,
          error:
            stkResult.ResponseDescription ||
            'STK Push request was rejected by M-Pesa.',
        },
        { status: 400 },
      )
    }

    // ── Persist the payment record ─────────────────────────────────────────
    const payment = await db.mpesaPayment.create({
      data: {
        phone: cleanedPhone,
        amount: PRO_AMOUNT,
        purpose: 'pro_subscription',
        merchantReqId: stkResult.MerchantRequestID,
        checkoutReqId: stkResult.CheckoutRequestID,
        status: 'PENDING',
        userId: userId || null,
      },
    })

    // ── Return success ────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: 'M-Pesa payment initiated. Please enter your PIN on your phone.',
      checkoutRequestId: payment.checkoutReqId,
      merchantRequestId: payment.merchantReqId,
      paymentId: payment.id,
      amount: PRO_AMOUNT,
      phoneMasked: `****${cleanedPhone.slice(-4)}`,
    })
  } catch (error) {
    console.error('[Pro Subscribe Error]', error)
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
