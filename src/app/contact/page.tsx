import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the InfoNet editorial team.",
};

const contactMethods = [
  {
    label: "Editorial",
    value: "editorial@infonet.dev",
    note: "For article ideas, corrections, and contributor pitches.",
  },
  {
    label: "Business",
    value: "business@infonet.dev",
    note: "For partnerships, sponsorships, and media inquiries.",
  },
  {
    label: "Support",
    value: "support@infonet.dev",
    note: "For account, access, or site issues.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Contact</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Talk to the InfoNet team.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use the contact details below for editorial questions, business requests, or support issues. This keeps the site
            simple while still providing a real point of contact.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {contactMethods.map((method) => (
              <div key={method.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{method.label}</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{method.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{method.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Home
            </Link>
            <Link href="/blog" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Browse blog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
