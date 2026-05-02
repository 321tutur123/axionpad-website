function enc(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer as ArrayBuffer;
}

function b64url(buf: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signUploadToken(orderNumber: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig  = await crypto.subtle.sign("HMAC", key, enc(orderNumber));
  return b64url(sig);
}

export async function verifyUploadToken(orderNumber: string, sig: string, secret: string): Promise<boolean> {
  try {
    const expected = await signUploadToken(orderNumber, secret);
    return expected === sig;
  } catch {
    return false;
  }
}
