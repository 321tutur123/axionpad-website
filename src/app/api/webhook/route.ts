import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

function esc(s: string | undefined): string {
  return (s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
    session.id,
    { limit: 100 },
  );

  const items = lineItems.map(item => ({
    name:       item.description ?? "Produit",
    quantity:   item.quantity    ?? 1,
    unit_price: (item.price?.unit_amount ?? 0) / 100,
    subtotal:   (item.amount_total        ?? 0) / 100,
  }));

  const orderNumber   = session.metadata?.orderId ?? `AXN-${Date.now().toString(36).toUpperCase()}`;
  const customerEmail = session.customer_details?.email ?? "";
  const customerName  = session.customer_details?.name  ?? "";
  const productSlug   = session.metadata?.productSlug   ?? "";

  try {
    const { env } = getRequestContext();
    await env.DB.prepare(`
      INSERT OR IGNORE INTO orders (
        id, stripe_event_id, order_number, status, payment_status,
        customer_email, customer_name,
        amount_total, currency,
        shipping_name, shipping_address,
        items, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.id,
      event.id,
      orderNumber,
      "confirmed",
      session.payment_status,
      customerEmail,
      customerName,
      session.amount_total            ?? 0,
      (session.currency ?? "eur").toUpperCase(),
      session.shipping_details?.name  ?? "",
      JSON.stringify(session.shipping_details?.address ?? null),
      JSON.stringify(items),
      session.created,
    ).run();
  } catch (dbErr) {
    console.error("D1 insert failed:", dbErr);
  }

  if (process.env.RESEND_API_KEY && customerEmail) {
    const origin     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axionpad.fr";
    const trackUrl   = `${origin}/track?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(customerEmail)}`;
    const firstName  = customerName.split(" ")[0] || "";
    const totalFormatted = ((session.amount_total ?? 0) / 100).toFixed(2);

    const itemsRows = items.map(i => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3d3530">${esc(i.name)} <span style="color:#9b8e85">×${i.quantity}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3d3530;text-align:right;white-space:nowrap">${i.subtotal.toFixed(2)} €</td>
      </tr>`).join("");

    // ── E-mail de confirmation immédiat ──────────────────────────────────────
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "AxionPad <bonjour@axionpad.com>",
        to:   customerEmail,
        subject: `Commande confirmée — ${orderNumber}`,
        html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0">

  <tr><td style="background:#1a1614;padding:28px 36px">
    <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#fff">AxionPad</p>
    <p style="margin:4px 0 0;font-size:13px;color:#9b8e85">Macro pad fabriqué en France</p>
  </td></tr>

  <tr><td style="padding:36px 36px 24px;text-align:center">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(107,146,116,0.12);border:1.5px solid rgba(107,146,116,0.3);margin-bottom:20px">
      <span style="font-size:24px;color:#4a8f5b">✓</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1614;letter-spacing:-0.5px">Commande confirmée !</h1>
    <p style="margin:0;font-size:15px;color:#6b5f58">Bonjour${firstName ? " " + esc(firstName) : ""},<br>merci pour votre commande. On s'en occupe dès maintenant.</p>
  </td></tr>

  <tr><td style="padding:0 36px 24px">
    <div style="background:#faf8f5;border:1px solid #e8e0d0;border-radius:10px;padding:14px 20px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9b8e85">Référence commande</span>
      <span style="font-family:monospace;font-size:16px;font-weight:700;color:#b8765c">${esc(orderNumber)}</span>
    </div>
  </td></tr>

  <tr><td style="padding:0 36px 24px">
    <p style="margin:0 0 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9b8e85">Articles commandés</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsRows}
      <tr>
        <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1a1614">Total payé</td>
        <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1a1614;text-align:right">${totalFormatted} €</td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 36px 28px">
    <div style="background:#fdf8f0;border:1px solid #e8d8b8;border-radius:10px;padding:14px 18px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#8b6a3a">📦 Expédition sous 3–5 jours ouvrés</p>
      <p style="margin:0;font-size:13px;color:#9b8e85">Vous recevrez un e-mail avec votre numéro de suivi dès que votre colis est parti.</p>
    </div>
  </td></tr>

  <tr><td style="padding:0 36px 36px;text-align:center">
    <a href="${esc(trackUrl)}" style="display:inline-block;padding:14px 32px;background:#b8765c;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">Suivre ma commande →</a>
  </td></tr>

  <tr><td style="padding:20px 36px;background:#faf8f5;border-top:1px solid #e8e0d0">
    <p style="margin:0;font-size:12px;color:#9b8e85;text-align:center">
      Une question ? <a href="mailto:bonjour@axionpad.com" style="color:#b8765c;text-decoration:none">bonjour@axionpad.com</a><br>
      AxionPad — Assemblé à Orléans, France
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
      }),
    }).catch(() => null);

    // ── Demande d'avis J+7 ──────────────────────────────────────────────────
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const reviewUrl   = productSlug ? `${origin}/shop/${productSlug}#reviews` : `${origin}/shop`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "AxionPad <bonjour@axionpad.com>",
        to:   customerEmail,
        subject: "Votre avis nous intéresse !",
        scheduledAt,
        html: `<p>Bonjour,</p>
<p>Nous espérons que vous êtes satisfait(e) de votre commande AxionPad !</p>
<p>Votre retour aide d'autres passionnés à faire le bon choix. Cela ne prend qu'une minute.</p>
<p><a href="${esc(reviewUrl)}" style="display:inline-block;padding:12px 24px;background:#b8765c;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">Laisser un avis →</a></p>
<p style="color:#9b8e85;font-size:12px;">Vous recevez cet e-mail car vous avez passé commande sur axionpad.com.</p>`,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ received: true });
}
