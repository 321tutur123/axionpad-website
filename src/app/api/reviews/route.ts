import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { reviewPostRecord, reviewPostThrottleBlocked, throttleBucketId } from "@/lib/rateLimit";
import { getProduct } from "@/lib/products-data";

export const runtime = "edge";

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  verified: number;
  created_at: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId")?.trim();

  if (!productId) return NextResponse.json({ reviews: [] });

  try {
    const { env } = getRequestContext();
    const { results } = await env.DB.prepare(
      "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 50",
    ).bind(productId).all<Review>();
    return NextResponse.json({ reviews: results });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: Request) {
  let body: { productId?: string; customerName?: string; rating?: unknown; comment?: string };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { productId, customerName, comment = "" } = body;
  const rating = Number(body.rating);

  if (!productId || !customerName?.trim() || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (!getProduct(productId)) {
    return NextResponse.json({ error: "Produit inconnu" }, { status: 404 });
  }

  try {
    const { env } = getRequestContext();
    const throttleSalt = process.env.JWT_SECRET || process.env.AUTH_SECRET;
    const bucketId = throttleSalt ? await throttleBucketId("review_post", request, throttleSalt) : null;
    if (bucketId) {
      const retryAfter = await reviewPostThrottleBlocked(env.DB, bucketId);
      if (retryAfter > 0) {
        const res = NextResponse.json(
          { error: "Limite temporaire atteinte. Réessayez plus tard." },
          { status: 429 },
        );
        res.headers.set("Retry-After", String(retryAfter));
        return res;
      }
    }

    await env.DB.prepare(
      "INSERT INTO reviews (id, product_id, customer_name, rating, comment, verified, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
    ).bind(
      crypto.randomUUID(),
      productId,
      customerName.trim().slice(0, 100),
      Math.round(rating),
      comment.slice(0, 1000),
      Math.floor(Date.now() / 1000),
    ).run();

    if (bucketId) await reviewPostRecord(env.DB, bucketId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
