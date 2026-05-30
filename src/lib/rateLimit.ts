function enc(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer as ArrayBuffer;
}

function b64url(buf: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function throttleBucketId(prefix: string, request: Request, salt: string): Promise<string> {
  const ip =
    request.headers.get("CF-Connecting-IP")?.trim() ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
  const digest = await crypto.subtle.digest("SHA-256", enc(`${prefix}:${ip}:${salt}`));
  return `${prefix}:${b64url(digest)}`;
}

// ─── Generic sliding-window helpers ──────────────────────────────────────────

async function slidingWindowBlocked(
  db: D1Database,
  bucketId: string,
  windowMs: number,
  maxCount: number,
): Promise<number> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId)
    .first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > windowMs) return 0;
  if (row.count < maxCount) return 0;
  return Math.max(1, Math.ceil((row.window_start + windowMs - now) / 1000));
}

async function slidingWindowRecord(
  db: D1Database,
  bucketId: string,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId)
    .first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > windowMs) {
    await db.prepare(
      "INSERT INTO api_throttle (bucket_id, count, window_start) VALUES (?, 1, ?) ON CONFLICT(bucket_id) DO UPDATE SET count = 1, window_start = excluded.window_start",
    ).bind(bucketId, now).run();
    return;
  }
  await db.prepare(
    "UPDATE api_throttle SET count = count + 1 WHERE bucket_id = ?",
  ).bind(bucketId).run();
}

async function slidingWindowClear(db: D1Database, bucketId: string): Promise<void> {
  await db.prepare("DELETE FROM api_throttle WHERE bucket_id = ?").bind(bucketId).run();
}

// ─── Admin login (12 échecs / 15 min) ────────────────────────────────────────

const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_ADMIN_FAILS = 12;

export async function adminLoginThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  return slidingWindowBlocked(db, bucketId, ADMIN_LOGIN_WINDOW_MS, MAX_ADMIN_FAILS);
}
export async function adminLoginRecordFailure(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowRecord(db, bucketId, ADMIN_LOGIN_WINDOW_MS);
}
export async function adminLoginClear(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowClear(db, bucketId);
}

// ─── Reviews (8 req / 1 h) ───────────────────────────────────────────────────

const REVIEW_WINDOW_MS = 60 * 60 * 1000;
const MAX_REVIEWS_PER_WINDOW = 8;

export async function reviewPostThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  return slidingWindowBlocked(db, bucketId, REVIEW_WINDOW_MS, MAX_REVIEWS_PER_WINDOW);
}
export async function reviewPostRecord(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowRecord(db, bucketId, REVIEW_WINDOW_MS);
}

// ─── User login (10 échecs / 15 min) ─────────────────────────────────────────

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILS = 10;

export async function loginThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  return slidingWindowBlocked(db, bucketId, LOGIN_WINDOW_MS, MAX_LOGIN_FAILS);
}
export async function loginRecordFailure(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowRecord(db, bucketId, LOGIN_WINDOW_MS);
}
export async function loginClear(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowClear(db, bucketId);
}

// ─── Track (20 req / 15 min) ─────────────────────────────────────────────────

const TRACK_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACK_PER_WINDOW = 20;

export async function trackThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  return slidingWindowBlocked(db, bucketId, TRACK_WINDOW_MS, MAX_TRACK_PER_WINDOW);
}
export async function trackThrottleRecord(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowRecord(db, bucketId, TRACK_WINDOW_MS);
}

// ─── Forgot-password (5 req / 15 min) ────────────────────────────────────────

const FORGOT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FORGOT_PER_WINDOW = 5;

export async function forgotPasswordThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  return slidingWindowBlocked(db, bucketId, FORGOT_WINDOW_MS, MAX_FORGOT_PER_WINDOW);
}
export async function forgotPasswordThrottleRecord(db: D1Database, bucketId: string): Promise<void> {
  return slidingWindowRecord(db, bucketId, FORGOT_WINDOW_MS);
}
