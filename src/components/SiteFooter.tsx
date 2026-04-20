import FormLink from "@/components/FormLink";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

const contactEmail = "online.upskill.dev@gmail.com";

export default function SiteFooter() {
  return (
    <footer className="px-4 pb-8 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[92rem] rounded-[28px] bg-[#111827] px-6 py-8 text-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-2xl font-black">InfoNet</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              A high-signal editorial blog for engineers, builders, and technical leaders.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Explore</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {exploreLinks.map((link) => (
                <p key={link.href}>
                  <FormLink href={link.href} className="transition hover:text-white">
                    {link.label}
                  </FormLink>
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Company</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>About</p>
              <p>Contact</p>
              <p>Privacy</p>
              <p>Terms</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Stay Updated</p>
            <div className="mt-3 flex flex-col gap-2">
              <FormLink
                href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
                className="rounded-xl bg-emerald-500 px-3 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
              >
                Email to subscribe
              </FormLink>
              <p className="text-xs text-slate-400">{contactEmail}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-4 text-xs text-slate-400">© 2026 InfoNet. All rights reserved.</div>
      </div>
    </footer>
  );
}
