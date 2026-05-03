import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-auth";
import {
  adminLoginClear,
  adminLoginRecordFailure,
  adminLoginThrottleBlocked,
  throttleBucketId,
} from "@/lib/rateLimit";
import { verifyPassword } from "@/lib/user-auth";

export const runtime = "edge";

const MAX_PLAIN_PW = 512;

/** Fixed-width compare for legacy plain env password (prefer ADMIN_PASSWORD_HASH). */
function timingSafeEqualUtf8Pw(a: string, b: string): boolean {
  const te = new TextEncoder();
  const ab = te.encode(a);
  const bb = te.encode(b);
  if (ab.length > MAX_PLAIN_PW || bb.length > MAX_PLAIN_PW) return false;
  const ua = new Uint8Array(MAX_PLAIN_PW);
  const ub = new Uint8Array(MAX_PLAIN_PW);
  ua.set(ab);
  ub.set(bb);
  let diff = 0;
  for (let i = 0; i < MAX_PLAIN_PW; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

function setCookieHeader(value: string, maxAge: number): string {
  const attrs = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];
  return attrs.join("; ");
}

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const secret = process.env.AUTH_SECRET;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const passwordPlain = process.env.ADMIN_PASSWORD;

  if (!secret || (!passwordHash && !passwordPlain)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  let db: D1Database | undefined;
  try {
    db = getRequestContext().env.DB;
  } catch {
    db = undefined;
  }

  const bucketId = await throttleBucketId("admin_login", request, secret);

  if (db) {
    const retryAfter = await adminLoginThrottleBlocked(db, bucketId);
    if (retryAfter > 0) {
      const res = NextResponse.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 },
      );
      res.headers.set("Retry-After", String(retryAfter));
      return res;
    }
  }

  let valid = false;
  if (passwordHash && body.password) {
    valid = await verifyPassword(body.password, passwordHash);
  } else if (passwordPlain && body.password) {
    valid = timingSafeEqualUtf8Pw(body.password, passwordPlain);
  }

  if (!body.password || !valid) {
    if (db) await adminLoginRecordFailure(db, bucketId);
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  if (db) await adminLoginClear(db, bucketId);

  const token = await createSessionToken(secret);
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", setCookieHeader(token, SESSION_MAX_AGE_SECONDS));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", setCookieHeader("", 0));
  return response;
}
