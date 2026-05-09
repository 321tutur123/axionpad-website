"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((data: { success?: boolean; error?: string }) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Une erreur est survenue.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erreur de connexion. Réessayez.");
      });
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block text-white font-bold text-2xl tracking-tight mb-8">
          AXION<span className="text-violet-500">PAD</span>
        </Link>

        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03]">
          {status === "loading" && (
            <>
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 animate-pulse" />
              <p className="text-zinc-400 text-sm">Vérification en cours…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Email confirmé !</h1>
              <p className="text-sm text-zinc-400 mb-6">Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
              <Link
                href="/login"
                className="inline-block w-full py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all hover:scale-[1.02]"
              >
                Se connecter
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Lien invalide</h1>
              <p className="text-sm text-zinc-400 mb-6">{message}</p>
              <Link
                href="/register"
                className="inline-block w-full py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all hover:scale-[1.02]"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
