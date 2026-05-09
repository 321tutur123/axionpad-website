"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (!token) { setError("Lien invalide."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      router.push("/login?reset=1");
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
        <p className="text-red-400 text-sm">Lien invalide ou expiré.</p>
        <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 text-sm mt-3 inline-block transition-colors">
          Faire une nouvelle demande →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-zinc-500">Choisissez un mot de passe d'au moins 8 caractères.</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Nouveau mot de passe
          </label>
          <input
            id="password" type="password" autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Au moins 8 caractères"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm" type="password" autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600 transition-colors"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 mt-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-white font-bold text-2xl tracking-tight">
            AXION<span className="text-violet-500">PAD</span>
          </Link>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-zinc-500 mt-5">
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
