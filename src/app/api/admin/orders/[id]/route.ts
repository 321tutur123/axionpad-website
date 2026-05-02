import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "edge";

const VALID_STATUSES = ["confirmed", "shipped", "cancelled"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  customer_name: string;
  amount_total: number;
  currency: string;
  items: string;
}

function esc(s: string | undefined): string {
  return (s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string; tracking_number?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { status, tracking_number = "" } = body;
  if (status && !VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext();

    const order = await env.DB.prepare(
      "SELECT id, order_number, status, customer_email, customer_name, amount_total, currency, items FROM orders WHERE id = ?",
    ).bind(id).first<OrderRow>();

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (status && tracking_number !== undefined) {
      await env.DB.prepare(
        "UPDATE orders SET status = ?, tracking_number = ? WHERE id = ?",
      ).bind(status, tracking_number.slice(0, 100), id).run();
    } else if (status) {
      await env.DB.prepare(
        "UPDATE orders SET status = ? WHERE id = ?",
      ).bind(status, id).run();
    } else if (tracking_number !== undefined) {
      await env.DB.prepare(
        "UPDATE orders SET tracking_number = ? WHERE id = ?",
      ).bind(tracking_number.slice(0, 100), id).run();
    }

    // ── E-mail d'expédition (uniquement si transition → shipped) ─────────────
    if (
      status === "shipped" &&
      order.status !== "shipped" &&
      process.env.RESEND_API_KEY &&
      order.customer_email
    ) {
      const origin    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axionpad.fr";
      const trackUrl  = `${origin}/track?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(order.customer_email)}`;
      const firstName = (order.customer_name ?? "").split(" ")[0] || "";
      const totalFormatted = ((order.amount_total ?? 0) / 100).toFixed(2);

      let itemsRows = "";
      try {
        const parsed = JSON.parse(order.items ?? "[]") as Array<{
          name: string; quantity: number; unit_price: number; subtotal: number;
        }>;
        itemsRows = parsed.map(i => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3d3530">${esc(i.name)} <span style="color:#9b8e85">×${i.quantity}</span></td>
            <td style="padding:8px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3d3530;text-align:right;white-space:nowrap">${i.subtotal.toFixed(2)} €</td>
          </tr>`).join("");
      } catch { /* pas critique */ }

      const laposteUrl = tracking_number
        ? `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(tracking_number)}`
        : "";

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "AxionPad <contact@axionpad.fr>",
          to:   order.customer_email,
          subject: `Votre commande est expédiée ! — ${order.order_number}`,
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
    <div style="font-size:52px;margin-bottom:16px">📦</div>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1614;letter-spacing:-0.5px">Votre colis est parti !</h1>
    <p style="margin:0;font-size:15px;color:#6b5f58">Bonjour${firstName ? " " + esc(firstName) : ""},<br>votre commande <strong style="color:#1a1614">${esc(order.order_number)}</strong> vient d'être expédiée.</p>
  </td></tr>

  ${tracking_number ? `
  <tr><td style="padding:0 36px 28px">
    <p style="margin:0 0 10px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9b8e85">Numéro de suivi</p>
    <div style="background:#fdf8f0;border:1.5px solid #e8d8b8;border-radius:12px;padding:20px;text-align:center">
      <p style="margin:0 0 16px;font-family:monospace;font-size:22px;font-weight:700;letter-spacing:3px;color:#b8765c">${esc(tracking_number)}</p>
      ${laposteUrl ? `<a href="${esc(laposteUrl)}" style="display:inline-block;padding:11px 24px;background:#1a1614;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:13px">Suivre sur La Poste →</a>` : ""}
    </div>
  </td></tr>
  ` : ""}

  ${itemsRows ? `
  <tr><td style="padding:0 36px 24px">
    <p style="margin:0 0 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9b8e85">Votre commande</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsRows}
      <tr>
        <td style="padding:12px 0 0;font-size:14px;font-weight:700;color:#1a1614">Total payé</td>
        <td style="padding:12px 0 0;font-size:14px;font-weight:700;color:#1a1614;text-align:right">${totalFormatted} €</td>
      </tr>
    </table>
  </td></tr>
  ` : ""}

  <tr><td style="padding:0 36px 36px;text-align:center">
    <a href="${esc(trackUrl)}" style="display:inline-block;padding:14px 32px;background:#b8765c;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">Suivre ma commande →</a>
  </td></tr>

  <tr><td style="padding:20px 36px;background:#faf8f5;border-top:1px solid #e8e0d0">
    <p style="margin:0;font-size:12px;color:#9b8e85;text-align:center">
      Une question ? <a href="mailto:contact@axionpad.fr" style="color:#b8765c;text-decoration:none">contact@axionpad.fr</a><br>
      AxionPad — Assemblé à Orléans, France
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
        }),
      }).catch(() => null); // fire-and-forget
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const { env } = getRequestContext();
    await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
