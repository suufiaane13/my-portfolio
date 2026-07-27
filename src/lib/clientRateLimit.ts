/** Client-side sliding-window rate limit (localStorage). Complements Edge Function limits. */

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; retryAfterMs: number }

interface RateLimitBucket {
  timestamps: number[]
}

function storageKey(key: string) {
  return `susu-rate-limit:${key}`
}

function readBucket(key: string): number[] {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (!raw) return []
    const parsed = JSON.parse(raw) as RateLimitBucket
    return Array.isArray(parsed.timestamps)
      ? parsed.timestamps.filter((t) => typeof t === 'number')
      : []
  } catch {
    return []
  }
}

function writeBucket(key: string, timestamps: number[]) {
  try {
    const payload: RateLimitBucket = { timestamps }
    localStorage.setItem(storageKey(key), JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

function prune(timestamps: number[], windowMs: number, now: number) {
  return timestamps.filter((t) => now - t < windowMs)
}

/** Inspect whether an action is allowed without recording an attempt. */
export function checkClientRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const recent = prune(readBucket(key), windowMs, now)

  if (recent.length >= maxAttempts) {
    const oldest = Math.min(...recent)
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, windowMs - (now - oldest)),
    }
  }

  return { allowed: true, remaining: maxAttempts - recent.length }
}

/** Record a successful attempt (call after a real try, including failures that should count). */
export function recordClientRateLimitAttempt(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const recent = prune(readBucket(key), windowMs, now)

  if (recent.length >= maxAttempts) {
    const oldest = Math.min(...recent)
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, windowMs - (now - oldest)),
    }
  }

  recent.push(now)
  writeBucket(key, recent)

  return { allowed: true, remaining: maxAttempts - recent.length }
}

export function formatRetryMinutes(retryAfterMs: number): number {
  return Math.max(1, Math.ceil(retryAfterMs / 60_000))
}

/** Login / password-reset attempts */
export const AUTH_RATE_LIMIT = {
  key: 'auth-connection',
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
} as const

/** Memory game leaderboard score submissions only (play is unlimited). Aligns with Edge SCORE_RATE_LIMIT_MAX. */
export const GAME_SCORE_RATE_LIMIT = {
  key: 'game-score-submit',
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000,
} as const
