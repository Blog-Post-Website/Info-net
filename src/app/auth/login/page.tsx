"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [accessEmail, setAccessEmail] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, adminEmail } = useAuth();
  const router = useRouter();

  const handleAccessCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!adminEmail) {
      setError("Admin access is not configured.");
      return;
    }

    if (accessEmail.trim().toLowerCase() !== adminEmail) {
      setError("Access denied.");
      return;
    }

    setEmail(adminEmail);
    setAccessGranted(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.toLowerCase() !== adminEmail) {
      setError("Only the configured admin account can sign in.");
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {!accessGranted ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Restricted Access</h1>
            <p className="mt-2 text-sm text-slate-600">This area is for admin access only.</p>

            <form onSubmit={handleAccessCheck} className="mt-6 space-y-4">
              <div>
                <label htmlFor="accessEmail" className="block text-sm font-medium text-slate-700">
                  Admin Email Check
                </label>
                <input
                  id="accessEmail"
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter authorized admin email"
                />
              </div>

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
              >
                Continue
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              <Link href="/" className="font-medium text-emerald-600 hover:text-emerald-700">
                Back to homepage
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Blog Admin</h1>
            <p className="mt-2 text-sm text-slate-600">Sign in to continue</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
