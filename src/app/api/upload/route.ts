import { NextResponse } from "next/server";
import { verifyUploadToken } from "@/lib/uploadToken";
import { escapeHtml } from "@/lib/htmlEscape";

export const runtime = "edge";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = [
  "image/svg+xml",
  "image/x-dxf",
  "application/dxf",
  "application/pdf",
  "application/illustrator",
  "application/postscript",
];
const ALLOWED_EXT = [".svg", ".dxf", ".ai", ".eps", ".pdf"];

function safeAttachmentFilename(name: string): string {
  const cleaned = name.replace(/[^\w.\-()+ ]+/g, "_").trim().slice(0, 180);
  return cleaned || "upload.bin";
}

export async function POST(request: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }

  const order = (form.get("order") as string | null)?.trim().toUpperCase();
  const sig = (form.get("sig") as string | null)?.trim();
  const file = form.get("file") as File | null;

  if (!order || !sig || !file) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (!(await verifyUploadToken(order, sig, secret))) {
    return NextResponse.json({ error: "Lien invalide ou expir&#233;" }, { status: 403 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 413 });
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  const mimeOk = ALLOWED.includes(file.type);
  const extOk = ALLOWED_EXT.includes(ext);
  if (!mimeOk && !extOk) {
    return NextResponse.json({ error: "Format non accept&#233; (SVG, DXF, AI, PDF)" }, { status: 415 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Service d'envoi non configur&#233;" }, { status: 503 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

  const displayName = escapeHtml(file.name);
  const attachmentName = safeAttachmentFilename(file.name);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: "AxionPad Upload <contact@axionpad.fr>",
      to: "contact@axionpad.fr",
      subject: `[LOGO] Fichier gravure re&#231;u &#8212; ${order}`,
      html: `<p>Un client vient d'envoyer son fichier de gravure pour la commande <strong>${escapeHtml(order)}</strong>.</p>
             <p>Fichier : <strong>${displayName}</strong> (${(file.size / 1024).toFixed(0)} Ko)</p>
             <p>&#224; fabriquer d&#232;s validation du fichier joint.</p>`,
      attachments: [{ filename: attachmentName, content: base64 }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
