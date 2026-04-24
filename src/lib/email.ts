import nodemailer from 'nodemailer'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CVScanData {
  atsScore: number
  keywordMatch: number
  formatScore: number
  sectionScore: number
  readabilityScore: number
  skillGaps?: string[]
  improvements?: string[]
  suggestions?: string[]
  issues?: string[]
}

interface SendCVResultsParams {
  to: string
  scanData: CVScanData
}

interface SendOTPParams {
  to: string
  otp: string
}

// ─── Transport cache ─────────────────────────────────────────────────────────

let cachedTransport: nodemailer.Transporter | null = null

function createTransport(): nodemailer.Transporter {
  if (cachedTransport) return cachedTransport

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env')
  }

  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return cachedTransport
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score < 50) return '#ef4444'   // red
  if (score <= 75) return '#f59e0b'  // amber
  return '#22c55e'                    // green
}

function scoreLabel(score: number): string {
  if (score < 50) return 'Needs Work'
  if (score <= 75) return 'Fair'
  return 'Good'
}

// ─── sendCVResults ───────────────────────────────────────────────────────────

export async function sendCVResults({ to, scanData }: SendCVResultsParams): Promise<boolean> {
  const transport = createTransport()

  const {
    atsScore,
    keywordMatch,
    formatScore,
    sectionScore,
    readabilityScore,
    skillGaps = [],
    improvements = [],
  } = scanData

  const improvementsHtml = improvements.slice(0, 3).map((item, i) => `
    <tr>
      <td style="padding: 10px 14px; background: #fefce8; border-left: 4px solid #f59e0b; font-size: 14px; color: #78350f;">
        <strong>#${i + 1}</strong>&nbsp;&nbsp;${item}
      </td>
    </tr>
  `).join('')

  const skillBadgesHtml = skillGaps.length > 0
    ? skillGaps.map(skill => `
        <span style="display: inline-block; background: #fef2f2; color: #dc2626; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; margin: 3px 2px; border: 1px solid #fecaca;">
          ${skill}
        </span>
      `).join('')
    : '<span style="color: #16a34a; font-size: 14px;">No major skill gaps detected.</span>'

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
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                JobReady CV Checker
              </h1>
              <p style="margin: 8px 0 0; color: #ccfbf1; font-size: 15px;">
                Your CV Analysis Results
              </p>
            </td>
          </tr>

          <!-- ATS Score Hero -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center;">
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Overall ATS Score
              </p>
              <div style="display: inline-block; position: relative; width: 120px; height: 120px;">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor(atsScore)}" stroke-width="8"
                    stroke-dasharray="${(atsScore / 100) * 326.73} 326.73"
                    stroke-linecap="round" transform="rotate(-90 60 60)"/>
                  <text x="60" y="55" text-anchor="middle" fill="${scoreColor(atsScore)}" font-size="32" font-weight="700">
                    ${atsScore}
                  </text>
                  <text x="60" y="74" text-anchor="middle" fill="#9ca3af" font-size="13">/100</text>
                </svg>
              </div>
              <p style="margin: 12px 0 0; color: ${scoreColor(atsScore)}; font-size: 16px; font-weight: 600;">
                ${scoreLabel(atsScore)}
              </p>
            </td>
          </tr>

          <!-- Score Breakdown Table -->
          <tr>
            <td style="padding: 0 40px 28px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Score Breakdown</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Category</th>
                    <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Score</th>
                    <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="padding: 12px 16px; font-size: 14px; color: #374151; font-weight: 500;">ATS Compatibility</td>
                    <td style="padding: 12px 16px; text-align: center; font-size: 16px; font-weight: 700; color: ${scoreColor(atsScore)};">${atsScore}</td>
                    <td style="padding: 12px 16px; font-size: 14px; color: ${scoreColor(atsScore)}; font-weight: 500;">${scoreLabel(atsScore)}</td>
                  </tr>
                  <tr style="border-top: 1px solid #f3f4f6; background-color: #fafafa;">
                    <td style="padding: 12px 16px; font-size: 14px; color: #374151; font-weight: 500;">Keyword Match</td>
                    <td style="padding: 12px 16px; text-align: center; font-size: 16px; font-weight: 700; color: ${scoreColor(keywordMatch)};">${keywordMatch}</td>
                    <td style="padding: 12px 16px; font-size: 14px; color: ${scoreColor(keywordMatch)}; font-weight: 500;">${scoreLabel(keywordMatch)}</td>
                  </tr>
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="padding: 12px 16px; font-size: 14px; color: #374151; font-weight: 500;">Format</td>
                    <td style="padding: 12px 16px; text-align: center; font-size: 16px; font-weight: 700; color: ${scoreColor(formatScore)};">${formatScore}</td>
                    <td style="padding: 12px 16px; font-size: 14px; color: ${scoreColor(formatScore)}; font-weight: 500;">${scoreLabel(formatScore)}</td>
                  </tr>
                  <tr style="border-top: 1px solid #f3f4f6; background-color: #fafafa;">
                    <td style="padding: 12px 16px; font-size: 14px; color: #374151; font-weight: 500;">Sections</td>
                    <td style="padding: 12px 16px; text-align: center; font-size: 16px; font-weight: 700; color: ${scoreColor(sectionScore)};">${sectionScore}</td>
                    <td style="padding: 12px 16px; font-size: 14px; color: ${scoreColor(sectionScore)}; font-weight: 500;">${scoreLabel(sectionScore)}</td>
                  </tr>
                  <tr style="border-top: 1px solid #f3f4f6;">
                    <td style="padding: 12px 16px; font-size: 14px; color: #374151; font-weight: 500;">Readability</td>
                    <td style="padding: 12px 16px; text-align: center; font-size: 16px; font-weight: 700; color: ${scoreColor(readabilityScore)};">${readabilityScore}</td>
                    <td style="padding: 12px 16px; font-size: 14px; color: ${scoreColor(readabilityScore)}; font-weight: 500;">${scoreLabel(readabilityScore)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Top Improvements -->
          ${improvements.length > 0 ? `
          <tr>
            <td style="padding: 0 40px 28px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Top Improvements</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden;">
                <tbody>
                  ${improvementsHtml}
                </tbody>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Skill Gaps -->
          <tr>
            <td style="padding: 0 40px 28px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Skill Gaps</h2>
              <div style="line-height: 2;">
                ${skillBadgesHtml}
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 8px 40px 36px; text-align: center;">
              <a href="/cv-checker" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
                Check Another CV
              </a>
              <p style="margin: 14px 0 0; color: #9ca3af; font-size: 13px;">
                Improve your score and land your dream job in Kenya.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 4px; color: #0d9488; font-size: 15px; font-weight: 600;">JobReady Kenya</p>
              <p style="margin: 0 0 4px; color: #9ca3af; font-size: 13px;">
                Helping Kenyan job seekers build winning CVs
              </p>
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
</html>
  `.trim()

  try {
    await transport.sendMail({
      from: `"JobReady CV Checker" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your CV Analysis Results — Score: ${atsScore}/100`,
      html,
    })
    return true
  } catch (error) {
    console.error('[email] Failed to send CV results:', error)
    return false
  }
}

// ─── sendOTP ─────────────────────────────────────────────────────────────────

export async function sendOTP({ to, otp }: SendOTPParams): Promise<boolean> {
  const transport = createTransport()

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

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 28px 36px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                JobReady
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 12px; text-align: center;">
              <p style="margin: 0 0 6px; color: #6b7280; font-size: 15px;">
                Your verification code is:
              </p>
              <div style="margin: 20px 0; padding: 18px 32px; background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 10px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f766e;">
                  ${otp}
                </span>
              </div>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 13px;">
                This code is valid for <strong style="color: #6b7280;">5 minutes</strong>. Do not share it with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
</html>
  `.trim()

  try {
    await transport.sendMail({
      from: `"JobReady" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your JobReady Verification Code: ${otp}`,
      html,
    })
    return true
  } catch (error) {
    console.error('[email] Failed to send OTP:', error)
    return false
  }
}
