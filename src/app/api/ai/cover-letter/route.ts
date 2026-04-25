import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Require authentication to prevent AI credit abuse
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const { jobDescription, tone } = body;

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Job description is required.' },
        { status: 400 }
      );
    }

    if (jobDescription.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Please provide a more detailed job description.' },
        { status: 400 }
      );
    }

    // Use session userId to prevent IDOR — ignore client-supplied userId
    const userId = session.user.id;

    // Fetch user profile
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const profile = user.profile;
    const toneOption = tone || 'Professional';

    // Build profile context
    const profileContext: string[] = [];
    if (user.name) profileContext.push(`Name: ${user.name}`);
    if (profile?.title) profileContext.push(`Title: ${profile.title}`);
    if (profile?.summary) profileContext.push(`Summary: ${profile.summary}`);
    if (profile?.skills) {
      try {
        const skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills;
        if (Array.isArray(skills) && skills.length > 0) {
          profileContext.push(`Skills: ${skills.join(', ')}`);
        }
      } catch {}
    }
    if (profile?.experience) {
      try {
        const exp = typeof profile.experience === 'string' ? JSON.parse(profile.experience) : profile.experience;
        if (Array.isArray(exp) && exp.length > 0) {
          const expSummary = exp
            .slice(0, 3)
            .map((e: any) => `${e.role || e.position} at ${e.company}`)
            .join('; ');
          profileContext.push(`Experience: ${expSummary}`);
        }
      } catch {}
    }
    if (profile?.education) {
      try {
        const edu = typeof profile.education === 'string' ? JSON.parse(profile.education) : profile.education;
        if (Array.isArray(edu) && edu.length > 0) {
          const eduSummary = edu
            .slice(0, 2)
            .map((e: any) => `${e.degree} in ${e.field} from ${e.institution}`)
            .join('; ');
          profileContext.push(`Education: ${eduSummary}`);
        }
      } catch {}
    }
    if (profile?.location) profileContext.push(`Location: ${profile.location}`);

    const zai = await ZAI.create();

    const prompt = `You are a professional cover letter writer for the Kenyan job market. Write a compelling, ${toneOption.toLowerCase()} cover letter based on the applicant's profile and the job description.

APPLICANT PROFILE:
${profileContext.length > 0 ? profileContext.join('\n') : 'No profile information available. Use generic professional language.'}

JOB DESCRIPTION:
${jobDescription.trim()}

TONE: ${toneOption}

Requirements:
- Write a professional cover letter (300-500 words)
- Address the specific requirements from the job description
- Highlight relevant skills and experience
- Include a strong opening and closing
- Use a formal business letter format
- Be authentic and avoid generic templates
- Mention "JobReady Kenya" or the platform name only if natural
- Do not include placeholder text like [Company Name] — use generic professional phrasing if specific details are unknown
- Return ONLY the cover letter text, no explanation or metadata

COVER LETTER:`;

    try {
      const completion = await zai.createChatCompletion({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert cover letter writer for the Kenyan job market. Return only the cover letter text. No explanation, no markdown formatting, no code blocks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
      });

      const coverLetter = (completion.choices?.[0]?.message?.content || '').trim();

      return NextResponse.json({
        success: true,
        coverLetter,
      });
    } catch (aiError) {
      console.error('AI cover letter error:', aiError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate cover letter. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
