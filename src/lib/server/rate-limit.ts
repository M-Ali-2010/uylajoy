import { AppError } from "./errors";

/**
 * Fixed-window rate limiter kept in process memory.
 *
 * On a serverless host each instance keeps its own counters, so this is a
 * brake, not a wall — enough to stop a single client from hammering login,
 * registration, lead creation or uploads. Move the store to Postgres/Redis
 * when there is more than one region or real abuse shows up.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitRule {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function rateLimit(scope: string, key: string, rule: RateLimitRule): void {
  const now = Date.now();
  sweep(now);

  const id = `${scope}:${key}`;
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + rule.windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > rule.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw new AppError(429, `Too many requests. Try again in ${retryAfter}s`, { retryAfter });
  }
}

export const RULES = {
  login: { limit: 10, windowMs: 15 * 60_000 },
  register: { limit: 5, windowMs: 60 * 60_000 },
  lead: { limit: 10, windowMs: 60 * 60_000 },
  upload: { limit: 40, windowMs: 60 * 60_000 },
  createListing: { limit: 20, windowMs: 60 * 60_000 },
} as const satisfies Record<string, RateLimitRule>;
