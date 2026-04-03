"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_at: string;
}

type Story = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  slug: string;
  live: boolean;
  rank: number;
};

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

const demoStories: Omit<Story, "slug" | "live" | "rank">[] = [
  {
    id: "demo-1",
    title: "Why Edge AI Is Rewriting Frontend Performance in 2026",
    excerpt:
      "From on-device embeddings to latency budgets, this guide breaks down how teams ship AI features without tanking Core Web Vitals.",
    category: "AI Engineering",
    readTime: "7 min read",
    date: "Apr 03, 2026",
  },
  {
    id: "demo-2",
    title: "TypeScript 6 + React 20 Patterns That Actually Reduced Bugs",
    excerpt: "A production-focused playbook: stricter domain types, server boundaries, and event contracts that survived scale.",
    category: "Frontend",
    readTime: "9 min read",
    date: "Apr 02, 2026",
  },
  {
    id: "demo-3",
    title: "Serverless Security Checklist: 12 Mistakes We Found in Real Audits",
    excerpt: "Token leakage traps, SSR trust boundaries, and monitoring gaps teams still miss.",
    category: "Cloud Security",
    readTime: "11 min read",
    date: "Apr 01, 2026",
  },
  {
    id: "demo-4",
    title: "Postgres at Scale: Practical Index Strategies for Content Platforms",
    excerpt: "Index design patterns for posts, tags, and timelines with benchmark-backed tradeoffs.",
    category: "Data",
    readTime: "8 min read",
    date: "Mar 31, 2026",
  },
  {
    id: "demo-5",
    title: "Cybersecurity Teams Shift to Continuous Threat Modeling",
    excerpt: "How modern teams combine runtime signals with architecture maps to close risk faster.",
    category: "Security",
    readTime: "6 min read",
    date: "Mar 31, 2026",
  },
  {
    id: "demo-6",
    title: "The New Rule of Developer Productivity: Measure Cognitive Load",
    excerpt: "Engineering orgs are redesigning workflows around focus time and clarity metrics.",
    category: "Leadership",
    readTime: "5 min read",
    date: "Mar 30, 2026",
  },
  {
    id: "demo-7",
    title: "The Next Wave of Open Source Infrastructure Is Smaller and Sharper",
    excerpt: "A look at how lean maintainers are reshaping the ecosystem with opinionated toolchains.",
    category: "Open Source",
    readTime: "6 min read",
    date: "Mar 29, 2026",
  },
  {
    id: "demo-8",
    title: "Design Systems Are Becoming Content Systems",
    excerpt: "Editorial teams now want components that can carry both brand and publishing logic.",
    category: "Design",
    readTime: "4 min read",
    date: "Mar 28, 2026",
  },
];

const featuredTiles = [
  "bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#38bdf8_100%)]",
  "bg-[linear-gradient(135deg,#7c3aed_0%,#c4b5fd_100%)]",
  "bg-[linear-gradient(135deg,#0f766e_0%,#34d399_100%)]",
  "bg-[linear-gradient(135deg,#be123c_0%,#fb7185_100%)]",
  "bg-[linear-gradient(135deg,#334155_0%,#94a3b8_100%)]",
  "bg-[linear-gradient(135deg,#92400e_0%,#f59e0b_100%)]",
];

const contactEmail = "online.upskill.dev@gmail.com";

