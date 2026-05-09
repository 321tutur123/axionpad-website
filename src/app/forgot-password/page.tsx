"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Entrez votre adresse email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Trop de tentatives.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-white font-bold text-2xl tracking-tight">
            AXION<span className="text-violet-500">PAD</span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03]">
          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Email envoyé</h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Si cet email est associé à un compte, vous recevrez un lien de réinitialisation sous peu. Vérifiez vos spams.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié ?</h1>
                <p className="text-sm text-zinc-500">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-zinc-300 mb-1.5 block">
                    Adresse email
                  </label>
                  <input
                    id="email" type="email" autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600 transition-colors"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
