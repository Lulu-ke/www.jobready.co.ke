import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Token expiry: 1 hour
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Always return success to avoid revealing whether email exists
    if (user) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Store the hashed token and expiry on the user record
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
        },
      });

      // Send the reset email
      try {
        const { createTransport } = await import('nodemailer');

        if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
          console.error('[forgot-password] SMTP not configured, cannot send reset email');
          return NextResponse.json({
            message: 'If an account exists with this email, a password reset link has been sent.',
          });
        }

        const transport = createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://www.jobready.co.ke';
        const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 28px 36px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">JobReady</h1>
              <p style="margin: 6px 0 0; color: #ccfbf1; font-size: 14px;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 12px; text-align: center;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                Reset Password
              </a>
              <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px 28px; text-align: center;">
              <p style="margin: 0; color: #d1d5db; font-size: 12px;">
                &copy; ${new Date().getFullYear()} JobReady.co.ke — All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

        await transport.sendMail({
          from: `"JobReady" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Reset your JobReady password',
          html,
        });

        console.log(`[forgot-password] Reset email sent to ${email}`);
      } catch (emailError) {
        console.error('[forgot-password] Failed to send reset email:', emailError);
      }
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
