// In-memory sliding window rate limiter.
// For multi-instance deployments, replace with Upstash Redis.

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart > 60 * 60 * 1000) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ─── Configurable rate limit check ───────────────────────────────────────────

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60 * 1000 }
): RateLimitResult {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterSeconds: 0 };
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/** 10 req/min per IP — for sign-in, sign-up */
export const authRateLimit = (ip: string) =>
  checkRateLimit(`signin:${ip}`, { maxRequests: 10, windowMs: 60_000 });

/** 5 req/min per user/guest — for checkout initiation */
export const checkoutRateLimit = (id: string) =>
  checkRateLimit(`checkout:${id}`, { maxRequests: 5, windowMs: 60_000 });

/** 20 req/min per user/guest — for coupon validation */
export const couponRateLimit = (id: string) =>
  checkRateLimit(`coupon:${id}`, { maxRequests: 20, windowMs: 60_000 });
