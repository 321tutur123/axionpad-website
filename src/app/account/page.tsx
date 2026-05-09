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

interface ProfileErrors {
  first_name?: string;
  last_name?: string;
}

function validateProfile(first_name: string, last_name: string): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!first_name.trim()) errors.first_name = "Required";
  if (!last_name.trim()) errors.last_name = "Required";
  return errors;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = (await res.json()) as { user?: UserProfile; error?: string };
        if (!res.ok || !data.user) {
          setError(data.error ?? "Unable to load your account.");
          return;
        }
        if (!mounted) return;
        setUser(data.user);
        setFirstName(data.user.first_name);
        setLastName(data.user.last_name);
      } catch {
        if (!mounted) return;
        setError("Connection error. Please refresh.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadAccount();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const errors = validateProfile(firstName, lastName);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = (await res.json()) as { user?: UserProfile; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error ?? "Unable to save your profile.");
        return;
      }

      setUser(data.user);
      setFirstName(data.user.first_name);
      setLastName(data.user.last_name);
      setFieldErrors({});
      setMessage("Profile updated successfully.");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setMessage(null);
    setError(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/login");
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-24">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-block text-white font-bold text-2xl tracking-tight">
            AXION<span className="text-violet-500">PAD</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-white/40 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">My account</h1>
          <p className="mb-6 text-sm text-zinc-500">Manage your profile information.</p>

          {loading ? (
            <p className="text-sm text-zinc-400">Loading account...</p>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  {message}
                </div>
              )}

              <form onSubmit={handleSave} noValidate className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={e => {
                        setFirstName(e.target.value);
                        if (fieldErrors.first_name) {
                          setFieldErrors(prev => ({ ...prev, first_name: undefined }));
                        }
                      }}
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors ${fieldErrors.first_name ? "border-red-500/50" : "border-white/10"}`}
                    />
                    {fieldErrors.first_name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.first_name}</p>}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={e => {
                        setLastName(e.target.value);
                        if (fieldErrors.last_name) {
                          setFieldErrors(prev => ({ ...prev, last_name: undefined }));
                        }
                      }}
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors ${fieldErrors.last_name ? "border-red-500/50" : "border-white/10"}`}
                    />
                    {fieldErrors.last_name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-2 w-full rounded-full bg-violet-600 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
