import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as billExtractPOST } from '@/app/api/bill-extract/route';
import { POST as advisorPOST } from '@/app/api/advisor/route';
import { GET as aiStatusGET } from '@/app/api/ai-status/route';
import { resetMemoryRateLimiter } from './rate-limit';

// Mock gemini client helper functions
vi.mock('@/lib/ai/gemini', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai/gemini')>('@/lib/ai/gemini');
  return {
    ...actual,
    generateJson: vi.fn(),
    generateText: vi.fn(),
    generateTextStream: vi.fn(),
  };
});

import {
  generateJson,
  generateText,
  generateTextStream,
  GeminiQuotaExceededError,
  GeminiKeyMissingError,
} from '@/lib/ai/gemini';

describe('app/api/bill-extract route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    resetMemoryRateLimiter();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-2.5-flash' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects requests with missing image with 400', async () => {
    const req = new NextRequest('http://localhost/api/bill-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await billExtractPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('INVALID_INPUT');
  });

  it('rejects images exceeding 4 MB with 413', async () => {
    // 4 MB in base64 is ~5.6 million chars.
    const largeBase64 = 'A'.repeat(5.7 * 1024 * 1024);
    const req = new NextRequest('http://localhost/api/bill-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: largeBase64 }),
    });

    const res = await billExtractPOST(req);
    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('FILE_TOO_LARGE');
  });

  it('successfully extracts bill items with structured JSON schema', async () => {
    const mockExtracted = {
      supplierName: 'Metro Wholesalers Bengaluru',
      billDate: '2026-10-30',
      items: [
        { name: 'Toor Dal 1kg', quantity: 20, unitPrice: 145 },
        { name: 'Sunflower Oil 1L', quantity: 15, unitPrice: 130 },
      ],
    };

    vi.mocked(generateJson).mockResolvedValueOnce(mockExtracted);

    const req = new NextRequest('http://localhost/api/bill-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
    });

    const res = await billExtractPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.supplierName).toBe('Metro Wholesalers Bengaluru');
    expect(data.items).toHaveLength(2);
    expect(data.items[0].name).toBe('Toor Dal 1kg');
  });

  it('returns QUOTA_EXCEEDED error code with 429 when Gemini quota is exhausted', async () => {
    vi.mocked(generateJson).mockRejectedValueOnce(new GeminiQuotaExceededError('Daily quota reached'));

    const req = new NextRequest('http://localhost/api/bill-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
    });

    const res = await billExtractPOST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('QUOTA_EXCEEDED');
    expect(data.fallback).toBe(true);
  });

  it('returns HTTP 503 with AI_NOT_CONFIGURED when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const req = new NextRequest('http://localhost/api/bill-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }),
    });

    const res = await billExtractPOST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe('AI_NOT_CONFIGURED');
    expect(data.stack).toBeUndefined();
  });
});

describe('app/api/advisor route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    resetMemoryRateLimiter();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-2.5-flash' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects invalid payload with 400', async () => {
    const req = new NextRequest('http://localhost/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '' }), // missing metrics
    });

    const res = await advisorPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('INVALID_INPUT');
  });

  it('handles non-streaming requests and returns AI verified advice', async () => {
    vi.mocked(generateText).mockResolvedValueOnce(
      'Reorder Parle-G 10 packs today as lead time is 3 days.'
    );

    const payload = {
      question: 'What should I reorder today?',
      language: 'en',
      stream: false,
      metrics: {
        storeName: 'FreshMart',
        topSellers: [{ name: 'Basmati Rice', unitsSold: 40, revenue: 3200 }],
        lowStock: [{ name: 'Parle-G', daysOfStockLeft: 2, supplierLeadDays: 3, recommendedReorder: 10 }],
        weeklySalesTrend: [{ date: '2026-10-25', revenue: 5000, units: 60 }],
        upcomingFestivals: [{ name: 'Diwali', daysAway: 12, tip: 'Stock sweets' }],
      },
    };

    const req = new NextRequest('http://localhost/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await advisorPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.advice).toContain('Reorder Parle-G');
  });

  it('returns deterministic fallback when GEMINI_API_KEY is missing without throwing', async () => {
    vi.mocked(generateText).mockRejectedValueOnce(new GeminiKeyMissingError());

    const payload = {
      question: 'What should I reorder today?',
      language: 'kn',
      stream: false,
      metrics: {
        storeName: 'ನನ್ನ ಅಂಗಡಿ',
        topSellers: [{ name: 'ಅಕ್ಕಿ', unitsSold: 10, revenue: 1000 }],
        lowStock: [{ name: 'ಸಕ್ಕರೆ', daysOfStockLeft: 1, supplierLeadDays: 2, recommendedReorder: 5 }],
        weeklySalesTrend: [],
        upcomingFestivals: [],
      },
    };

    const req = new NextRequest('http://localhost/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await advisorPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mode).toBe('deterministic');
    expect(data.advice).toContain('ಸಕ್ಕರೆ');
  });

  it('supports streaming responses when stream is true', async () => {
    async function* mockStream() {
      yield 'Reorder ';
      yield 'Sunflower Oil ';
      yield 'today.';
    }

    vi.mocked(generateTextStream).mockReturnValueOnce(
      mockStream() as ReturnType<typeof generateTextStream>
    );

    const payload = {
      question: 'What should I reorder today?',
      language: 'en',
      stream: true,
      metrics: {
        storeName: 'FreshMart',
        topSellers: [],
        lowStock: [{ name: 'Sunflower Oil', daysOfStockLeft: 1, supplierLeadDays: 2, recommendedReorder: 15 }],
        weeklySalesTrend: [],
        upcomingFestivals: [],
      },
    };

    const req = new NextRequest('http://localhost/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await advisorPOST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');

    const text = await res.text();
    expect(text).toBe('Reorder Sunflower Oil today.');
  });

  it('returns deterministic fallback when Gemini quota is exceeded without failing', async () => {
    vi.mocked(generateText).mockRejectedValueOnce(
      new GeminiQuotaExceededError('Daily quota reached')
    );

    const payload = {
      question: 'What should I do today?',
      language: 'hi',
      stream: false,
      metrics: {
        storeName: 'मेरी दुकान',
        topSellers: [{ name: 'चावल', unitsSold: 20, revenue: 2000 }],
        lowStock: [{ name: 'दाल', daysOfStockLeft: 1, supplierLeadDays: 2, recommendedReorder: 10 }],
        weeklySalesTrend: [],
        upcomingFestivals: [],
      },
    };

    const req = new NextRequest('http://localhost/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await advisorPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mode).toBe('deterministic');
    expect(data.fallback).toBe(true);
    expect(data.advice).toContain('दाल');
  });
});

describe('app/api/ai-status route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns available: true when GEMINI_API_KEY is configured', async () => {
    process.env.GEMINI_API_KEY = 'test-valid-key';
    const res = await aiStatusGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ available: true });
    // Verify key is never leaked
    expect((data as Record<string, unknown>).key).toBeUndefined();
    expect((data as Record<string, unknown>).apiKey).toBeUndefined();
  });

  it('returns available: false when GEMINI_API_KEY is not set (never leaks key)', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    const res = await aiStatusGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ available: false });
    expect((data as Record<string, unknown>).key).toBeUndefined();
  });
});
