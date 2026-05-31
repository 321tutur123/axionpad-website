"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
}

type Tab = "profile" | "orders";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "text-[#B45309] bg-[#B45309]/10 border-[#B45309]/25" },
  paid:      { label: "Confirmée",   color: "text-[#15803D] bg-[#15803D]/10 border-[#15803D]/25" },
  confirmed: { label: "Confirmée",   color: "text-[#15803D] bg-[#15803D]/10 border-[#15803D]/25" },
  shipped:   { label: "Expédiée",    color: "text-[#E8431F] bg-[#E8431F]/10 border-[#E8431F]/20" },
  delivered: { label: "Livrée",      color: "text-[#16130E] bg-[#FAF7EF] border-[#16130E]/12" },
  cancelled: { label: "Annulée",     color: "text-[#B91C1C] bg-[#B91C1C]/10 border-[#B91C1C]/25" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

function returnMailto(order: Order, email: string) {
  const subject = encodeURIComponent(`Demande de retour — ${order.order_number}`);
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaite effectuer un retour pour la commande ${order.order_number} du ${fmt(order.created_at)}.\n\nEmail : ${email}\n\nMotif du retour :\n\n`,
  );
  return `mailto:contact@axionpad.fr?subject=${subject}&body=${body}`;
}

function isReturnEligible(order: Order) {
  const days30 = 30 * 24 * 60 * 60 * 1000;
  const age = Date.now() - new Date(order.created_at).getTime();
  return age < days30 && ["paid", "confirmed", "shipped", "delivered"].includes(order.status);
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [fieldErrors, setFieldErrors] = useState<{ first_name?: string; last_name?: string }>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const errors: typeof fieldErrors = {};
    if (!firstName.trim()) errors.first_name = "Requis";
    if (!lastName.trim()) errors.last_name = "Requis";
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });
      if (res.status === 401) { router.replace("/login"); return; }
      const data = (await res.json()) as { user?: UserProfile; error?: string };
      if (!res.ok || !data.user) { setError(data.error ?? "Impossible de sauvegarder."); return; }
      setFirstName(data.user.first_name);
      setLastName(data.user.last_name);
      setFieldErrors({});
      setMessage("Profil mis à jour.");
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#16130E]/12 bg-[#FAF7EF] p-8">
      <h2 className="mb-1 text-lg font-semibold text-[#16130E]">Informations personnelles</h2>
      <p className="mb-6 text-sm text-[#6A6453]">Modifiez vos informations de profil.</p>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
      {message && <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">{message}</div>}

      <form onSubmit={handleSave} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-[#16130E]">Prénom</label>
            <input
              id="first_name" name="first_name" type="text" autoComplete="given-name"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setFieldErrors(p => ({ ...p, first_name: undefined })); }}
              className={`w-full rounded-xl border bg-[#FAF7EF] px-4 py-3 text-sm text-[#16130E] placeholder:text-[#9A9180] focus:border-[#E8431F] focus:outline-none transition-colors ${fieldErrors.first_name ? "border-red-500/50" : "border-[#16130E]/12"}`}
            />
            {fieldErrors.first_name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.first_name}</p>}
          </div>
          <div>
            <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-[#16130E]">Nom</label>
            <input
              id="last_name" name="last_name" type="text" autoComplete="family-name"
              value={lastName}
              onChange={e => { setLastName(e.target.value); setFieldErrors(p => ({ ...p, last_name: undefined })); }}
              className={`w-full rounded-xl border bg-[#FAF7EF] px-4 py-3 text-sm text-[#16130E] placeholder:text-[#9A9180] focus:border-[#E8431F] focus:outline-none transition-colors ${fieldErrors.last_name ? "border-red-500/50" : "border-[#16130E]/12"}`}
            />
            {fieldErrors.last_name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.last_name}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#16130E]">Adresse email</label>
          <input
            id="email" type="email" value={user.email} disabled
            className="w-full rounded-xl border border-[#16130E]/12 bg-[#FAF7EF] px-4 py-3 text-sm text-[#6A6453]"
          />
        </div>

        <button
          type="submit" disabled={saving}
          className="mt-2 w-full rounded-full bg-[#E8431F] py-3.5 text-sm font-semibold text-[#16130E] transition-all hover:scale-[1.01] hover:bg-[#C7370F] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account/orders", { credentials: "include" });
        if (res.status === 401) { router.replace("/login"); return; }
        const data = (await res.json()) as { orders?: Order[]; error?: string };
        if (!res.ok || !data.orders) { setError(data.error ?? "Impossible de charger les commandes."); return; }
        setOrders(data.orders);
      } catch {
        setError("Erreur de connexion.");
      }
    }
    void load();
  }, [router]);

  if (error) {
    return <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>;
  }

  if (!orders) {
    return <p className="text-sm text-[#6A6453]">Chargement des commandes…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-[#16130E]/12 bg-[#FAF7EF] p-12 text-center">
        <p className="text-[#6A6453] text-sm">Aucune commande pour le moment.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm text-[#E8431F] hover:text-[#E8431F] transition-colors">
          Découvrir la boutique →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const statusInfo = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-[#6A6453] bg-[#FAF7EF] border-[#16130E]/12" };
        const eligible = isReturnEligible(order);

        return (
          <div key={order.id} className="rounded-2xl border border-[#16130E]/12 bg-[#FAF7EF] p-6">
            {/* Order header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs text-[#6A6453] mb-0.5">Commande</p>
                <p className="font-semibold text-[#16130E]">{order.order_number}</p>
                <p className="text-xs text-[#6A6453] mt-0.5">{fmt(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <p className="text-sm font-semibold text-[#16130E]">{fmtPrice(order.total, order.currency)}</p>
              </div>
            </div>

            {/* Items */}
            {order.items.length > 0 && (
              <div className="mb-5 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#16130E]">{item.name} <span className="text-[#6A6453]">×{item.quantity}</span></span>
                    <span className="text-[#6A6453]">{fmtPrice(item.subtotal ?? item.unit_price * item.quantity, order.currency)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tracking */}
            {order.tracking_number && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#E8431F]/20 bg-[#C7370F]/5 px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#E8431F] shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6A6453]">Numéro de suivi</p>
                  <p className="text-sm font-medium text-[#E8431F]">{order.tracking_number}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/track?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(userEmail)}`}
                className="text-xs font-medium px-4 py-2 rounded-full border border-[#16130E]/15 text-[#16130E] hover:border-[#E8431F]/50 hover:text-[#E8431F] transition-colors"
              >
                Suivre la commande
              </Link>
              {eligible && (
                <a
                  href={returnMailto(order, userEmail)}
                  className="text-xs font-medium px-4 py-2 rounded-full border border-[#16130E]/15 text-[#16130E] hover:border-red-500/40 hover:text-red-300 transition-colors"
                >
                  Demander un retour
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    let mounted = true;
    async function loadAccount() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) { router.replace("/login"); return; }
        const data = (await res.json()) as { user?: UserProfile };
        if (!res.ok || !data.user) { router.replace("/login"); return; }
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) router.replace("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadAccount();
    return () => { mounted = false; };
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#6A6453]">Chargement…</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-transparent px-6 py-24">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
            Axion<span style={{ color: "var(--color-accent)" }}>Pad</span>
          </Link>
          <button
            type="button" onClick={handleLogout}
            className="rounded-full border border-[#16130E]/20 px-4 py-2 text-sm text-[#16130E] hover:border-[#16130E]/40 hover:text-[#16130E] transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl border border-[#16130E]/12 bg-[#FAF7EF] p-1">
          {(["profile", "orders"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-[#E8431F] text-[#16130E]"
                  : "text-[#6A6453] hover:text-[#16130E]"
              }`}
            >
              {t === "profile" ? "Mon profil" : "Mes commandes"}
            </button>
          ))}
        </div>

        {tab === "profile" && <ProfileTab user={user} />}
        {tab === "orders" && <OrdersTab userEmail={user.email} />}
      </div>
    </main>
  );
}
