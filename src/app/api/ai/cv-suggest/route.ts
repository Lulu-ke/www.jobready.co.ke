import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, text, context, jobDescription } = body;

    if (!section || !text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Section name and text (at least 10 characters) are required.' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const jobDescContext = jobDescription?.trim()
      ? `\n\nTARGET JOB DESCRIPTION:\n${jobDescription.trim()}`
      : '';

    const contextInfo = context?.trim()
      ? `\n\nADDITIONAL CONTEXT:\n${context.trim()}`
      : '';

    const prompt = `You are an expert CV writer helping improve a specific section of a CV. Improve the following "${section}" section to make it more professional, impactful, and ATS-friendly.

ORIGINAL TEXT:
${text.trim()}
${contextInfo}${jobDescContext}

Requirements:
- Keep it concise but impactful
- Use strong action verbs
- Make it ATS-friendly (no special characters, tables, or complex formatting)
- Maintain the same language as the original
- Focus on achievements and measurable results where possible
- Do not invent information — enhance what's provided
- Return ONLY the improved text, no explanation or markdown formatting

IMPROVED TEXT:`;

    try {
      const completion = await zai.createChatCompletion({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert CV writer. Return only the improved CV text. No explanation, no markdown formatting, no code blocks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      });

      const improvedText = (completion.choices?.[0]?.message?.content || '').trim();

      return NextResponse.json({
        success: true,
        improvedText,
      });
    } catch (aiError) {
      console.error('AI CV suggest error:', aiError);
      return NextResponse.json({
        success: true,
        improvedText: text.trim(),
        note: 'AI enhancement unavailable. Your original text has been preserved.',
      });
    }
  } catch (error) {
    console.error('CV suggest error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions.' },
      { status: 500 }
    );
  }
}
