import { db } from '@/lib/db'

// ─── Config ──────────────────────────────────────────────────────────────────

const SMS_API_BASE = process.env.SMS_API_BASE || 'https://bulksms.talksasa.com/api/v3'
const SMS_API_TOKEN = process.env.SMS_API_TOKEN || '2659|FnfdH7nCnLtOkVf1p37QQWPKp5DNnt7tN7MV718b16a3065f'
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'TALK-SASA'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SendSMSResult {
  success: boolean
  error?: string
}

// ─── formatPhoneKenya ────────────────────────────────────────────────────────

/**
 * Normalize any Kenyan phone number to the 254... format.
 *
 * Accepted inputs:
 *   - "0712345678"       → "254712345678"
 *   - "+254712345678"    → "254712345678"
 *   - "254712345678"     → "254712345678"
 *   - "+254 712 345 678" → "254712345678" (spaces stripped)
 *
 * Returns the formatted number or throws if the format is unrecognised.
 */
export function formatPhoneKenya(phone: string): string {
  // Strip all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Already in 254... format
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned
  }

  // Starts with 0 (local format)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `254${cleaned.slice(1)}`
  }

  // Starts with 7 or 1 (shortened — e.g. 712345678)
  if (/^[71]/.test(cleaned) && cleaned.length === 9) {
    return `254${cleaned}`
  }

  throw new Error(`Invalid Kenyan phone number: "${phone}". Expected format: 07XXXXXXXX or +2547XXXXXXXX.`)
}

// ─── sendOTP ─────────────────────────────────────────────────────────────────

/**
 * Send an OTP via SMS through the Talk-Sasa gateway.
 * Also logs the message to the SmsLog table.
 */
export async function sendOTP(phone: string, otp: string): Promise<SendSMSResult> {
  let formattedPhone: string

  try {
    formattedPhone = formatPhoneKenya(phone)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid phone number'
    return { success: false, error: message }
  }

  const recipient = `+${formattedPhone}`
  const message = `Your JobReady verification code is ${otp}. Valid for 5 minutes.`

  try {
    const response = await fetch(`${SMS_API_BASE}/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SMS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient,
        sender_id: SMS_SENDER_ID,
        type: 'plain',
        message,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[sms] Gateway error ${response.status}:`, errorBody)

      // Log failed attempt
      try {
        await db.smsLog.create({
          data: {
            phone: formattedPhone,
            message,
            otp,
            purpose: 'phone_verification',
            status: `failed_${response.status}`,
          },
        })
      } catch (dbErr) {
        console.error('[sms] Failed to log failed SMS:', dbErr)
      }

      return { success: false, error: `SMS gateway returned status ${response.status}` }
    }

    const result = await response.json()

    // Log successful SMS
    try {
      await db.smsLog.create({
        data: {
          phone: formattedPhone,
          message,
          otp,
          purpose: 'phone_verification',
          status: 'sent',
          gatewayRef: typeof result === 'object' && result !== null && 'id' in result
            ? String(result.id)
            : undefined,
        },
      })
    } catch (dbErr) {
      console.error('[sms] Failed to log SMS:', dbErr)
    }

    return { success: true }
  } catch (error) {
    console.error('[sms] Failed to send OTP:', error)

    // Log network error
    try {
      await db.smsLog.create({
        data: {
          phone: formattedPhone,
          message,
          otp,
          purpose: 'phone_verification',
          status: 'failed_network',
        },
      })
    } catch (dbErr) {
      console.error('[sms] Failed to log network error:', dbErr)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    }
  }
}
