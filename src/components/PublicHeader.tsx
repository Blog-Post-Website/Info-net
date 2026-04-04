"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import FormLink from "@/components/FormLink";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

const contactEmail = "online.upskill.dev@gmail.com";

function getInitial(label: string) {
  const cleaned = label.trim();
  return cleaned ? cleaned[0]!.toUpperCase() : "U";
}

export default function PublicHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const nextParam = useMemo(() => encodeURIComponent(pathname || "/"), [pathname]);

  const displayName = useMemo(() => {
    if (!user) return "";
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const name = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";
    if (name) return name;
    return user.email || "";
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (!user) return "";
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const url = typeof metadata?.avatar_url === "string" ? metadata.avatar_url.trim() : "";
    return url;
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex max-w-[92rem] items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <FormLink href="/" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            InfoNet
          </FormLink>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium text-slate-700 dark:text-slate-200 lg:flex">
          {navLinks.map((link) => (
            <FormLink key={link.label} href={link.href} className="transition hover:text-blue-600">
              {link.label}
            </FormLink>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-4 lg:max-w-[760px]">
          <form
            action="/blog"
            method="get"
            className="hidden w-full min-w-0 flex-1 max-w-[760px] items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:flex"
          >
            <button type="submit" className="text-slate-500 transition hover:text-slate-900 dark:hover:text-white" aria-label="Search blog">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <input
              type="search"
              name="search"
              placeholder="Search"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </form>

          {!user ? (
            <div className="flex items-center gap-2">
              <FormLink
                href={`/auth/login?next=${nextParam}`}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
              >
                Sign In
              </FormLink>
              <FormLink
                href={`/auth/signup?next=${nextParam}`}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Register
              </FormLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {getInitial(displayName || user.email || "U")}
                </div>
              )}
              <div className="hidden max-w-[220px] sm:block">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                {user.email ? <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p> : null}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
              >
                Logout
              </button>
            </div>
          )}

          <FormLink
            href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
            className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 lg:inline-flex"
          >
            Subscribe Now
          </FormLink>
        </div>
      </div>

      <div className="mx-auto max-w-[92rem] px-4 pb-4 sm:hidden">
        <form
          action="/blog"
          method="get"
          className="flex w-full items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <button type="submit" className="text-slate-500 transition hover:text-slate-900 dark:hover:text-white" aria-label="Search blog">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </form>
      </div>
    </header>
  );
}
