import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  buildCheckoutEngravingDescription,
  computeUnitPriceFromSelections,
  getProduct,
} from "@/lib/products-data";
import { getPublicSiteOrigin } from "@/lib/siteUrl";

export const runtime = "edge";

const MAX_DISTINCT_ITEMS = 30;
const MAX_QTY_PER_LINE = 10;
const FREE_SHIPPING_THRESHOLD = 10000; // 100 € en centimes

function buildShippingOptions(subtotalCents: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const free = subtotalCents >= FREE_SHIPPING_THRESHOLD;
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: free ? 0 : 499, currency: "eur" },
        display_name: free ? "Mondial Relay — Point Relais (offerte)" : "Mondial Relay — Point Relais",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 3 },
          maximum: { unit: "business_day", value: 5 },
        },
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: free ? 0 : 749, currency: "eur" },
        display_name: free ? "Colissimo — Livraison à domicile (offerte)" : "Colissimo — Livraison à domicile",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 2 },
          maximum: { unit: "business_day", value: 3 },
        },
      },
    },
  ];
}

interface CheckoutItem {
  productId: string;
  name: string;
  /** Centimes — non utilisé si le prix est recalculé côté serveur */
  price: number;
  quantity: number;
  variantLabel?: string;
  selections?: Record<string, string>;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Paiement indisponible (configuration Stripe manquante)." },
        { status: 503 },
      );
    }
    const stripe = new Stripe(secret);

    let items: CheckoutItem[];
    try {
      ({ items } = (await request.json()) as { items: CheckoutItem[] });
      if (!Array.isArray(items) || items.length === 0) throw new Error();
    } catch {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    if (items.length > MAX_DISTINCT_ITEMS) {
      return NextResponse.json({ error: "Trop d’articles distincts dans le panier." }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const item of items) {
      if (typeof item.productId !== "string" || !SLUG_RE.test(item.productId)) {
        return NextResponse.json({ error: "Référence produit invalide." }, { status: 400 });
      }
      const qty = Math.floor(Number(item.quantity));
      if (qty < 1 || qty > MAX_QTY_PER_LINE) {
        return NextResponse.json({ error: "Quantité invalide pour un ou plusieurs articles." }, { status: 400 });
      }

      const product = getProduct(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable : ${item.productId}` },
          { status: 404 },
        );
      }
      if (product.comingSoon) {
        return NextResponse.json(
          { error: `Produit indisponible : ${product.name}` },
          { status: 409 },
        );
      }
      if (product.stock === 0) {
        return NextResponse.json(
          { error: `Rupture de stock : ${product.name}` },
          { status: 409 },
        );
      }
      if (qty > product.stock) {
        return NextResponse.json(
          { error: `Stock insuffisant pour « ${product.name} » (max ${product.stock}).` },
          { status: 409 },
        );
      }

      const unitCents = computeUnitPriceFromSelections(product, item.selections);
      if (unitCents === null) {
        return NextResponse.json(
          {
            error:
              `Configuration incomplète pour « ${product.name} ». Ouvrez la fiche produit et réajoutez l’article au panier.`,
          },
          { status: 400 },
        );
      }

      const variantName = item.variantLabel
        ? `${product.name} — ${item.variantLabel}`
        : product.name;
      const engravingDesc = buildCheckoutEngravingDescription(product, item.selections);

      lineItems.push({
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: unitCents,
          product_data: {
            name: variantName.slice(0, 250),
            ...(engravingDesc ? { description: engravingDesc } : {}),
          },
        },
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    const subtotalCents = lineItems.reduce((sum, li) => {
      const unit = (li.price_data as { unit_amount: number }).unit_amount;
      const qty  = li.quantity ?? 1;
      return sum + unit * qty;
    }, 0);

    const orderId = `AXN-${Date.now().toString(36).toUpperCase()}`;
    const origin = getPublicSiteOrigin(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "NL", "AT", "PT"],
      },
      shipping_options: buildShippingOptions(subtotalCents),
      allow_promotion_codes: true,
      metadata: { orderId, productSlug: items[0]?.productId ?? "" },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du paiement Stripe." },
      { status: 500 },
    );
  }
}
