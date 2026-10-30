import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import {
  cleanJsonText,
  generateJson,
  generateText,
  isQuotaExceededError,
  GeminiQuotaExceededError,
  GeminiKeyMissingError,
} from './gemini';
import { checkRateLimit, resetMemoryRateLimiter } from './rate-limit';

// Mock @google/genai
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateContent: mockGenerateContent,
        generateContentStream: mockGenerateContentStream,
      };
    },
  };
});

describe('lib/ai/gemini', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-2.5-flash' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('cleanJsonText', () => {
    it('strips ```json and ``` fences', () => {
      const input = '```json\n{"supplierName": "Metro Wholesalers", "items": []}\n```';
      expect(cleanJsonText(input)).toBe('{"supplierName": "Metro Wholesalers", "items": []}');
    });

    it('strips plain ``` fences', () => {
      const input = '```\n{"test": 123}\n```';
      expect(cleanJsonText(input)).toBe('{"test": 123}');
    });

    it('leaves clean JSON untouched', () => {
      const input = '{"test": 123}';
      expect(cleanJsonText(input)).toBe('{"test": 123}');
    });
  });

  describe('generateJson with Zod validation', () => {
    const TestSchema = z.object({
      supplier: z.string(),
      total: z.number(),
    });

    it('successfully parses valid JSON response and validates with Zod', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ supplier: 'Metro Cash & Carry', total: 4500 }),
      });

      const result = await generateJson('Analyze bill', TestSchema);
      expect(result).toEqual({ supplier: 'Metro Cash & Carry', total: 4500 });
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('handles markdown code fenced JSON output from Gemini', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: '```json\n{"supplier": "Anand Provisions", "total": 1200}\n```',
      });

      const result = await generateJson('Analyze bill', TestSchema);
      expect(result).toEqual({ supplier: 'Anand Provisions', total: 1200 });
    });

    it('throws ZodError when model returns invalid data shape', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({ supplier: 12345, total: 'not-a-number' }),
      });

      await expect(generateJson('Analyze bill', TestSchema)).rejects.toThrow();
    });

    it('throws GeminiKeyMissingError when GEMINI_API_KEY is not set', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      await expect(generateJson('Analyze bill', TestSchema)).rejects.toThrow(
        GeminiKeyMissingError
      );
    });
  });

  describe('Error handling & Retries', () => {
    it('detects quota exceeded errors via isQuotaExceededError', () => {
      expect(isQuotaExceededError(new GeminiQuotaExceededError())).toBe(true);
      expect(isQuotaExceededError(new Error('Resource has been exhausted (e.g. check quota)'))).toBe(true);
      expect(isQuotaExceededError({ status: 429, message: 'Too Many Requests' })).toBe(true);
      expect(isQuotaExceededError(new Error('Normal network error'))).toBe(false);
    });

    it('retries once on 429 and throws GeminiQuotaExceededError if it fails again', async () => {
      const error429 = new Error('429 RESOURCE_EXHAUSTED quota exceeded');
      mockGenerateContent
        .mockRejectedValueOnce(error429)
        .mockRejectedValueOnce(error429);

      await expect(generateText('test prompt')).rejects.toThrow(GeminiQuotaExceededError);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('retries once on 503 and succeeds on second attempt', async () => {
      const error503 = new Error('503 Service Unavailable');
      mockGenerateContent
        .mockRejectedValueOnce(error503)
        .mockResolvedValueOnce({ text: 'Recovered response' });

      const text = await generateText('test prompt');
      expect(text).toBe('Recovered response');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });
});

describe('lib/ai/rate-limit', () => {
  beforeEach(() => {
    resetMemoryRateLimiter();
  });

  it('allows requests within rate limit', async () => {
    const req = new Request('http://localhost/api/advisor', {
      headers: { 'x-forwarded-for': '192.168.1.50' },
    });

    const res1 = await checkRateLimit(req, 3, 60);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await checkRateLimit(req, 3, 60);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await checkRateLimit(req, 3, 60);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    const res4 = await checkRateLimit(req, 3, 60);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
  });
});
