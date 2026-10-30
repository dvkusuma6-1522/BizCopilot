import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory sliding window rate limiter fallback when Upstash is not configured
interface MemoryRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryRecord>();

// Clean up records older than 5 minutes every 5 minutes
if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 300000);

  // Unref interval in Node environment so it doesn't prevent process exit
  if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
    cleanupInterval.unref();
  }
}

let upstashRatelimit: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashRatelimit) return upstashRatelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      upstashRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '60 s'),
        analytics: false,
        prefix: 'bizcopilot_ai_rl',
      });
      return upstashRatelimit;
    } catch (e) {
      console.warn('Failed to initialize Upstash Redis rate limiter, using in-memory fallback:', e);
    }
  }

  return null;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Extracts a client IP safely from request headers (x-forwarded-for on Vercel).
 * Takes strictly the first address and handles missing or malformed headers safely.
 */
export function getClientIp(req: Request): string {
  try {
    const forwarded = req.headers?.get?.('x-forwarded-for');
    if (forwarded && typeof forwarded === 'string') {
      const first = forwarded.split(',')[0]?.trim();
      if (first && first.length > 0) {
        // Strip optional IPv4/IPv6 port if attached
        const clean = first.replace(/^\[/, '').replace(/\]:\d+$/, '').replace(/:\d+$/, '').trim();
        if (clean.length > 0) return clean;
      }
    }

    const realIp = req.headers?.get?.('x-real-ip');
    if (realIp && typeof realIp === 'string' && realIp.trim().length > 0) {
      return realIp.trim();
    }

    const cfIp = req.headers?.get?.('cf-connecting-ip');
    if (cfIp && typeof cfIp === 'string' && cfIp.trim().length > 0) {
      return cfIp.trim();
    }
  } catch {
    // Graceful fallback on any header error
  }

  return '127.0.0.1';
}

/**
 * Checks per-IP rate limit (default 10 requests per 60 seconds).
 * Uses Upstash if configured, otherwise pure in-memory sliding window.
 */
export async function checkRateLimit(
  req: Request,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const upstash = getUpstashLimiter();

  if (upstash) {
    try {
      const res = await upstash.limit(ip);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.ceil(res.reset / 1000),
      };
    } catch (e) {
      console.warn('Upstash rate limit check failed, falling back to memory store:', e);
    }
  }

  // In-memory sliding window implementation
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = memoryStore.get(ip);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(ip, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(1, resetTime),
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    success: true,
    limit,
    remaining,
    reset: windowSeconds,
  };
}

/**
 * Reset memory store (useful in tests)
 */
export function resetMemoryRateLimiter(): void {
  memoryStore.clear();
}
