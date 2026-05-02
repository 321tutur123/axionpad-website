import Stripe from "stripe";
import Link from "next/link";
import type { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Commande confirmée — Axion Pad",
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

interface SessionData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  items: Array<{ description: string; quantity: number; amountTotal: number }>;
}

async function fetchSession(sessionId: string): Promise<SessionData | null> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !sessionId.startsWith("cs_")) return null;
  try {
    const stripe = new Stripe(secret);
    const [session, { data: lineItems }] = await Promise.all([
      stripe.checkout.sessions.retrieve(sessionId),
      stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 }),
    ]);
    return {
      orderNumber:   session.metadata?.orderId ?? "",
      customerName:  session.customer_details?.name  ?? "",
      customerEmail: session.customer_details?.email ?? "",
      amountTotal:   session.amount_total ?? 0,
      currency:      (session.currency ?? "eur").toUpperCase(),
      items: lineItems.map(i => ({
        description: i.description ?? "Article",
        quantity:    i.quantity    ?? 1,
        amountTotal: i.amount_total ?? 0,
      })),
    };
  } catch {
    return null;
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const data = session_id ? await fetchSession(session_id) : null;

  const trackUrl = data?.orderNumber && data?.customerEmail
    ? `/track?order=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`
    : "/track";

  return (
    <main
      className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6"
      style={{ background: "transparent" }}
    >
      <div className="w-full max-w-lg">

        {/* Checkmark */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border"
            style={{
              background: "rgba(107,146,116,0.12)",
              borderColor: "rgba(107,146,116,0.3)",
              color: "#4a8f5b",
            }}
          >
            &#10003;
          </div>
        </div>

        <h1
          className="text-3xl font-semibold text-center mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
        >
          Commande confirm&#233;e&#160;!
        </h1>
        <p className="text-center mb-8" style={{ color: "var(--color-text-mute)" }}>
          Merci pour votre achat &#8212; on s&apos;en occupe d&#232;s maintenant.
        </p>

        {/* Order card */}
        <div
          className="rounded-2xl border overflow-hidden mb-6"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}
        >
          {data && (
            <div
              className="px-6 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-text-mute)" }}
                >
                  R&#233;f&#233;rence commande
                </p>
                <p
                  className="font-mono text-lg font-bold"
                  style={{ color: "var(--color-accent)" }}
                >
                  {data.orderNumber}
                </p>
              </div>
              {data.customerName && (
                <p className="text-sm" style={{ color: "var(--color-text-mute)" }}>
                  {data.customerName}
                </p>
              )}
            </div>
          )}

          {data && data.items.length > 0 && (
            <div className="px-6 py-4 space-y-3">
              {data.items.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs shrink-0" style={{ color: "var(--color-text-mute)" }}>
                      x{item.quantity}
                    </span>
                    <span className="truncate" style={{ color: "var(--color-text)" }}>
                      {item.description}
                    </span>
                  </div>
                  <span className="ml-4 shrink-0 tabular-nums" style={{ color: "var(--color-text-mute)" }}>
                    {(item.amountTotal / 100).toFixed(2)} &#8364;
                  </span>
                </div>
              ))}
            </div>
          )}

          {data && (
            <div
              className="px-6 py-4 flex justify-between items-center border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                Total pay&#233;
              </span>
              <span className="font-bold" style={{ color: "var(--color-text)" }}>
                {(data.amountTotal / 100).toFixed(2)} {data.currency}
              </span>
            </div>
          )}

          {!data && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--color-text-mute)" }}>
                Votre paiement a bien &#233;t&#233; re&#231;u.
              </p>
            </div>
          )}
        </div>

        {data?.customerEmail && (
          <p className="text-center text-sm mb-6" style={{ color: "var(--color-text-mute)" }}>
            Un e-mail de confirmation a &#233;t&#233; envoy&#233; &#224;{" "}
            <strong style={{ color: "var(--color-text)" }}>
              {maskEmail(data.customerEmail)}
            </strong>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link
            href={trackUrl}
            className="btn-accent flex-1 py-3 text-center font-semibold text-sm rounded-full"
          >
            Suivre ma commande &#8594;
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-3 rounded-full text-center text-sm transition-colors"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-mute)" }}
          >
            Retour &#224; la boutique
          </Link>
        </div>

        <div
          className="rounded-xl px-5 py-4 text-sm mb-8 border"
          style={{ background: "var(--color-accent-lt)", borderColor: "rgba(184,118,92,0.2)" }}
        >
          <p className="font-medium mb-1" style={{ color: "var(--color-accent)" }}>
            &#128230; Exp&#233;dition sous 3&#8211;5 jours ouvr&#233;s
          </p>
          <p style={{ color: "var(--color-text-mute)", fontSize: "13px" }}>
            Vous recevrez un e-mail avec votre num&#233;ro de suivi d&#232;s que votre colis est parti.
          </p>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--color-text-mute)" }}>
          Une question ?{" "}
          <a
            href="mailto:contact@axionpad.fr"
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-accent)" }}
          >
            contact@axionpad.fr
          </a>
        </p>

      </div>
    </main>
  );
}
