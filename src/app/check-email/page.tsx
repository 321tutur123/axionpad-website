import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block text-white font-bold text-2xl tracking-tight mb-8">
          AXION<span className="text-violet-500">PAD</span>
        </Link>

        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Vérifiez votre email</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Un email de confirmation vous a été envoyé.<br/>
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
          <p className="text-xs text-zinc-600 mt-4">
            Le lien expire dans 24 heures. Vérifiez vos spams si vous ne trouvez pas l'email.
          </p>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
