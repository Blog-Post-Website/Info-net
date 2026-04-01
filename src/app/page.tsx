"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const roadmap = [
  "Authentication and protected admin dashboard",
  "Post editor with autosave and markdown preview",
  "SEO-optimized blog listing and detail pages",
  "Supabase-backed content, tags, and categories",
];

export default function HomePage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [user, isAdmin, loading, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:px-10">
      <div className="rounded-3xl border border-emerald-100/70 bg-white/85 p-8 shadow-[0_16px_50px_rgba(16,32,23,0.08)] backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Production Baseline</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Human-Operated Blog Platform
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
          Next.js + Supabase + Vercel starter is ready. This foundation is configured for secure auth,
          CMS-style workflows, and SEO-first publishing.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {roadmap.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <a
            href="/auth/login"
            className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white transition hover:bg-emerald-700"
          >
            Admin Sign In
          </a>
          <a
            href="/auth/signup"
            className="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
