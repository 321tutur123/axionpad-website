function enc(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer as ArrayBuffer;
}

function b64url(buf: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): ArrayBuffer {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s + "=".repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0))
    .buffer as ArrayBuffer;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

const DEFAULT_TTL_SEC = 14 * 24 * 60 * 60; // 14 days

/** Signed token binding order number + expiry (HMAC over payload). */
export async function signUploadToken(
  orderNumber: string,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SEC,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = b64url(enc(JSON.stringify({ order: orderNumber, exp })));
  const key = await importHmacKey(secret);
  const sig = b64url(await crypto.subtle.sign("HMAC", key, enc(payload)));
  return `${payload}.${sig}`;
}

export async function verifyUploadToken(orderNumber: string, token: string, secret: string): Promise<boolean> {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await importHmacKey(secret);
    const ok = await crypto.subtle.verify("HMAC", key, b64urlDecode(sig), enc(payloadB64));
    if (!ok) return false;
    const { order, exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64))) as {
      order: string;
      exp: number;
    };
    if (order !== orderNumber) return false;
    return exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
