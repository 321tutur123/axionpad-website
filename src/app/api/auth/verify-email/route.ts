export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

interface TokenRow {
  user_id: string;
  expires_at: number;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  const { env } = getRequestContext();
  const row = await env.DB.prepare(
    "SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ?",
  ).bind(token).first<TokenRow>();

  if (!row) {
    return NextResponse.json({ error: "Lien invalide ou déjà utilisé" }, { status: 404 });
  }

  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    await env.DB.prepare("DELETE FROM email_verification_tokens WHERE token = ?").bind(token).run();
    return NextResponse.json({ error: "Lien expiré. Créez un nouveau compte." }, { status: 410 });
  }

  await env.DB.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").bind(row.user_id).run();
  await env.DB.prepare("DELETE FROM email_verification_tokens WHERE token = ?").bind(token).run();

  return NextResponse.json({ success: true });
}
