import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateJson,
  GeminiKeyMissingError,
  GeminiQuotaExceededError,
  isQuotaExceededError,
  getGeminiModel,
} from '@/lib/ai/gemini';
import { checkRateLimit } from '@/lib/ai/rate-limit';

export interface ExtractedBillItem {
  name: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
}

// Node.js runtime required for SDK operations
export const runtime = 'nodejs';
// maxDuration in seconds (plan limits may apply: Hobby limit is 10s-60s depending on plan)
export const maxDuration = 30;

export interface ExtractedBillResponse {
  success: boolean;
  code?: string;
  supplierName?: string;
  billDate?: string;
  items?: ExtractedBillItem[];
  error?: string;
  errorCode?: 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED' | 'KEY_MISSING' | 'AI_NOT_CONFIGURED' | 'FILE_TOO_LARGE' | 'INVALID_INPUT' | 'EXTRACTION_FAILED';
  fallback?: boolean;
}

const BillItemSchema = z.object({
  name: z.string().min(1, 'Item name cannot be empty'),
  quantity: z.number().positive().default(1),
  unit: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
});

const BillExtractResponseSchema = z.object({
  supplierName: z.string().default(''),
  billDate: z.string().default(''),
  items: z.array(BillItemSchema).default([]),
});

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest): Promise<NextResponse<ExtractedBillResponse>> {
  try {
    // 0. Verify AI key availability (return 503 AI_NOT_CONFIGURED if missing)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'AI bill reading is not configured.',
          errorCode: 'AI_NOT_CONFIGURED',
          code: 'AI_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    // 1. Rate Limiting (10 requests/minute per IP)
    const rateLimit = await checkRateLimit(req, 10, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'Rate limit reached (10 requests/min). Please wait a moment before scanning another bill.',
          errorCode: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg' } = body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'No image provided for bill extraction.',
          errorCode: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // 3. Clean base64 string and validate max 4 MB size
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim();
    const estimatedSizeBytes = Math.ceil((cleanBase64.length * 3) / 4);

    if (estimatedSizeBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: `Bill image size (~${(estimatedSizeBytes / (1024 * 1024)).toFixed(1)} MB) exceeds 4 MB limit. Please compress or crop the photo.`,
          errorCode: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    // 4. Construct prompt and parts (Never log base64 data)
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
1. Return ONLY the requested JSON schema.
2. If any item quantity cannot be clearly read, default to 1.
3. Keep product names concise as written on the bill.
4. Do not invent items or hallucinate; only transcribe what is visible on the bill.`;

    const contents = [
      promptText,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      },
    ];

    const extracted = await generateJson(contents, BillExtractResponseSchema, {
      model: getGeminiModel(),
      temperature: 0.1,
      timeoutMs: 30000,
    });

    return NextResponse.json({
      success: true,
      supplierName: extracted.supplierName || '',
      billDate: extracted.billDate || '',
      items: extracted.items,
    });
  } catch (err: unknown) {
    if (err instanceof GeminiKeyMissingError) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'AI bill reading is not configured.',
          errorCode: 'AI_NOT_CONFIGURED',
          code: 'AI_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    if (isQuotaExceededError(err) || err instanceof GeminiQuotaExceededError) {
      return NextResponse.json(
        {
          success: false,
          fallback: true,
          error: 'Daily AI scan quota reached for Google Gemini. You can enter items manually.',
          errorCode: 'QUOTA_EXCEEDED',
        },
        { status: 429 }
      );
    }

    const errorMsg = err instanceof Error ? err.message : 'Unknown extraction error';
    // Log metadata only - never log prompt or image data
    console.error('Bill extract error code:', errorMsg);

    return NextResponse.json({
      success: false,
      fallback: true,
      error: 'Could not extract bill items automatically. Please enter items manually.',
      errorCode: 'EXTRACTION_FAILED',
    });
  }
}
