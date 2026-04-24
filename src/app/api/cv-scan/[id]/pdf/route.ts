import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#10b981' // green
  if (score >= 60) return '#f59e0b' // amber
  if (score >= 40) return '#f97316' // orange
  return '#ef4444' // red
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

function formatScoreBar(score: number, label: string): string {
  const color = scoreColor(score)
  const pct = Math.min(100, Math.max(0, score))
  return `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 180px;">
        ${label}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; width: 300px;">
        <div style="background: #f3f4f6; border-radius: 8px; overflow: hidden; height: 24px; position: relative;">
          <div style="background: ${color}; height: 100%; width: ${pct}%; border-radius: 8px; transition: width 0.3s;"></div>
          <span style="position: absolute; right: 8px; top: 2px; font-size: 13px; font-weight: 700; color: #1f2937;">${score}/100</span>
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: ${color}; font-weight: 600; text-align: right; width: 120px;">
        ${scoreLabel(score)}
      </td>
    </tr>`
}

function buildIssuesSection(issues: unknown[]): string {
  if (!issues || issues.length === 0) return ''

  const items = (issues as string[]).map(
    (issue) =>
      `<li style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6; font-size: 14px;">
        <span style="color: #ef4444; margin-right: 8px; font-weight: 600;">&#10005;</span>${escapeHtml(String(issue))}
      </li>`
  ).join('')

  return `
    <div style="margin-top: 32px;">
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 6px; height: 24px; background: #ef4444; border-radius: 3px;"></span>
        Issues Found (${issues.length})
      </h3>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px;">
        <ul style="list-style: none; margin: 0; padding: 0;">${items}</ul>
      </div>
    </div>`
}

function buildImprovementsSection(improvements: unknown[]): string {
  if (!improvements || improvements.length === 0) return ''

  const items = (improvements as string[]).map(
    (imp) =>
      `<li style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6; font-size: 14px;">
        <span style="color: #10b981; margin-right: 8px; font-weight: 600;">&#10003;</span>${escapeHtml(String(imp))}
      </li>`
  ).join('')

  return `
    <div style="margin-top: 32px;">
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 6px; height: 24px; background: #10b981; border-radius: 3px;"></span>
        Suggested Improvements (${improvements.length})
      </h3>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px;">
        <ul style="list-style: none; margin: 0; padding: 0;">${items}</ul>
      </div>
    </div>`
}

