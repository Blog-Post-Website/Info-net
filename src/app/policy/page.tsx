import type { Metadata } from "next";
import FormLink from "@/components/FormLink";
import PublicHeader from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "Policy",
  description: "Read the editorial, privacy, and content policy for InfoNet.",
};

const policyItems = [
  "Editorial independence: posts reflect editorial judgment and are not auto-generated filler.",
  "Privacy: we only collect what is needed to operate the site and improve the experience.",
  "Publishing standard: each article should be factual, actionable, and clearly written.",
  "Corrections: when an error is identified, it should be corrected promptly and transparently.",
];

export default function PolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Policy</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Clear rules for publishing and privacy.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This page explains how InfoNet handles content, privacy, and editorial decisions. It is designed to be straightforward
            so readers know what to expect when they visit the site.
          </p>

          <div className="mt-10 space-y-4">
            {policyItems.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
               <FormLink href="/about" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                 About
               </FormLink>
               <FormLink href="/contact" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                 Contact
               </FormLink>
          </div>
        </div>
      </section>
    </main>
  );
}
