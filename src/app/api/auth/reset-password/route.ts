export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { hashPassword } from "@/lib/user-auth";

interface TokenRow { user_id: string; expires_at: number; }

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try { body = (await request.json()) as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { token, password } = body;
  if (!token || !password) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  const { env } = getRequestContext();

  const row = await env.DB.prepare(
    "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?",
  ).bind(token).first<TokenRow>();

  if (!row) {
    return NextResponse.json({ error: "Lien invalide ou déjà utilisé" }, { status: 404 });
  }

  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    await env.DB.prepare("DELETE FROM password_reset_tokens WHERE token = ?").bind(token).run();
    return NextResponse.json({ error: "Lien expiré. Faites une nouvelle demande." }, { status: 410 });
  }

  const password_hash = await hashPassword(password);
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
    .bind(password_hash, now, row.user_id).run();
  await env.DB.prepare("DELETE FROM password_reset_tokens WHERE token = ?").bind(token).run();

  return NextResponse.json({ success: true });
}
