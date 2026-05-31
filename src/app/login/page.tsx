"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(fields: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.email.trim()) {
    errors.email = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!fields.password) errors.password = "Required";
  return errors;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setNotice("Email confirmé — vous pouvez vous connecter.");
    } else if (searchParams.get("reset") === "1") {
      setNotice("Mot de passe mis à jour — vous pouvez vous connecter.");
    }
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string; code?: string };
      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setError("Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.");
        } else {
          setError(data.error ?? "Login failed. Please try again.");
        }
        return;
      }
      router.push("/account");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-[#16130E] font-bold text-2xl tracking-tight">
            AXION<span className="text-[#E8431F]">PAD</span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl border border-[#16130E]/12 bg-[#FAF7EF]">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#16130E] mb-2">Welcome back</h1>
            <p className="text-sm text-[#6A6453]">Sign in to your AXIONPAD account.</p>
          </div>

          {notice && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[#16130E] mb-1.5 block">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border text-[#16130E] text-sm focus:outline-none focus:border-[#E8431F] placeholder:text-[#9A9180] transition-colors ${fieldErrors.email ? "border-red-500/50" : "border-[#16130E]/12"}`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-[#16130E] mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className={`w-full px-4 py-3 rounded-xl bg-[#FAF7EF] border text-[#16130E] text-sm focus:outline-none focus:border-[#E8431F] placeholder:text-[#9A9180] transition-colors ${fieldErrors.password ? "border-red-500/50" : "border-[#16130E]/12"}`}
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1.5">{fieldErrors.password}</p>
              )}
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-xs text-[#6A6453] hover:text-[#E8431F] transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-full bg-[#E8431F] hover:bg-[#C7370F] text-[#16130E] font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6A6453] mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#E8431F] hover:text-[#E8431F] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

// useSearchParams requires a Suspense boundary in the App Router
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
