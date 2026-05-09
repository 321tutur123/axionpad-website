// Test script for the auth system (mirrors user-auth.ts logic)

function enc(str) {
  return new TextEncoder().encode(str).buffer;
}

function b64url(buf) {
  let binary = "";
  for (const b of new Uint8Array(buf)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(s + "=".repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0)).buffer;
}

const PBKDF2_ITERATIONS = 100_000;

async function hashPassword(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = saltBytes.buffer;
  const key = await crypto.subtle.importKey("raw", enc(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key, 256,
  );
  return `${b64url(salt)}:${b64url(hash)}`;
}

async function verifyPassword(password, stored) {
  const colon = stored.indexOf(":");
  if (colon < 1) return false;
  const salt = b64urlDecode(stored.slice(0, colon));
  const expected = stored.slice(colon + 1);
  const key = await crypto.subtle.importKey("raw", enc(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key, 256,
  );
  const candidate = b64url(hash);
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const JWT_HEADER = b64url(enc(JSON.stringify({ alg: "HS256", typ: "JWT" })));
const MAX_AGE = 7 * 24 * 60 * 60;

async function importHmacKey(secret) {
  return crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function createUserToken(userId, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(enc(JSON.stringify({ sub: userId, iat: now, exp: now + MAX_AGE })));
  const message = `${JWT_HEADER}.${payload}`;
  const key = await importHmacKey(secret);
  const sig = b64url(await crypto.subtle.sign("HMAC", key, enc(message)));
  return `${message}.${sig}`;
}

async function verifyUserToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const key = await importHmacKey(secret);
  const ok = await crypto.subtle.verify("HMAC", key, b64urlDecode(sig), enc(`${header}.${payload}`));
  if (!ok) return null;
  const { sub, exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
  if (exp < Math.floor(Date.now() / 1000)) return null;
  return sub;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label, condition) {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else           { console.error(`  ✗ ${label}`); failed++; }
}

const SECRET = "test_secret_local_dev_only";
const USER_ID = crypto.randomUUID();

console.log("\n── Password hashing ──────────────────────────────────────");
const hash = await hashPassword("motdepasse123");
ok("hash format (salt:hash)", hash.includes(":"));
ok("correct password accepted", await verifyPassword("motdepasse123", hash));
ok("wrong password rejected", !(await verifyPassword("mauvais", hash)));
ok("empty password rejected", !(await verifyPassword("", hash)));

const hash2 = await hashPassword("motdepasse123");
ok("two hashes of same password differ (random salt)", hash !== hash2);
ok("second hash also verifies correctly", await verifyPassword("motdepasse123", hash2));

console.log("\n── JWT ───────────────────────────────────────────────────");
const token = await createUserToken(USER_ID, SECRET);
ok("token has 3 parts", token.split(".").length === 3);

const sub = await verifyUserToken(token, SECRET);
ok("valid token returns user id", sub === USER_ID);
ok("wrong secret rejected", (await verifyUserToken(token, "mauvais_secret")) === null);

const tampered = token.slice(0, -5) + "AAAAA";
ok("tampered token rejected", (await verifyUserToken(tampered, SECRET)) === null);

const expiredPayload = b64url(enc(JSON.stringify({ sub: USER_ID, iat: 0, exp: 1 })));
const expiredMsg = `${JWT_HEADER}.${expiredPayload}`;
const expiredKey = await importHmacKey(SECRET);
const expiredSig = b64url(await crypto.subtle.sign("HMAC", expiredKey, enc(expiredMsg)));
const expiredToken = `${expiredMsg}.${expiredSig}`;
ok("expired token rejected", (await verifyUserToken(expiredToken, SECRET)) === null);

console.log(`\n── Résultat : ${passed} passés, ${failed} échoués ──────────────────\n`);
if (failed > 0) process.exit(1);
