import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  customer_name: string;
  amount_total: number;
  currency: string;
  items: string;
  tracking_number: string;
  created_at: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderParam = searchParams.get("order")?.trim();
  const email      = searchParams.get("email")?.trim().toLowerCase();

  if (!orderParam || !email) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext();

    // Accepte l'identifiant Stripe (cs_...) ou la référence AXN-xxx
    let order: OrderRow | null;
    if (orderParam.startsWith("cs_")) {
      order = await env.DB.prepare(
        "SELECT id, order_number, status, customer_email, customer_name, amount_total, currency, items, tracking_number, created_at FROM orders WHERE id = ? LIMIT 1",
      ).bind(orderParam).first<OrderRow>();
    } else {
      order = await env.DB.prepare(
        "SELECT id, order_number, status, customer_email, customer_name, amount_total, currency, items, tracking_number, created_at FROM orders WHERE order_number = ? LIMIT 1",
      ).bind(orderParam.toUpperCase()).first<OrderRow>();
    }

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable. Vérifiez le numéro et l'email." },
        { status: 404 },
      );
    }

    if ((order.customer_email ?? "").toLowerCase() !== email) {
      return NextResponse.json(
        { error: "L'email ne correspond pas à cette commande." },
        { status: 403 },
      );
    }

    const items = (() => {
      try {
        const parsed = JSON.parse(order.items ?? "[]") as Array<{
          name: string; quantity: number; unit_price: number; subtotal: number;
        }>;
        return parsed.map((item, i) => ({
          id:           String(i),
          product_name: item.name,
          quantity:     item.quantity  ?? 1,
          price:        item.unit_price ?? 0,
          subtotal:     item.subtotal  ?? 0,
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
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
