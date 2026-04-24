import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { formatPhoneKenya } from '@/lib/sms'

/**
 * POST /api/sms/verify-otp
 *
 * Verifies a 6-digit OTP sent to a phone number.
 * OTPs are valid for 5 minutes. Only the most recent OTP for a phone+purpose
 * combination is checked.
 *
 * Request body:
 *   phone   – string  (Kenyan phone number)
 *   otp     – string  (6-digit OTP code)
 *   purpose? – string (optional purpose label, default "phone_verification")
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phone?: string
      otp?: string
      purpose?: string
    }

    const { phone, otp, purpose } = body

    // ── Validate phone ─────────────────────────────────────────────────────
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 },
      )
    }

    // Validate format
    let formattedPhone: string
    try {
      formattedPhone = formatPhoneKenya(phone.trim())
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid phone number. Provide a valid Kenyan number (e.g. 0712345678).',
        },
        { status: 400 },
      )
    }

    // ── Validate OTP ───────────────────────────────────────────────────────
    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, error: 'OTP is required.' },
        { status: 400 },
      )
    }

    const cleanedOtp = otp.trim()
    if (!/^\d{6}$/.test(cleanedOtp)) {
      return NextResponse.json(
        { success: false, error: 'OTP must be a 6-digit number.' },
        { status: 400 },
      )
    }

    // ── Look up the most recent SMS log for this phone ────────────────────
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const smsRecord = await db.smsLog.findFirst({
      where: {
        phone: formattedPhone,
        purpose: purpose || 'phone_verification',
        status: 'sent',
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
    })

    // ── No matching record found ───────────────────────────────────────────
    if (!smsRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 },
      )
    }

    // ── Compare OTP (constant-time comparison to prevent timing attacks) ───
    if (!constantTimeEqual(smsRecord.otp || '', cleanedOtp)) {
      // Mark as failed attempt
      await db.smsLog.update({
        where: { id: smsRecord.id },
        data: { status: 'failed_verification' },
      })

      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please check and try again.' },
        { status: 400 },
      )
    }

    // ── OTP verified — mark record ─────────────────────────────────────────
    await db.smsLog.update({
      where: { id: smsRecord.id },
      data: { status: 'verified' },
    })

    // ── Return success ────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Phone number verified successfully.',
      phoneMasked: `****${formattedPhone.slice(-4)}`,
    })
  } catch (error) {
    console.error('[Verify OTP Error]', error)
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

/**
 * Constant-time string comparison to prevent timing attacks on OTP verification.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
