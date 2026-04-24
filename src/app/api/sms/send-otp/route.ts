import { NextRequest, NextResponse } from 'next/server'
import { sendOTP, formatPhoneKenya } from '@/lib/sms'

/**
 * POST /api/sms/send-otp
 *
 * Sends a 6-digit OTP to a Kenyan phone number via SMS.
 *
 * Request body:
 *   phone  – string  (Kenyan phone number, e.g. "0712345678")
 *   purpose? – string (optional purpose label for logging, default "phone_verification")
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phone?: string
      purpose?: string
    }

    const { phone, purpose } = body

    // ── Validate phone ─────────────────────────────────────────────────────
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 },
      )
    }

    // Validate format by attempting to format it
    let formattedPhone: string
    try {
      formattedPhone = formatPhoneKenya(phone.trim())
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid phone number. Provide a valid Kenyan number (e.g. 0712345678 or +254712345678).',
        },
        { status: 400 },
      )
    }

    // ── Rate-limit check: max 3 OTPs per phone in the last 10 minutes ─────
    // We do this in-memory / at the application level.
    // For a production system, use Redis or a similar cache.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const { db } = await import('@/lib/db')
    const recentOtps = await db.smsLog.count({
      where: {
        phone: formattedPhone,
        purpose: purpose || 'phone_verification',
        status: 'sent',
        createdAt: { gte: tenMinutesAgo },
      },
    })

    if (recentOtps >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many OTP requests. Please wait 10 minutes before trying again.',
        },
        { status: 429 },
      )
    }

    // ── Generate 6-digit OTP ──────────────────────────────────────────────
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // ── Send OTP via SMS ──────────────────────────────────────────────────
    const result = await sendOTP(phone.trim(), otp)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send OTP.' },
        { status: 502 },
      )
    }

    // ── Return success ────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully.',
      // Mask phone number in response for privacy
      phoneMasked: `****${formattedPhone.slice(-4)}`,
    })
  } catch (error) {
    console.error('[Send OTP Error]', error)
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
