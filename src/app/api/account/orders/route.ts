export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getAuthenticatedUserId } from "@/lib/user-auth";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  amount_total: number;
  currency: string;
  items: string;
  tracking_number: string;
  created_at: number;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = getRequestContext();

  const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
    .bind(userId)
    .first<{ email: string }>();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { results } = await env.DB.prepare(
    "SELECT id, order_number, status, amount_total, currency, items, tracking_number, created_at FROM orders WHERE customer_email = ? ORDER BY created_at DESC",
  )
    .bind(user.email)
    .all<OrderRow>();

  const orders = results.map(order => {
    let items: unknown[] = [];
    try { items = JSON.parse(order.items ?? "[]") as unknown[]; } catch { /* noop */ }
    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: (order.amount_total ?? 0) / 100,
      currency: order.currency ?? "EUR",
      tracking_number: order.tracking_number ?? "",
      created_at: new Date(order.created_at * 1000).toISOString(),
      items,
    };
  });

  return NextResponse.json({ orders });
}
