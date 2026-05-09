export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { escapeHtml } from "@/lib/htmlEscape";
import { throttleBucketId, forgotPasswordThrottleBlocked, forgotPasswordThrottleRecord } from "@/lib/rateLimit";

const TOKEN_TTL = 60 * 60; // 1 h

// Always return the same message — never reveal whether the email exists
const GENERIC_OK = { message: "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation." };

export async function POST(request: Request) {
  let body: { email?: string };
  try { body = (await request.json()) as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(GENERIC_OK);
  }

  const salt = process.env.JWT_SECRET ?? "forgot";
  const { env } = getRequestContext();

  const bucketId = await throttleBucketId("forgot", request, salt);
  const retryAfter = await forgotPasswordThrottleBlocked(env.DB, bucketId);
  if (retryAfter > 0) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  await forgotPasswordThrottleRecord(env.DB, bucketId);

  const user = await env.DB.prepare("SELECT id, first_name FROM users WHERE email = ?")
    .bind(email).first<{ id: string; first_name: string }>();

  if (!user) return NextResponse.json(GENERIC_OK);

  const token = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare(
    "INSERT OR REPLACE INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
  ).bind(token, user.id, now + TOKEN_TTL).run();

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axionpad.fr";
    const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
    const firstName = user.first_name;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: "AxionPad <contact@axionpad.fr>",
        to: email,
        subject: "Réinitialisation de votre mot de passe — AxionPad",
        html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px">
<tr><td align="center">
<table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0">
  <tr><td style="background:#1a1614;padding:24px 32px">
    <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.5px;color:#fff">AxionPad</p>
  </td></tr>
  <tr><td style="padding:32px 32px 24px;text-align:center">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:rgba(108,99,255,0.12);border:1.5px solid rgba(108,99,255,0.3);margin-bottom:18px">
      <span style="font-size:22px">&#128274;</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1614">R&#233;initialisation du mot de passe</h1>
    <p style="margin:0;font-size:14px;color:#6b5f58;line-height:1.6">
      Bonjour${firstName ? " " + escapeHtml(firstName) : ""},<br>
      Cliquez ci-dessous pour choisir un nouveau mot de passe.
    </p>
  </td></tr>
  <tr><td style="padding:0 32px 28px;text-align:center">
    <a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:14px 36px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">
      R&#233;initialiser mon mot de passe &#8594;
    </a>
    <p style="margin:16px 0 0;font-size:12px;color:#9b8e85">
      Ce lien expire dans 1&nbsp;heure.<br>
      Si vous n&#39;avez pas demand&#233; cette r&#233;initialisation, ignorez cet email.
    </p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#faf8f5;border-top:1px solid #e8e0d0">
    <p style="margin:0;font-size:11px;color:#9b8e85;text-align:center">AxionPad &#8212; Assembl&#233; &#224; Orl&#233;ans, France</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
      }),
    }).catch(() => null);
  }

  return NextResponse.json(GENERIC_OK);
}
