/**
 * Prints ADMIN_PASSWORD_HASH (PBKDF2-SHA256, same format as user passwords).
 * Usage: node scripts/hash-admin-password.mjs "your-strong-password"
 */
import { webcrypto, randomBytes } from "node:crypto";

const PBKDF2_ITERATIONS = 100_000;

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Usage: node scripts/hash-admin-password.mjs <password> (min 12 chars)");
  process.exit(1);
}

const salt = randomBytes(16);
const keyMaterial = await webcrypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  "PBKDF2",
  false,
  ["deriveBits"],
);
const hash = await webcrypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
  keyMaterial,
  256,
);
console.log(`${b64url(salt)}:${b64url(Buffer.from(hash))}`);
