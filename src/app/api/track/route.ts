import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "edge";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  items: string;
  tracking_number: string;
  created_at: number;
}

/* ── Fallback Stripe (utilisé si D1 indisponible ou table manquante) ──────── */

const PAYMENT_STATUS_MAP: Record<string, string> = {
  paid:                "confirmed",
  unpaid:              "pending",
  no_payment_required: "confirmed",
};

async function lookupViaStripe(sessionId: string, email: string) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;

  const stripe = new Stripe(secret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });
  } catch {
    return null;
  }

  const stripeEmail = session.customer_details?.email?.toLowerCase();
  if (!stripeEmail || stripeEmail !== email) return { forbidden: true } as const;

  const items = (session.line_items?.data ?? []).map((item, i) => {
    const product = item.price?.product;
    const name =
      typeof product === "object" && product !== null && "name" in product
        ? (product as Stripe.Product).name
        : (item.description ?? "Produit");
    return {
      id:           String(i),
      product_name: name,
      quantity:     item.quantity ?? 1,
      price:        (item.price?.unit_amount ?? 0) / 100,
      subtotal:     (item.amount_total ?? 0) / 100,
    };
  });

  return {
    order: {
      order_number:    session.metadata?.orderId ?? session.id,
      status:          PAYMENT_STATUS_MAP[session.payment_status] ?? "pending",
      payment_status:  session.payment_status,
      created_at:      new Date(session.created * 1000).toISOString(),
      total:           (session.amount_total ?? 0) / 100,
      currency:        session.currency?.toUpperCase() ?? "EUR",
      tracking_number: "",
      items,
    },
  };
}

/* ── Handler principal ────────────────────────────────────────────────────── */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderParam = searchParams.get("order")?.trim();
  const email      = searchParams.get("email")?.trim().toLowerCase();

  if (!orderParam || !email) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  /* ── Tentative D1 ─────────────────────────────────────────────────────── */
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    const { env } = getRequestContext();

    let order: OrderRow | null;
    if (orderParam.startsWith("cs_")) {
      order = await env.DB.prepare(
        "SELECT id, order_number, status, customer_email, amount_total, currency, items, tracking_number, created_at FROM orders WHERE id = ? LIMIT 1",
      ).bind(orderParam).first<OrderRow>();
    } else {
      order = await env.DB.prepare(
        "SELECT id, order_number, status, customer_email, amount_total, currency, items, tracking_number, created_at FROM orders WHERE order_number = ? LIMIT 1",
      ).bind(orderParam.toUpperCase()).first<OrderRow>();
    }

    if (!order) {
      // Pas dans D1 — si c'est un session_id Stripe, on essaie le fallback
      if (orderParam.startsWith("cs_")) {
        const result = await lookupViaStripe(orderParam, email);
        if (!result) return NextResponse.json({ error: "Commande introuvable. Vérifiez le numéro et l'email." }, { status: 404 });
        if ("forbidden" in result) return NextResponse.json({ error: "L'email ne correspond pas à cette commande." }, { status: 403 });
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: "Commande introuvable. Vérifiez le numéro et l'email." }, { status: 404 });
    }

    if ((order.customer_email ?? "").toLowerCase() !== email) {
      return NextResponse.json({ error: "L'email ne correspond pas à cette commande." }, { status: 403 });
    }

    const items = (() => {
      try {
        const parsed = JSON.parse(order.items ?? "[]") as Array<{
          name: string; quantity: number; unit_price: number; subtotal: number;
        }>;
        return parsed.map((item, i) => ({
          id:           String(i),
          product_name: item.name,
          quantity:     item.quantity   ?? 1,
          price:        item.unit_price ?? 0,
          subtotal:     item.subtotal   ?? 0,
        }));
      } catch {
        return [];
      }
    })();

    return NextResponse.json({
      order: {
        order_number:    order.order_number,
        status:          order.status,
        payment_status:  "paid",
        created_at:      new Date(order.created_at * 1000).toISOString(),
        total:           (order.amount_total ?? 0) / 100,
        currency:        order.currency ?? "EUR",
        tracking_number: order.tracking_number ?? "",
        items,
      },
    });

  } catch {
    /* D1 indisponible (table manquante, binding absent…) → fallback Stripe */
    if (!orderParam.startsWith("cs_")) {
      return NextResponse.json({ error: "Commande introuvable. Vérifiez le numéro et l'email." }, { status: 404 });
    }
    const result = await lookupViaStripe(orderParam, email);
    if (!result) return NextResponse.json({ error: "Commande introuvable. Vérifiez le numéro et l'email." }, { status: 404 });
    if ("forbidden" in result) return NextResponse.json({ error: "L'email ne correspond pas à cette commande." }, { status: 403 });
    return NextResponse.json(result);
  }
}
