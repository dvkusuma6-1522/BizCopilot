import { NextRequest, NextResponse } from 'next/server';

export interface ExtractedBillResponse {
  success: boolean;
  supplierName?: string;
  billDate?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unit?: string;
    unitPrice?: number;
  }>;
  error?: string;
  fallback?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg' } = body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        fallback: true,
        error: 'AI Bill Scanner is offline or API key is not configured. You can enter items manually.',
      });
    }

    // Clean base64 string if data URL prefix was included
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim();

    const promptText = `Analyze this supplier invoice / retail bill image.
Extract the following information in strict, valid JSON format:
{
  "supplierName": "Name of the supplier or distributor (or empty string)",
  "billDate": "YYYY-MM-DD format if visible, else empty string",
  "items": [
    {
      "name": "Item or product description",
      "quantity": 10, // numeric quantity
      "unit": "Kg/Packet/Pcs/Box/Liter if visible",
      "unitPrice": 120 // rate or price per unit if visible, otherwise null
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the raw JSON object. Do not wrap in markdown code blocks like \`\`\`json.
2. If any quantity cannot be determined, default to 1.
3. Keep product names concise as written on the bill.
4. Do not invent items; only transcribe what is visible.`;

    const modelName = 'gemini-1.5-flash';
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini Bill Extract Error:', errText);
      return NextResponse.json({
        success: false,
        fallback: true,
        error: 'Could not process the bill image. Please try again or enter items manually.',
      });
    }

    const data = await geminiRes.json();
    const rawAiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown formatting if returned
    const cleanedJson = rawAiText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!cleanedJson) {
      return NextResponse.json({
        success: false,
        fallback: true,
        error: 'No text could be extracted from this image.',
      });
    }

    try {
      const parsed = JSON.parse(cleanedJson);
      const items = Array.isArray(parsed.items)
        ? parsed.items.map((it: { name?: string; quantity?: unknown; unit?: string; unitPrice?: unknown }) => ({
            name: String(it.name || '').trim(),
            quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
            unit: it.unit ? String(it.unit) : undefined,
            unitPrice: it.unitPrice ? Number(it.unitPrice) : undefined,
          })).filter((it: { name: string }) => it.name.length > 0)
        : [];

      return NextResponse.json({
        success: true,
        supplierName: parsed.supplierName || '',
        billDate: parsed.billDate || '',
        items,
      });
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', rawAiText, parseErr);
      return NextResponse.json({
        success: false,
        fallback: true,
        error: 'Could not format bill items. Please enter manually.',
      });
    }
  } catch (error) {
    console.error('Bill extract route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing bill' },
      { status: 500 }
    );
  }
}
