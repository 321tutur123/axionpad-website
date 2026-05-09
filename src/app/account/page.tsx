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
  pending:   { label: "En attente",  color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  paid:      { label: "Confirmée",   color: "text-green-400 bg-green-400/10 border-green-400/20" },
  confirmed: { label: "Confirmée",   color: "text-green-400 bg-green-400/10 border-green-400/20" },
  shipped:   { label: "Expédiée",    color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  delivered: { label: "Livrée",      color: "text-zinc-300 bg-white/5 border-white/10" },
  cancelled: { label: "Annulée",     color: "text-red-400 bg-red-400/10 border-red-400/20" },
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <h2 className="mb-1 text-lg font-semibold text-white">Informations personnelles</h2>
      <p className="mb-6 text-sm text-zinc-500">Modifiez vos informations de profil.</p>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
      {message && <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">{message}</div>}

      <form onSubmit={handleSave} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-zinc-300">Prénom</label>
            <input
              id="first_name" name="first_name" type="text" autoComplete="given-name"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setFieldErrors(p => ({ ...p, first_name: undefined })); }}
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors ${fieldErrors.first_name ? "border-red-500/50" : "border-white/10"}`}
            />
            {fieldErrors.first_name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.first_name}</p>}
          </div>
          <div>
            <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-zinc-300">Nom</label>
            <input
              id="last_name" name="last_name" type="text" autoComplete="family-name"
              value={lastName}
              onChange={e => { setLastName(e.target.value); setFieldErrors(p => ({ ...p, last_name: undefined })); }}
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors ${fieldErrors.last_name ? "border-red-500/50" : "border-white/10"}`}
            />
            {fieldErrors.last_name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.last_name}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">Adresse email</label>
          <input
            id="email" type="email" value={user.email} disabled
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400"
          />
        </div>

        <button
          type="submit" disabled={saving}
          className="mt-2 w-full rounded-full bg-violet-600 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
    return <p className="text-sm text-zinc-400">Chargement des commandes…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
        <p className="text-zinc-400 text-sm">Aucune commande pour le moment.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300 transition-colors">
          Découvrir la boutique →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const statusInfo = STATUS_LABEL[order.status] ?? { label: order.status, color: "text-zinc-400 bg-white/5 border-white/10" };
        const eligible = isReturnEligible(order);

        return (
          <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            {/* Order header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Commande</p>
                <p className="font-semibold text-white">{order.order_number}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{fmt(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <p className="text-sm font-semibold text-white">{fmtPrice(order.total, order.currency)}</p>
              </div>
            </div>

            {/* Items */}
            {order.items.length > 0 && (
              <div className="mb-5 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-300">{item.name} <span className="text-zinc-500">×{item.quantity}</span></span>
                    <span className="text-zinc-400">{fmtPrice(item.subtotal ?? item.unit_price * item.quantity, order.currency)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tracking */}
            {order.tracking_number && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400 shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500">Numéro de suivi</p>
                  <p className="text-sm font-medium text-violet-300">{order.tracking_number}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/track?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(userEmail)}`}
                className="text-xs font-medium px-4 py-2 rounded-full border border-white/15 text-zinc-300 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
              >
                Suivre la commande
              </Link>
              {eligible && (
                <a
                  href={returnMailto(order, userEmail)}
                  className="text-xs font-medium px-4 py-2 rounded-full border border-white/15 text-zinc-300 hover:border-red-500/40 hover:text-red-300 transition-colors"
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
        <p className="text-sm text-zinc-400">Chargement…</p>
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
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-white/40 hover:text-white transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["profile", "orders"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
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