function buildSkillGapsSection(skillGaps: unknown): string {
  if (!skillGaps || typeof skillGaps !== 'object') return ''

  const gaps = skillGaps as Record<string, string[]>
  const keys = Object.keys(gaps)
  if (keys.length === 0) return ''

  const sections = keys.map(
    (category) => `
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 8px;">${escapeHtml(category)}</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${gaps[category]
            .map(
              (skill) =>
                `<span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; border: 1px solid #fde68a;">
                  ${escapeHtml(skill)}
                </span>`
            )
            .join('')}
        </div>
      </div>`
  ).join('')

  return `
    <div style="margin-top: 32px;">
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 6px; height: 24px; background: #f59e0b; border-radius: 3px;"></span>
        Skill Gaps
      </h3>
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
        ${sections}
      </div>
    </div>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildHTMLReport(scan: {
  atsScore: number
  keywordMatch: number
  formatScore: number
  sectionScore: number
  readabilityScore: number
  skillGaps: unknown
  suggestions: unknown
  improvements: unknown
  issues: unknown
  fileName?: string | null
  jobDescription?: string | null
  createdAt: Date
  email?: string | null
}): string {
  const overallColor = scoreColor(scan.atsScore)
  const overallGrade = scoreLabel(scan.atsScore)
  const date = new Date(scan.createdAt).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV ATS Scan Report — JobReady Kenya</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 32px 40px; color: white;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
          <span style="opacity: 0.9;">&#9733;</span> JobReady Kenya
        </div>
        <div style="font-size: 14px; opacity: 0.85; margin-top: 4px;">ATS CV Scan Report</div>
      </div>
      <div style="text-align: right; font-size: 13px; opacity: 0.85;">
        <div>${date}</div>
        <div style="margin-top: 2px;">${scan.fileName ? `File: ${escapeHtml(scan.fileName)}` : ''}</div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div style="max-width: 800px; margin: 0 auto; padding: 32px 40px;">

    <!-- Overall Score -->
    <div style="text-align: center; margin: 24px 0 40px;">
      <div style="display: inline-block; position: relative; width: 160px; height: 160px;">
        <svg viewBox="0 0 36 36" style="width: 160px; height: 160px; transform: rotate(-90deg);">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="#f3f4f6" stroke-width="2.5"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="${overallColor}" stroke-width="2.5"
            stroke-dasharray="${scan.atsScore}, 100"
            stroke-linecap="round"
          />
        </svg>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
          <div style="font-size: 42px; font-weight: 800; color: ${overallColor}; line-height: 1;">${scan.atsScore}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">/ 100</div>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <span style="display: inline-block; background: ${overallColor}15; color: ${overallColor}; padding: 6px 20px; border-radius: 20px; font-size: 16px; font-weight: 700; border: 2px solid ${overallColor}40;">
          ${overallGrade}
        </span>
      </div>
      <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">
        Overall ATS Compatibility Score
      </div>
    </div>

    <!-- Score Breakdown Table -->
    <div style="margin-top: 32px;">
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 6px; height: 24px; background: #0d9488; border-radius: 3px;"></span>
        Score Breakdown
      </h3>
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            ${formatScoreBar(scan.keywordMatch, 'Keyword Match')}
            ${formatScoreBar(scan.formatScore, 'Format & Structure')}
            ${formatScoreBar(scan.sectionScore, 'Section Completeness')}
            ${formatScoreBar(scan.readabilityScore, 'Readability')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Skill Gaps -->
    ${buildSkillGapsSection(scan.skillGaps)}

    <!-- Issues -->
    ${buildIssuesSection(scan.issues as unknown[])}

    <!-- Improvements -->
    ${buildImprovementsSection(scan.improvements as unknown[])}

    <!-- What This Score Means -->
    <div style="margin-top: 32px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">
        What This Score Means
      </h3>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.7; margin: 0;">
        ${scan.atsScore >= 80
          ? 'Your CV is well-optimized for Applicant Tracking Systems (ATS). It effectively uses relevant keywords, has a clean structure, and covers all key sections. You have a strong chance of passing automated screening for most positions.'
          : scan.atsScore >= 60
          ? 'Your CV is reasonably ATS-friendly but could benefit from targeted improvements. Focus on strengthening the areas highlighted above — especially adding more relevant keywords and ensuring consistent formatting.'
          : scan.atsScore >= 40
          ? 'Your CV needs significant improvements to pass ATS screening. Prioritize adding keywords from the job description, restructuring sections for clarity, and ensuring all text is machine-readable (avoid images for important content).'
          : 'Your CV has critical ATS compatibility issues. Most applicant tracking systems will struggle to parse it correctly. Consider a complete rewrite with a focus on simple formatting, relevant keywords, and standard section headings.'}
      </p>
    </div>

    <!-- Next Steps -->
    <div style="margin-top: 32px; padding: 20px; background: linear-gradient(135deg, #f0fdfa, #f0fdf4); border-radius: 12px; border: 1px solid #99f6e4;">
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">
        Recommended Next Steps
      </h3>
      <ol style="font-size: 14px; color: #6b7280; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Address the issues listed above in order of priority</li>
        <li>Add missing skills and keywords from your target job description</li>
        <li>Ensure consistent formatting throughout (fonts, bullet styles, date formats)</li>
        <li>Save as .docx or .pdf (not .doc) before submitting</li>
        <li>Rescan your CV after making changes to track improvement</li>
      </ol>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 40px; margin-top: 48px; text-align: center;">
    <div style="font-size: 14px; color: #9ca3af;">
      This report was generated by <strong style="color: #0d9488;">JobReady Kenya</strong> &mdash; Your partner in career success.
    </div>
    <div style="font-size: 12px; color: #d1d5db; margin-top: 8px;">
      Generated on ${date} &bull; Report ID: ${scan.createdAt.getTime()} &bull; jobready.co.ke
    </div>
  </div>

  <!-- Print Button (hidden when printing) -->
  <div class="no-print" style="position: fixed; bottom: 24px; right: 24px;">
    <button onclick="window.print()" style="background: #0d9488; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
      &#128438; Save as PDF
    </button>
  </div>
</body>
</html>`
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Scan ID is required.' },
        { status: 400 },
      )
    }

    // Fetch the scan from the database
    const scan = await db.cVScan.findUnique({
      where: { id },
    })

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found.' },
        { status: 404 },
      )
    }

    // Generate the HTML report
    const html = buildHTMLReport({
      atsScore: scan.atsScore,
      keywordMatch: scan.keywordMatch,
      formatScore: scan.formatScore,
      sectionScore: scan.sectionScore,
      readabilityScore: scan.readabilityScore,
      skillGaps: scan.skillGaps,
      suggestions: scan.suggestions,
      improvements: scan.improvements,
      issues: scan.issues,
      fileName: scan.fileName,
      jobDescription: scan.jobDescription,
      createdAt: scan.createdAt,
      email: scan.email,
    })

    // Return the HTML report as a downloadable file
    const filename = `cv-report-${scan.atsScore}score-${scan.id.slice(0, 8)}.html`

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Generate CV report error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report.' },
      { status: 500 },
    )
  }
}
