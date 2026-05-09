const WINDOW_MS = 15 * 60 * 1000;
const MAX_ADMIN_FAILS = 12;

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

/** Returns Retry-After seconds if blocked; 0 if allowed (caller should run auth then record failure). */
export async function adminLoginThrottleBlocked(
  db: D1Database,
  bucketId: string,
): Promise<number> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId)
    .first<{ count: number; window_start: number }>();

  if (!row) return 0;

  if (now - row.window_start > WINDOW_MS) return 0;
  if (row.count < MAX_ADMIN_FAILS) return 0;

  const retryAfterSec = Math.ceil((row.window_start + WINDOW_MS - now) / 1000);
  return Math.max(1, retryAfterSec);
}

export async function adminLoginRecordFailure(db: D1Database, bucketId: string): Promise<void> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId)
    .first<{ count: number; window_start: number }>();

  if (!row || now - row.window_start > WINDOW_MS) {
    await db.prepare(
      "INSERT INTO api_throttle (bucket_id, count, window_start) VALUES (?, 1, ?) ON CONFLICT(bucket_id) DO UPDATE SET count = 1, window_start = excluded.window_start",
    ).bind(bucketId, now).run();
    return;
  }

  await db.prepare(
    "UPDATE api_throttle SET count = count + 1 WHERE bucket_id = ?",
  ).bind(bucketId).run();
}

export async function adminLoginClear(db: D1Database, bucketId: string): Promise<void> {
  await db.prepare("DELETE FROM api_throttle WHERE bucket_id = ?").bind(bucketId).run();
}

const REVIEW_WINDOW_MS = 60 * 60 * 1000;
const MAX_REVIEWS_PER_WINDOW = 8;

/** Returns Retry-After seconds if this IP exceeded review POST budget; 0 if allowed. */
export async function reviewPostThrottleBlocked(
  db: D1Database,
  bucketId: string,
): Promise<number> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId)
    .first<{ count: number; window_start: number }>();

  if (!row) return 0;
  if (now - row.window_start > REVIEW_WINDOW_MS) return 0;
  if (row.count < MAX_REVIEWS_PER_WINDOW) return 0;
  const retryAfterSec = Math.ceil((row.window_start + REVIEW_WINDOW_MS - now) / 1000);
  return Math.max(1, retryAfterSec);
}

export async function reviewPostRecord(db: D1Database, bucketId: string): Promise<void> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId)
    .first<{ count: number; window_start: number }>();

  if (!row || now - row.window_start > REVIEW_WINDOW_MS) {
    await db.prepare(
      "INSERT INTO api_throttle (bucket_id, count, window_start) VALUES (?, 1, ?) ON CONFLICT(bucket_id) DO UPDATE SET count = 1, window_start = excluded.window_start",
    ).bind(bucketId, now).run();
    return;
  }

  await db.prepare(
    "UPDATE api_throttle SET count = count + 1 WHERE bucket_id = ?",
  ).bind(bucketId).run();
}

// ─── User login throttle (10 échecs / 15 min par IP) ─────────────────────────

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILS = 10;

export async function loginThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId).first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > LOGIN_WINDOW_MS) return 0;
  if (row.count < MAX_LOGIN_FAILS) return 0;
  return Math.max(1, Math.ceil((row.window_start + LOGIN_WINDOW_MS - now) / 1000));
}

export async function loginRecordFailure(db: D1Database, bucketId: string): Promise<void> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId).first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > LOGIN_WINDOW_MS) {
    await db.prepare(
      "INSERT INTO api_throttle (bucket_id, count, window_start) VALUES (?, 1, ?) ON CONFLICT(bucket_id) DO UPDATE SET count = 1, window_start = excluded.window_start",
    ).bind(bucketId, now).run();
    return;
  }
  await db.prepare("UPDATE api_throttle SET count = count + 1 WHERE bucket_id = ?").bind(bucketId).run();
}

export async function loginClear(db: D1Database, bucketId: string): Promise<void> {
  await db.prepare("DELETE FROM api_throttle WHERE bucket_id = ?").bind(bucketId).run();
}

// ─── Track throttle (20 requêtes / 15 min par IP) ────────────────────────────

const TRACK_WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACK_PER_WINDOW = 20;

export async function trackThrottleBlocked(db: D1Database, bucketId: string): Promise<number> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId).first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > TRACK_WINDOW_MS) return 0;
  if (row.count < MAX_TRACK_PER_WINDOW) return 0;
  return Math.max(1, Math.ceil((row.window_start + TRACK_WINDOW_MS - now) / 1000));
}

export async function trackThrottleRecord(db: D1Database, bucketId: string): Promise<void> {
  const now = Date.now();
  const row = await db.prepare("SELECT count, window_start FROM api_throttle WHERE bucket_id = ?")
    .bind(bucketId).first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > TRACK_WINDOW_MS) {
    await db.prepare(
      "INSERT INTO api_throttle (bucket_id, count, window_start) VALUES (?, 1, ?) ON CONFLICT(bucket_id) DO UPDATE SET count = 1, window_start = excluded.window_start",
    ).bind(bucketId, now).run();
    return;
  }
  await db.prepare("UPDATE api_throttle SET count = count + 1 WHERE bucket_id = ?").bind(bucketId).run();
}
