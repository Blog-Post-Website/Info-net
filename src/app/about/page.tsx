import type { Metadata } from "next";
import FormLink from "@/components/FormLink";

export const metadata: Metadata = {
  title: "About",
  description: "Learn what InfoNet covers, who it is for, and how the editorial voice is structured.",
};

const principles = [
  "High-signal technical reporting over generic news",
  "Original analysis with practical engineering takeaways",
  "Clear writing, modern design, and accessible reading flow",
  "A focused publication for builders, operators, and product teams",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">About InfoNet</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">A focused tech publication for builders.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            InfoNet is a modern blog platform and editorial desk for practical writing about software engineering,
            AI, cloud infrastructure, security, and product strategy. The goal is to keep the reading experience clean,
            informative, and closer to a real publication than a generic landing page.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                {principle}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
              <FormLink href="/blog" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Read the blog
              </FormLink>
              <FormLink href="/contact" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Contact us
              </FormLink>
          </div>
        </div>
      </section>
    </main>
  );
}
