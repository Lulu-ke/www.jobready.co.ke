import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const { cvText } = body;

    if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'CV text (at least 50 characters) is required.' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `You are a CV data extraction assistant. Extract structured information from the following CV text and return it as a JSON object. Only extract information that is clearly present in the CV — do not invent or guess any data.

CV TEXT:
${cvText.trim()}

Return a JSON object with the following structure (omit any fields where no data is found):
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, Country",
  "linkedin": "LinkedIn URL if present",
  "summary": "Professional summary or objective statement",
  "experience": [
    {
      "role": "Job title or position",
      "company": "Company name",
      "startDate": "Start date (e.g. Jan 2022)",
      "endDate": "End date or empty string if current",
      "current": true/false,
      "description": "Responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "School or university name",
      "degree": "Degree type (e.g. BSc, MBA)",
      "field": "Field of study",
      "startYear": "Start year (e.g. 2018)",
      "endYear": "End year (e.g. 2022)"
    }
  ],
  "skills": ["Skill1", "Skill2"],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "year": "Year obtained"
    }
  ],
  "languages": [
    {
      "name": "Language name",
      "proficiency": "Beginner/Intermediate/Advanced/Fluent"
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no markdown formatting, no code blocks, no explanation.
- Use empty arrays [] for sections with no entries found.
- For dates, preserve the original format from the CV.
- Do not include null values — simply omit missing fields.`;

    try {
      const completion = await zai.createChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a CV data extraction assistant. Return only valid JSON, no markdown, no code blocks, no explanation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      });

      let raw = (completion.choices?.[0]?.message?.content || '').trim();

      // Strip markdown code block wrapper if present
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error('[cv-extract] JSON parse error:', raw.substring(0, 200));
        return NextResponse.json({
          success: false,
          error: 'AI returned invalid data. Please try again or enter your details manually.',
        });
      }

      // Validate basic structure
      if (typeof parsed !== 'object' || parsed === null) {
        return NextResponse.json({
          success: false,
          error: 'AI returned invalid data format. Please try again.',
        });
      }

      // Ensure arrays are actually arrays
      if (parsed.experience && !Array.isArray(parsed.experience)) parsed.experience = [];
      if (parsed.education && !Array.isArray(parsed.education)) parsed.education = [];
      if (parsed.skills && !Array.isArray(parsed.skills)) parsed.skills = [];
      if (parsed.certifications && !Array.isArray(parsed.certifications)) parsed.certifications = [];
      if (parsed.languages && !Array.isArray(parsed.languages)) parsed.languages = [];

      return NextResponse.json({ success: true, data: parsed });
    } catch (aiError) {
      console.error('[cv-extract] AI error:', aiError);
      return NextResponse.json({
        success: false,
        error: 'AI extraction failed. Please try again or enter your details manually.',
      });
    }
  } catch (error) {
    console.error('[cv-extract] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract CV data.' },
      { status: 500 }
    );
  }
}
