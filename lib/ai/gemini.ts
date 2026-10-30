import { GoogleGenAI, type Part } from '@google/genai';
import { z } from 'zod';

/**
 * Server-only assertion to prevent accidental bundling in client components.
 */
function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('Gemini AI client must only be invoked in server environments (API routes).');
  }
}

/**
 * Typed error when GEMINI_API_KEY is not configured.
 */
export class GeminiKeyMissingError extends Error {
  readonly code = 'KEY_MISSING' as const;
  constructor(message: string = 'GEMINI_API_KEY is not configured') {
    super(message);
    this.name = 'GeminiKeyMissingError';
  }
}

/**
 * Typed error when Gemini free tier or project quota is exceeded.
 */
export class GeminiQuotaExceededError extends Error {
  readonly code = 'QUOTA_EXCEEDED' as const;
  constructor(message: string = 'Gemini API quota exceeded or rate limited') {
    super(message);
    this.name = 'GeminiQuotaExceededError';
  }
}

/**
 * Check if an error represents quota exhaustion or rate limits.
 */
export function isQuotaExceededError(err: unknown): boolean {
  if (err instanceof GeminiQuotaExceededError) return true;
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number; code?: number })?.status || (err as { status?: number; code?: number })?.code;
  return (
    status === 429 ||
    /429|RESOURCE_EXHAUSTED|quota|rate limit|too many requests/i.test(msg)
  );
}

/**
 * Check if an error is transient and retryable (429 or 503).
 */
export function isRetryableError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number; code?: number })?.status || (err as { status?: number; code?: number })?.code;
  return (
    status === 429 ||
    status === 503 ||
    /429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|overloaded|service unavailable/i.test(msg)
  );
}

/**
 * Returns the configured Gemini model name (default: gemini-2.5-flash).
 */
export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

/**
 * Server-only helper that creates the GoogleGenAI client from env vars.
 */
export function getGeminiClient(): GoogleGenAI {
  assertServerOnly();
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new GeminiKeyMissingError('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({ apiKey });
}

export type PromptContent = string | Part | (string | Part)[];

export interface GeminiOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  timeoutMs?: number;
  abortSignal?: AbortSignal;
}

/**
 * Clean markdown JSON code fences if returned by the model.
 */
export function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Retry helper executing a single retry on 429/503 with backoff.
 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isRetryableError(err)) {
      // 1 retry with exponential backoff (1200ms)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      try {
        return await fn();
      } catch (retryErr) {
        if (isQuotaExceededError(retryErr)) {
          throw new GeminiQuotaExceededError('Gemini API quota exceeded or rate limited');
        }
        throw retryErr;
      }
    }
    throw err;
  }
}

/**
 * Generate text using the official Gemini SDK.
 */
export async function generateText(
  prompt: PromptContent,
  options?: GeminiOptions
): Promise<string> {
  assertServerOnly();
  const client = getGeminiClient();
  const model = options?.model || getGeminiModel();

  const timeoutMs = options?.timeoutMs || 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options?.abortSignal
    ? anySignal([options.abortSignal, controller.signal])
    : controller.signal;

  try {
    const response = await withRetry(async () => {
      return await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.2,
          abortSignal: signal,
        },
      });
    });

    return response.text || '';
  } catch (err) {
    if (isQuotaExceededError(err)) {
      throw new GeminiQuotaExceededError('Gemini API quota exceeded');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generate structured JSON using Gemini's structured JSON output and validate with Zod.
 */
export async function generateJson<T>(
  prompt: PromptContent,
  schema: z.ZodType<T>,
  options?: GeminiOptions
): Promise<T> {
  assertServerOnly();
  const client = getGeminiClient();
  const model = options?.model || getGeminiModel();

  const jsonSchema = z.toJSONSchema(schema);
  const timeoutMs = options?.timeoutMs || 25000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options?.abortSignal
    ? anySignal([options.abortSignal, controller.signal])
    : controller.signal;

  try {
    const response = await withRetry(async () => {
      return await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: jsonSchema,
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.1,
          abortSignal: signal,
        },
      });
    });

    const rawText = response.text || '';
    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed);
  } catch (err) {
    if (isQuotaExceededError(err)) {
      throw new GeminiQuotaExceededError('Gemini API quota exceeded');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Stream text chunks from Gemini.
 */
export async function* generateTextStream(
  prompt: PromptContent,
  options?: GeminiOptions
): AsyncGenerator<string, void, unknown> {
  assertServerOnly();
  const client = getGeminiClient();
  const model = options?.model || getGeminiModel();

  const timeoutMs = options?.timeoutMs || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = options?.abortSignal
    ? anySignal([options.abortSignal, controller.signal])
    : controller.signal;

  try {
    const stream = await withRetry(async () => {
      return await client.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.2,
          abortSignal: signal,
        },
      });
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (err) {
    if (isQuotaExceededError(err)) {
      throw new GeminiQuotaExceededError('Gemini API quota exceeded');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Combine multiple AbortSignals safely.
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
