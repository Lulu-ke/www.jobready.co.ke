import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizePhone } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const contentType = request.headers.get('content-type') || '';

    let cvText = '';
    let jobDescription = '';
    let email = '';
    let phone = '';
    let creditId = '';
    let fileName = '';

    // Parse based on content type
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const cvFile = formData.get('file') as File | null;
      cvText = (formData.get('cvText') as string) || '';
      jobDescription = (formData.get('jobDescription') as string) || '';
      email = (formData.get('email') as string) || '';
      phone = (formData.get('phone') as string) || '';
      creditId = (formData.get('creditId') as string) || '';

      if (cvFile && cvFile.size > 0) {
        fileName = cvFile.name;
        const buffer = Buffer.from(await cvFile.arrayBuffer());
        const { parseCVFile } = await import('@/lib/file-parser');
        const result = await parseCVFile(buffer, cvFile.name, cvFile.type);
        if (result.error) {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
          );
        }
        cvText = result.text;
      }
    } else {
      const body = await request.json();
      cvText = body.cvText || '';
      jobDescription = body.jobDescription || '';
      email = body.email || '';
      phone = body.phone || '';
      creditId = body.creditId || '';
      fileName = body.fileName || '';
    }

    if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'CV text must be at least 50 characters.' },
        { status: 400 }
      );
    }

    // ─── CREDIT CHECK ───
    let scanType: 'ANONYMOUS_PAID' | 'LOGGED_IN_FREE' | 'LOGGED_IN_PAID' | 'PRO' = 'ANONYMOUS_PAID';

    if (userId) {
      // Check pro subscription first
      const proSub = await db.proSubscription.findUnique({
        where: { userId },
      });

      if (proSub && proSub.status === 'ACTIVE' && new Date(proSub.currentPeriodEnd) > new Date()) {
        // Pro user — check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastScanDate = proSub.lastScanDate ? new Date(proSub.lastScanDate) : null;
        lastScanDate?.setHours(0, 0, 0, 0);

        let scansToday = proSub.scansToday;
        if (!lastScanDate || lastScanDate.getTime() < today.getTime()) {
          scansToday = 0;
          await db.proSubscription.update({
            where: { id: proSub.id },
            data: { scansToday: 0 },
          });
        }

        if (scansToday >= proSub.dailyScanLimit) {
          return NextResponse.json(
            { success: false, error: 'Daily scan limit reached (4/day). Upgrade or wait until tomorrow.', code: 'LIMIT_REACHED' },
            { status: 403 }
          );
        }

        scanType = 'PRO';
      } else {
        // Check free scan
        const freeScanCount = await db.cVScan.count({
          where: { userId, scanType: 'LOGGED_IN_FREE' },
        });

        if (freeScanCount === 0) {
          scanType = 'LOGGED_IN_FREE';
        } else {
          // Check paid credits for this user
          if (creditId) {
            const credit = await db.scanCredit.findUnique({
              where: { id: creditId },
            });
            if (!credit || !credit.isActive || credit.scansUsed >= credit.totalScans) {
              return NextResponse.json(
                { success: false, error: 'Invalid or expired scan credits.', code: 'NO_CREDITS' },
                { status: 403 }
              );
            }
            scanType = 'LOGGED_IN_PAID';
          } else {
            // Try auto-find an active credit
            const activeCredit = await db.scanCredit.findFirst({
              where: {
                userId,
                isActive: true,
                scansUsed: { lt: db.scanCredit.fields.totalScans },
              },
              orderBy: { createdAt: 'desc' },
            });
            if (activeCredit) {
              creditId = activeCredit.id;
              scanType = 'LOGGED_IN_PAID';
            } else {
              return NextResponse.json(
                { success: false, error: 'No scan credits remaining. Please purchase more scans.', code: 'NO_CREDITS' },
                { status: 403 }
              );
            }
          }
        }
      }
    } else {
      // Anonymous user — must have credit
      if (!creditId) {
        // Try auto-find by phone number (normalize to 254 format)
        const normalizedPhone = normalizePhone(phone);
        if (normalizedPhone) {
          const phoneCredit = await db.scanCredit.findFirst({
            where: {
              phone: normalizedPhone,
              isActive: true,
              scansUsed: { lt: db.scanCredit.fields.totalScans },
            },
            orderBy: { createdAt: 'desc' },
          });
          if (phoneCredit) {
            creditId = phoneCredit.id;
          } else {
            return NextResponse.json(
              { success: false, error: 'Payment required. Please purchase scan credits.', code: 'PAYMENT_REQUIRED' },
              { status: 402 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Payment required. Please purchase scan credits.', code: 'PAYMENT_REQUIRED' },
            { status: 402 }
          );
        }
      }

      const credit = await db.scanCredit.findUnique({
        where: { id: creditId },
      });
      if (!credit || !credit.isActive || credit.scansUsed >= credit.totalScans) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired scan credits.', code: 'NO_CREDITS' },
          { status: 403 }
        );
      }
    }

    // ─── AI ANALYSIS ───
    const zai = await ZAI.create();

    const jobDescContext = jobDescription?.trim()
      ? `\n\nJOB DESCRIPTION (for keyword matching):\n${jobDescription.trim()}`
      : '';

    const prompt = `You are an expert ATS (Applicant Tracking System) CV analyzer. Analyze the following CV text and return a JSON object with scores and recommendations.

CV TEXT:
${cvText.trim()}
${jobDescContext}

Analyze this CV and return ONLY a valid JSON object (no markdown, no code blocks, no explanation) with this exact structure:
{
  "atsScore": <number 0-100 overall ATS compatibility>,
  "keywordMatch": <number 0-100 how well keywords match the job description>,
  "formatScore": <number 0-100 formatting quality>,
  "sectionScore": <number 0-100 section completeness>,
  "readabilityScore": <number 0-100 readability and clarity>,
  "issues": [
    { "category": "<one of: 'Missing Sections', 'Formatting Issues', 'ATS Red Flags'>", "severity": "<low|medium|high>", "message": "<specific issue description>" }
  ],
  "improvements": [
    { "title": "<improvement title>", "description": "<detailed actionable description>", "impact": "<low|medium|high>" }
  ],
  "skillGaps": [<array of skill names from job description not found in CV>],
  "suggestions": { "summary": "<brief overall summary of the CV quality>" }
}

Scoring guidelines:
- atsScore: Overall ATS friendliness. Penalize: tables, images, fancy fonts, non-standard sections, missing contact info, special characters, headers/footers that confuse parsers.
- keywordMatch: If no job description, score based on general keyword density and relevance. If job description provided, score based on how many required skills/keywords appear in the CV.
- formatScore: Evaluate structure: clear sections, consistent bullet points, proper date formatting, clean hierarchy.
- sectionScore: Check for these sections: Professional Summary, Work Experience, Education, Skills. Bonus for: Certifications, Languages, Projects, Volunteer Work.
- readabilityScore: Check sentence length (keep under 25 words), use of action verbs, professional tone, avoid jargon overload.
- Generate at least 5 specific issues and 5 improvements.
- If no job description is provided, set keywordMatch based on general CV quality and skillGaps as empty array.
- Be thorough but realistic — most CVs score between 40-85.`;

    let aiResponse: string;
    try {
      const completion = await zai.createChatCompletion({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert ATS CV analyzer. Always respond with valid JSON only. No markdown, no code blocks, no explanation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });
      aiResponse = completion.choices?.[0]?.message?.content || '';
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      const basicAnalysis = performBasicAnalysis(cvText.trim(), jobDescription?.trim());
      return await saveAndReturn(basicAnalysis, cvText.trim(), jobDescription, email, phone, userId, scanType, creditId, fileName);
    }

    // Parse AI response
    let analysis;
    try {
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      const basicAnalysis = performBasicAnalysis(cvText.trim(), jobDescription?.trim());
      return await saveAndReturn(basicAnalysis, cvText.trim(), jobDescription, email, phone, userId, scanType, creditId, fileName);
    }

    // Validate and clamp scores
    const scores = {
      atsScore: clampScore(analysis.atsScore ?? 50),
      keywordMatch: clampScore(analysis.keywordMatch ?? 50),
      formatScore: clampScore(analysis.formatScore ?? 50),
      sectionScore: clampScore(analysis.sectionScore ?? 50),
      readabilityScore: clampScore(analysis.readabilityScore ?? 50),
    };

    return await saveAndReturn(
      {
        ...scores,
        issues: Array.isArray(analysis.issues) ? analysis.issues : [],
        improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
        skillGaps: Array.isArray(analysis.skillGaps) ? analysis.skillGaps : [],
        suggestions: analysis.suggestions || {},
      },
      cvText.trim(),
      jobDescription,
      email,
      phone,
      userId,
      scanType,
      creditId,
      fileName
    );
  } catch (error) {
    console.error('CV Scan error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

async function saveAndReturn(
  analysis: any,
  cvText: string,
  jobDescription: string | undefined,
  email: string | undefined,
  phone: string | undefined,
  userId: string | null,
  scanType: 'ANONYMOUS_PAID' | 'LOGGED_IN_FREE' | 'LOGGED_IN_PAID' | 'PRO',
  creditId: string,
  fileName: string
) {
  // Create scan record
  const scan = await db.cVScan.create({
    data: {
      userId: userId || undefined,
      email: email || undefined,
      phone: phone || undefined,
      cvText,
      jobDescription: jobDescription || undefined,
      fileName: fileName || undefined,
      atsScore: analysis.atsScore,
      keywordMatch: analysis.keywordMatch,
      formatScore: analysis.formatScore,
      sectionScore: analysis.sectionScore,
      readabilityScore: analysis.readabilityScore,
      issues: analysis.issues,
      improvements: analysis.improvements,
      skillGaps: analysis.skillGaps,
      suggestions: analysis.suggestions || {},
      scanType,
      creditId: creditId || undefined,
      isAnalyzed: true,
    },
  });

  // Consume credit if paid scan
  if (creditId && (scanType === 'ANONYMOUS_PAID' || scanType === 'LOGGED_IN_PAID')) {
    await db.scanCredit.update({
      where: { id: creditId },
      data: { scansUsed: { increment: 1 } },
    });
  }

  // Update pro daily scan count
  if (scanType === 'PRO' && userId) {
    await db.proSubscription.update({
      where: { userId },
      data: {
        scansToday: { increment: 1 },
        lastScanDate: new Date(),
      },
    });
  }

  // Send email if provided
  if (email) {
    try {
      const { sendCVResults } = await import('@/lib/email');
      await sendCVResults({
        to: email,
        scanData: {
          atsScore: analysis.atsScore,
          keywordMatch: analysis.keywordMatch,
          formatScore: analysis.formatScore,
          sectionScore: analysis.sectionScore,
          readabilityScore: analysis.readabilityScore,
          issues: analysis.issues,
          improvements: analysis.improvements,
          skillGaps: analysis.skillGaps,
        },
      }).catch(() => {}); // Don't fail the scan if email fails
    } catch (e) {
      console.error('Email send failed:', e);
    }
  }

  // Calculate remaining credits for response
  let remainingCredits: number | null = null;
  if (creditId) {
    const credit = await db.scanCredit.findUnique({ where: { id: creditId } });
    if (credit) {
      remainingCredits = credit.totalScans - credit.scansUsed;
    }
  }

  return NextResponse.json({
    success: true,
    scanId: scan.id,
    scanType,
    scores: {
      atsScore: analysis.atsScore,
      keywordMatch: analysis.keywordMatch,
      formatScore: analysis.formatScore,
      sectionScore: analysis.sectionScore,
      readabilityScore: analysis.readabilityScore,
    },
    issues: analysis.issues,
    improvements: analysis.improvements,
    skillGaps: analysis.skillGaps,
    remainingCredits,
  });
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
}

function performBasicAnalysis(cvText: string, jobDescription?: string) {
  const lower = cvText.toLowerCase();
  const issues: any[] = [];
  const improvements: any[] = [];

  const sections = ['summary', 'experience', 'education', 'skills'];
  const foundSections = sections.filter((s) => lower.includes(s));
  const missingSections = sections.filter((s) => !lower.includes(s));

  missingSections.forEach((s) => {
    issues.push({
      category: 'Missing Sections',
      severity: 'high',
      message: `No "${s.charAt(0).toUpperCase() + s.slice(1)}" section found.`,
    });
  });

  const sectionScore = Math.round((foundSections.length / sections.length) * 100);

  let atsDeductions = 0;
  if (/[|{}]/.test(cvText)) {
    issues.push({
      category: 'ATS Red Flags',
      severity: 'medium',
      message: 'Special characters like |, {, } may confuse ATS systems.',
    });
    atsDeductions += 10;
  }

  if (cvText.length < 300) {
    issues.push({
      category: 'Formatting Issues',
      severity: 'high',
      message: 'CV appears too short. Aim for at least 1 page of content.',
    });
    atsDeductions += 15;
  }

  const hasEmail = /[@]/.test(cvText) && /[.]/.test(cvText);
  const hasPhone = /\+?\d{3}[\s-]?\d{3}[\s-]?\d{4}/.test(cvText);
  if (!hasEmail) {
    issues.push({
      category: 'Missing Sections',
      severity: 'high',
      message: 'No email address detected in your CV.',
    });
    atsDeductions += 10;
  }
  if (!hasPhone) {
    issues.push({
      category: 'Missing Sections',
      severity: 'medium',
      message: 'No phone number detected in your CV.',
    });
    atsDeductions += 5;
  }

  const actionVerbs = [
    'managed', 'developed', 'created', 'led', 'achieved', 'implemented',
    'designed', 'improved', 'increased', 'reduced', 'analyzed', 'coordinated',
  ];
  const verbCount = actionVerbs.filter((v) => lower.includes(v)).length;
  const formatScore = Math.min(100, 50 + verbCount * 5);

  if (verbCount < 3) {
    improvements.push({
      title: 'Use More Action Verbs',
      description:
        'Start bullet points with strong action verbs like "Managed," "Developed," "Achieved" to demonstrate impact.',
      impact: 'medium',
    });
  }

  let keywordMatch = 50;
  let skillGaps: string[] = [];
  if (jobDescription) {
    const jdWords = jobDescription
      .toLowerCase()
      .split(/[\s,;.]+/)
      .filter((w) => w.length > 4);
    const uniqueJdWords = [...new Set(jdWords)];
    const matched = uniqueJdWords.filter((w) => lower.includes(w));
    keywordMatch = Math.round((matched.length / Math.max(uniqueJdWords.length, 1)) * 100);
    skillGaps = uniqueJdWords
      .filter((w) => !lower.includes(w))
      .slice(0, 10);
  }

  const atsScore = Math.max(0, Math.min(100, 80 - atsDeductions));
  const readabilityScore = Math.min(100, 60 + (cvText.length > 500 ? 20 : cvText.length > 200 ? 10 : 0));

  if (missingSections.length > 0) {
    improvements.push({
      title: 'Add Missing Sections',
      description: `Your CV is missing: ${missingSections.join(', ')}. These sections are essential for ATS systems.`,
      impact: 'high',
    });
  }

  return {
    atsScore,
    keywordMatch,
    formatScore,
    sectionScore,
    readabilityScore,
    issues,
    improvements,
    skillGaps,
    suggestions: {
      summary: 'Basic analysis completed. For a more detailed review, try again later.',
    },
  };
}
