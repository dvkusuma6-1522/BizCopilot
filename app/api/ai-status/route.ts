import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Checks whether the Gemini API is configured without leaking any keys or secrets.
 */
export async function GET(): Promise<NextResponse<{ available: boolean }>> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const available = Boolean(apiKey && apiKey.trim().length > 0);
  return NextResponse.json(
    { available },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
