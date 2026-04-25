import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
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
    const { role, industry } = body;

    if (!role || typeof role !== 'string' || role.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a job role or title.' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const industryContext = industry?.trim()
      ? ` in the ${industry.trim()} industry`
      : '';

    const prompt = `You are a career expert for the Kenyan job market. Suggest relevant skills for a "${role.trim()}" role${industryContext}.

Requirements:
- Return a JSON array of skill strings (no explanation, no markdown)
- Include both technical/hard skills and soft skills
- Focus on skills that are most in-demand in Kenya
- Include 10-15 relevant skills
- Skills should be commonly found in job descriptions for this role
- Return ONLY the JSON array, nothing else

Example format:
["Skill 1", "Skill 2", "Skill 3"]`;

    try {
      const completion = await zai.createChatCompletion({
        messages: [
          {
            role: 'system',
            content:
              'You are a career expert. Return only a JSON array of skill strings. No explanation, no markdown, no code blocks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      });

      const response = completion.choices?.[0]?.message?.content || '';

      let skills: string[];
      try {
        let cleaned = response.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned);
        skills = Array.isArray(parsed) ? parsed.map((s: any) => String(s).trim()).filter(Boolean) : [];
      } catch {
        // Fallback: try to extract from text
        skills = response
          .replace(/[\[\]""']/g, '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.length < 50)
          .slice(0, 15);
      }

      return NextResponse.json({
        success: true,
        skills,
      });
    } catch (aiError) {
      console.error('AI suggest skills error:', aiError);
      return NextResponse.json({
        success: true,
        skills: ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Time Management', 'Microsoft Office', 'Adaptability'],
        note: 'AI suggestion unavailable. Showing generic skills.',
      });
    }
  } catch (error) {
    console.error('Suggest skills error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to suggest skills.' },
      { status: 500 }
    );
  }
}
