export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { hashPassword } from "@/lib/user-auth";
import { escapeHtml } from "@/lib/htmlEscape";

interface RegisterBody {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const TOKEN_TTL = 24 * 60 * 60; // 24 h

async function sendVerificationEmail(email: string, firstName: string, verifyUrl: string, resendKey: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: "AxionPad <contact@axionpad.fr>",
      to: email,
      subject: "Confirmez votre adresse email — AxionPad",
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
      <span style="font-size:22px">&#9993;</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1614">Confirmez votre adresse email</h1>
    <p style="margin:0;font-size:14px;color:#6b5f58;line-height:1.6">
      Bonjour${firstName ? " " + escapeHtml(firstName) : ""},<br>
      Cliquez sur le bouton ci-dessous pour activer votre compte.
    </p>
  </td></tr>

  <tr><td style="padding:0 32px 28px;text-align:center">
    <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:14px 36px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">
      Confirmer mon email &#8594;
    </a>
    <p style="margin:16px 0 0;font-size:12px;color:#9b8e85">
      Ce lien expire dans 24&nbsp;heures.<br>
      Si vous n'avez pas cr&#233;&#233; de compte, ignorez cet email.
    </p>
  </td></tr>

  <tr><td style="padding:16px 32px;background:#faf8f5;border-top:1px solid #e8e0d0">
    <p style="margin:0;font-size:11px;color:#9b8e85;text-align:center">
      AxionPad &#8212; Assembl&#233; &#224; Orl&#233;ans, France
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
    }),
  }).catch(() => null);
}

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password, first_name = "", last_name = "" } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const { env } = getRequestContext();

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(emailNorm)
    .first<{ id: string }>();

  if (existing) {
    return NextResponse.json(
      { error: "Unable to complete registration. Please check your details." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const password_hash = await hashPassword(password);
  const now = Math.floor(Date.now() / 1000);

  try {
    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
    )
      .bind(id, emailNorm, password_hash, first_name.trim(), last_name.trim(), now, now)
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Unable to complete registration. Please check your details." },
        { status: 409 },
      );
    }
    throw err;
  }

  // Generate and store verification token
  const token = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO email_verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
  ).bind(token, id, now + TOKEN_TTL).run();

  // Send verification email
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axionpad.fr";
  const verifyUrl = `${origin}/verify-email?token=${encodeURIComponent(token)}`;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    await sendVerificationEmail(emailNorm, first_name.trim(), verifyUrl, resendKey);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
