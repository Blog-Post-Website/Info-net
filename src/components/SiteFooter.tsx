import FormLink from "@/components/FormLink";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-slate-800">InfoNet</p>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {footerLinks.map((link) => (
            <FormLink key={link.href} href={link.href} className="transition hover:text-blue-600">
              {link.label}
            </FormLink>
          ))}
        </nav>
        <p className="text-xs text-slate-500">© 2026 InfoNet. All rights reserved.</p>
      </div>
    </footer>
  );
}