export default function HomePage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/public/posts?limit=12");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const hasLivePosts = posts.length > 0;

  const stories: Story[] = hasLivePosts
    ? posts.map((post, index) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.content.substring(0, 170),
        category: navLinks[index % navLinks.length]?.label || "Tech",
        readTime: `${5 + (index % 6)} min read`,
        date: new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        slug: post.slug,
        live: true,
        rank: index + 1,
      }))
    : demoStories.map((story, index) => ({
        ...story,
        slug: "",
        live: false,
        rank: index + 1,
      }));

  const featuredStories = useMemo(() => stories.slice(0, 6), [stories]);
  const topStories = useMemo(() => stories.slice(0, 4), [stories]);
  const trendingStories = useMemo(() => stories.slice(1, 7), [stories]);
  const latestStories = useMemo(() => stories.slice(4, 10), [stories]);

  const filteredLatest = searchQuery
    ? latestStories.filter((story) => {
        const q = searchQuery.toLowerCase();
        return story.title.toLowerCase().includes(q) || story.excerpt.toLowerCase().includes(q);
      })
    : latestStories;

  const renderStoryLink = (story: Story, className: string) => {
    if (!story.live) {
      return <span className={className}>{story.title}</span>;
    }

    return (
      <Link href={`/blog/${story.slug}`} className={className}>
        {story.title}
      </Link>
    );
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/blog");
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-black tracking-tight text-slate-900 no-underline hover:no-underline">
              InfoNet
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium text-slate-700 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="no-underline transition hover:text-blue-600 hover:no-underline">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-6 lg:max-w-[760px]">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full min-w-0 flex-1 max-w-[760px] items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 shadow-sm"
            >
              <button type="submit" className="text-slate-500 transition hover:text-slate-900" aria-label="Search blog">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </form>
            <Link
              href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-blue-700 hover:no-underline sm:inline-flex"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-600 lg:hidden">
          <div className="flex flex-wrap gap-3">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="font-medium no-underline hover:text-blue-600 hover:no-underline">
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:no-underline"
          >
            Subscribe Now
          </Link>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Featured Article</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Editorial grid
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
              {featuredStories.map((story, index) => {
                const isHero = index === 0;
                return (
                  <article
                    key={story.id}
                    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${
                      isHero ? "lg:col-span-2 lg:row-span-2" : ""
                    }`}
                  >
                    <div className={`relative ${isHero ? "h-72" : "h-40"} ${featuredTiles[index % featuredTiles.length]}`}>
                      <div className="absolute inset-0 bg-black/15" />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                        {story.category}
                      </div>
                    </div>
                    <div className={`p-4 ${isHero ? "sm:p-6" : ""}`}>
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                        <span>{story.date}</span>
                        <span>•</span>
                        <span>{story.readTime}</span>
                      </div>
                      {renderStoryLink(
                        story,
                        `${isHero ? "text-3xl sm:text-4xl" : "text-xl"} block font-black leading-tight transition hover:text-blue-600`
                      )}
                      <p className={`mt-3 text-slate-600 ${isHero ? "max-w-2xl text-base" : "text-sm"}`}>
                        {story.excerpt}
                      </p>
                      <div className="mt-5">
                        {story.live ? (
                          <Link href={`/blog/${story.slug}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                            Read article
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">Demo story</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-3xl font-black tracking-tight">Top Stories</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Now</span>
            </div>
            <div className="space-y-4">
              {topStories.map((story, index) => (
                <article key={story.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="grid grid-cols-[32px_1fr] gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {index + 1}
                    </div>
                    <div>
                      {renderStoryLink(story, "block text-lg font-bold leading-snug transition hover:text-blue-600")}
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                        {story.category} • {story.date}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black tracking-tight">Latest News</h3>
                <p className="mt-2 text-sm text-slate-500">Fresh posts and editor notes from the desk</p>
              </div>
              <Link href="/blog" className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">
                See all
              </Link>
            </div>

            <div className="space-y-4">
              {(searchQuery ? filteredLatest : latestStories).map((story, index) => (
                <article key={story.id} className="grid gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:grid-cols-[140px_1fr]">
                  <div
                    className={`h-24 rounded-2xl ${
                      index % 3 === 0
                        ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                        : index % 3 === 1
                          ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                          : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                    }`}
                  />
                  <div>
                    {renderStoryLink(story, "text-2xl font-black leading-tight transition hover:text-blue-600")}
                    <p className="mt-2 text-sm text-slate-600">{story.excerpt}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      {story.category} • {story.date}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-[#101826] p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Subscribe</p>
              <h4 className="mt-3 text-3xl font-black leading-tight">Get the latest tech stories first</h4>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Join readers who want concise, high-signal updates on engineering, AI, security, and product strategy.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
                >
                  Subscribe via email
                </Link>
                <p className="text-xs text-slate-400">Send a message to {contactEmail}</p>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-2xl font-black">Editor Picks</h4>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Selected
                </span>
              </div>
              <div className="space-y-3">
                {stories.slice(0, 3).map((story) => (
                  <article key={story.id} className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{story.category}</p>
                    <div className="mt-2 text-lg font-bold leading-snug">{renderStoryLink(story, "transition hover:text-blue-600")}</div>
                    <p className="mt-2 text-sm text-slate-600">{story.date} • {story.readTime}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        {!hasLivePosts && !postsLoading && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Demo content is visible right now. Publish posts from the admin dashboard to replace it with real stories.
          </div>
        )}

        <footer className="mt-14 rounded-[28px] bg-[#111827] px-6 py-8 text-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
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
                {navLinks.map((link) => (
                  <p key={link.label}>{link.label}</p>
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
                <Link
                  href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
                  className="rounded-xl bg-emerald-500 px-3 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
                >
                  Email to subscribe
                </Link>
                <p className="text-xs text-slate-400">{contactEmail}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-4 text-xs text-slate-400">© 2026 InfoNet. All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}
