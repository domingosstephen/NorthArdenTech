/**
 * Upstash rate-limiting wrapper.
 *
 * Fails open (allows the request) if Upstash env vars are not configured,
 * so local dev works without Redis.
 *
 * Required env vars (production):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { type NextRequest, NextResponse } from "next/server";

// Lazy-initialise so the module can be imported without env vars present.
let checkoutLimiter: import("@upstash/ratelimit").Ratelimit | null = null;
let lookupLimiter: import("@upstash/ratelimit").Ratelimit | null = null;

function isConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function getCheckoutLimiter() {
  if (checkoutLimiter) return checkoutLimiter;
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  checkoutLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    // 5 checkout attempts per IP per minute
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "rl:checkout",
  });
  return checkoutLimiter;
}

async function getLookupLimiter() {
  if (lookupLimiter) return lookupLimiter;
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  lookupLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    // 10 lookups per IP per minute (order-status page)
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl:lookup",
  });
  return lookupLimiter;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Returns a 429 NextResponse if the request is rate-limited, otherwise null.
 * Always returns null when Upstash is not configured (fail-open).
 */
export async function checkCheckoutRateLimit(
  req: NextRequest
): Promise<NextResponse | null> {
  if (!isConfigured()) return null;
  try {
    const limiter = await getCheckoutLimiter();
    const { success, limit, remaining, reset } = await limiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  } catch {
    // Fail open on Redis errors
  }
  return null;
}

export async function checkLookupRateLimit(
  req: NextRequest
): Promise<NextResponse | null> {
  if (!isConfigured()) return null;
  try {
    const limiter = await getLookupLimiter();
    const { success, limit, remaining, reset } = await limiter.limit(getIp(req));
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  } catch {
    // Fail open on Redis errors
  }
  return null;
}
