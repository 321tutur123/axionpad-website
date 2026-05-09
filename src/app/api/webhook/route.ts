import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { signUploadToken } from "@/lib/uploadToken";
import { escapeHtml } from "@/lib/htmlEscape";

export const runtime = "edge";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeSecret);

  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Signature verification failed: ${msg}` }, { status: 400 });
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

  // Récupère le transporteur choisi via l'ID du shipping rate
  let shippingMethod = "";
  const rateRef = (session.shipping_cost as { shipping_rate?: string } | null)?.shipping_rate;
  if (typeof rateRef === "string" && rateRef.startsWith("shr_")) {
    try {
      const rate = await stripe.shippingRates.retrieve(rateRef);
      shippingMethod = rate.display_name ?? "";
    } catch { /* non-critique */ }
  }

  let isNewOrder = false;
  try {
    const { env } = getRequestContext();
    const result = await env.DB.prepare(`
      INSERT OR IGNORE INTO orders (
        id, stripe_event_id, order_number, status, payment_status,
        customer_email, customer_name,
        amount_total, currency,
        shipping_name, shipping_address,
        items, shipping_method, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      shippingMethod,
      session.created,
    ).run();
    // changes === 0 means INSERT was ignored (duplicate event) — skip side effects
    isNewOrder = (result.meta.changes ?? 0) > 0;
  } catch (dbErr) {
    console.error("D1 insert failed:", dbErr);
    // Retourner 500 pour que Stripe retente l'événement
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  if (isNewOrder && process.env.RESEND_API_KEY && customerEmail) {
    const origin     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axionpad.fr";
    const trackUrl   = `${origin}/track?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(customerEmail)}`;
    const firstName  = customerName.split(" ")[0] || "";
    const totalFormatted = ((session.amount_total ?? 0) / 100).toFixed(2);

    const itemsRows = items.map(i => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3d3530">${escapeHtml(i.name)} <span style="color:#9b8e85">x${i.quantity}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3d3530;text-align:right;white-space:nowrap">${i.subtotal.toFixed(2)} EUR</td>
      </tr>`).join("");

    const allNames = items.map(i => i.name).join(" ");
    const hasCustomLogo    = allNames.includes("logo-custom") || allNames.toLowerCase().includes("vectoriel") || allNames.toLowerCase().includes("logo perso");
    const hasTextEngraving = allNames.includes("Couvercle :") && !hasCustomLogo;

    const uploadSig  = hasCustomLogo && process.env.AUTH_SECRET
      ? await signUploadToken(orderNumber, process.env.AUTH_SECRET)
      : "";
    const uploadUrl  = uploadSig
      ? `${origin}/upload?order=${encodeURIComponent(orderNumber)}&sig=${encodeURIComponent(uploadSig)}`
      : "";

    const engravingBlock = hasCustomLogo && uploadUrl ? `
  <tr><td style="padding:0 36px 24px">
    <div style="background:#fdf4e7;border:1.5px solid #f0c070;border-radius:10px;padding:16px 20px">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92600a">&#128274; Action requise &#8212; Logo personnalis&#233;</p>
      <p style="margin:0 0 12px;font-size:13px;color:#6b5030;line-height:1.6">
        Vous avez choisi une gravure avec votre logo. D&#233;posez votre fichier vectoriel
        <strong>(SVG ou DXF)</strong> en un clic via le lien ci-dessous &#8212; la fabrication sera lanc&#233;e d&#232;s validation.
      </p>
      <div style="text-align:center">
        <a href="${escapeHtml(uploadUrl)}" style="display:inline-block;padding:12px 28px;background:#b8765c;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:13px">
          D&#233;poser mon fichier &#8594;
        </a>
      </div>
      <p style="margin:10px 0 0;font-size:11px;color:#9b8e85;text-align:center">Lien r&#233;serv&#233; &#224; votre commande ${escapeHtml(orderNumber)}</p>
    </div>
  </td></tr>` : hasTextEngraving ? `
  <tr><td style="padding:0 36px 24px">
    <div style="background:#f0f7ff;border:1.5px solid #b0d0f0;border-radius:10px;padding:16px 20px">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a4a7a">&#9997;&#65039; Gravure texte confirm&#233;e</p>
      <p style="margin:0;font-size:13px;color:#2d5a8a;line-height:1.6">
        Le texte demand&#233; sera grav&#233; en creux sur le couvercle exactement comme indiqu&#233;.<br>
        <span style="font-size:12px;color:#9b8e85">Une question sur votre gravure ? R&#233;pondez &#224; cet e-mail.</span>
      </p>
    </div>
  </td></tr>` : "";

    // E-mail de confirmation immediat
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "AxionPad <contact@axionpad.fr>",
        to:   customerEmail,
        subject: `Commande confirmee -- ${orderNumber}`,
        html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0">

  <tr><td style="background:#1a1614;padding:28px 36px">
    <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#fff">AxionPad</p>
    <p style="margin:4px 0 0;font-size:13px;color:#9b8e85">Macro pad fabrique en France</p>
  </td></tr>

  <tr><td style="padding:36px 36px 24px;text-align:center">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(107,146,116,0.12);border:1.5px solid rgba(107,146,116,0.3);margin-bottom:20px">
      <span style="font-size:24px;color:#4a8f5b">&#10003;</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1614;letter-spacing:-0.5px">Commande confirm&#233;e !</h1>
    <p style="margin:0;font-size:15px;color:#6b5f58">Bonjour${firstName ? " " + escapeHtml(firstName) : ""},<br>merci pour votre commande. On s'en occupe d&#232;s maintenant.</p>
  </td></tr>

  <tr><td style="padding:0 36px 24px">
    <div style="background:#faf8f5;border:1px solid #e8e0d0;border-radius:10px;padding:14px 20px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9b8e85">R&#233;f&#233;rence commande</span>
      <span style="font-family:monospace;font-size:16px;font-weight:700;color:#b8765c">${escapeHtml(orderNumber)}</span>
    </div>
  </td></tr>

  <tr><td style="padding:0 36px 24px">
    <p style="margin:0 0 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9b8e85">Articles command&#233;s</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsRows}
      <tr>
        <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1a1614">Total pay&#233;</td>
        <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1a1614;text-align:right">${totalFormatted} &#8364;</td>
      </tr>
    </table>
  </td></tr>

  ${engravingBlock}

  <tr><td style="padding:0 36px 28px">
    <div style="background:#fdf8f0;border:1px solid #e8d8b8;border-radius:10px;padding:14px 18px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#8b6a3a">&#128230; Exp&#233;dition sous 3&#8211;5 jours ouvr&#233;s</p>
      <p style="margin:0;font-size:13px;color:#9b8e85">Vous recevrez un e-mail avec votre num&#233;ro de suivi d&#232;s que votre colis est parti.</p>
    </div>
  </td></tr>

  <tr><td style="padding:0 36px 36px;text-align:center">
    <a href="${escapeHtml(trackUrl)}" style="display:inline-block;padding:14px 32px;background:#b8765c;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">Suivre ma commande &#8594;</a>
  </td></tr>

  <tr><td style="padding:20px 36px;background:#faf8f5;border-top:1px solid #e8e0d0">
    <p style="margin:0;font-size:12px;color:#9b8e85;text-align:center">
      Une question ? <a href="mailto:contact@axionpad.fr" style="color:#b8765c;text-decoration:none">contact@axionpad.fr</a><br>
      AxionPad &#8212; Assembl&#233; &#224; Orl&#233;ans, France
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
      }),
    }).catch(() => null);

    // Demande d'avis J+7
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const reviewUrl   = productSlug ? `${origin}/shop/${productSlug}#reviews` : `${origin}/shop`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "AxionPad <contact@axionpad.fr>",
        to:   customerEmail,
        subject: "Votre avis nous interesse !",
        scheduledAt,
        html: `<p>Bonjour,</p>
<p>Nous esp&#233;rons que vous &#234;tes satisfait(e) de votre commande AxionPad !</p>
<p>Votre retour aide d'autres passionn&#233;s &#224; faire le bon choix. Cela ne prend qu'une minute.</p>
<p><a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:12px 24px;background:#b8765c;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">Laisser un avis &#8594;</a></p>
<p style="color:#9b8e85;font-size:12px;">Vous recevez cet e-mail car vous avez pass&#233; commande sur axionpad.fr.</p>`,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ received: true });
}
