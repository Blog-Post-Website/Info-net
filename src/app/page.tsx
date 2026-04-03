"use client";

import { useEffect, useState } from "react";
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
};

const navCategories = ["World", "AI", "Business", "Tech", "Science", "Security", "Culture"];

const demoStories: Omit<Story, "slug" | "live">[] = [
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
];

export default function HomePage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

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
        category: navCategories[index % navCategories.length] || "Tech",
        readTime: `${5 + (index % 6)} min read`,
        date: new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        slug: post.slug,
        live: true,
      }))
    : demoStories.map((story) => ({ ...story, slug: "", live: false }));

  const featured = stories[0];
  const topStories = stories.slice(0, 4);
  const trendingStories = stories.slice(1, 4);
  const latestStories = stories.slice(4, 10);

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

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-2xl font-black tracking-tight">InfoNet</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Daily Tech Desk
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {navCategories.map((category) => (
              <span key={category} className="rounded-md px-3 py-1 text-slate-600 transition hover:bg-slate-100">
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-10">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <div className="h-64 rounded-t-2xl bg-[linear-gradient(120deg,#0f172a_0%,#1d4ed8_45%,#38bdf8_100%)] sm:h-72" />
            <div className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Featured Analysis</p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                {featured ? featured.title : "How AI, Security, and Cloud Costs Are Colliding in 2026"}
              </h2>
              <p className="mt-4 max-w-3xl text-slate-600">
                {featured
                  ? `${featured.excerpt}...`
                  : "An editorial look at the biggest strategic shift in modern software teams, and what engineering leaders are changing right now."}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
                <span>By InfoNet Desk</span>
                <span>•</span>
                <span>{featured ? featured.date : "Apr 03, 2026"}</span>
              </div>
              <div className="mt-6">
                <Link
                  href={featured?.live ? `/blog/${featured.slug}` : "/blog"}
                  className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Read feature
                </Link>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <h3 className="mb-5 text-3xl font-extrabold tracking-tight">Top Stories</h3>
            <div className="space-y-4">
              {topStories.map((story, index) => (
                <div key={story.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      {renderStoryLink(story, "text-xl font-semibold leading-snug hover:text-blue-600")}
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                        {story.category} • {story.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-4xl font-black tracking-tight">Trending In Tech</h3>
              <p className="mt-2 text-sm text-slate-500">Top discussion topics across engineering teams this week</p>
            </div>
            <Link href="/blog" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              View all
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trendingStories.map((story, index) => (
              <article key={story.id} className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.1)]">
                <div
                  className={`mb-3 h-36 rounded-lg ${
                    index === 0
                      ? "bg-[linear-gradient(120deg,#1d4ed8_0%,#38bdf8_100%)]"
                      : index === 1
                        ? "bg-[linear-gradient(120deg,#7c3aed_0%,#c4b5fd_100%)]"
                        : "bg-[linear-gradient(120deg,#0f766e_0%,#34d399_100%)]"
                  }`}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{story.category}</p>
                <div className="mt-2 text-xl font-bold leading-snug">
                  {renderStoryLink(story, "hover:text-blue-600")}
                </div>
                <p className="mt-3 text-sm text-slate-600">{story.excerpt}</p>
                <div className="mt-4 text-xs font-medium text-slate-500">{story.readTime} • {story.date}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <h3 className="mb-5 text-4xl font-black tracking-tight">Latest News</h3>
            <div className="space-y-4">
              {latestStories.map((story, index) => (
                <article key={story.id} className="grid gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:grid-cols-[130px_1fr]">
                  <div
                    className={`h-24 rounded-lg ${
                      index % 3 === 0
                        ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                        : index % 3 === 1
                          ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                          : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                    }`}
                  />
                  <div>
                    <div className="text-2xl font-bold leading-snug">{renderStoryLink(story, "hover:text-blue-600")}</div>
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
            <div className="rounded-2xl border border-slate-200 bg-[#101826] p-6 text-white shadow-[0_14px_36px_rgba(15,23,42,0.2)]">
              <h4 className="text-3xl font-black leading-tight">Get sharp weekly tech briefings</h4>
              <p className="mt-2 text-sm text-slate-300">Join product builders and engineers reading our weekly trend memo.</p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400">
                  Join
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
              <h4 className="mb-4 text-2xl font-black">Editor Picks</h4>
              <div className="space-y-3">
                {stories.slice(0, 3).map((story) => (
                  <article key={story.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="text-sm font-semibold">{renderStoryLink(story, "hover:text-blue-600")}</div>
                    <p className="mt-1 text-xs uppercase tracking-[0.1em] text-slate-500">{story.category}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!hasLivePosts && !postsLoading && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You are currently seeing curated demo content. Publish posts from admin to automatically replace all demo sections with real articles.
          </div>
        )}

        <footer className="mt-14 rounded-2xl bg-[#111827] px-6 py-8 text-slate-200">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-2xl font-black">InfoNet</p>
              <p className="mt-2 text-sm text-slate-400">Your one-stop editorial on software, AI, security, and digital product strategy.</p>
              <p className="mt-4 text-sm text-slate-400">hello@infonet.dev</p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Sections</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>Tech</p>
                <p>AI</p>
                <p>Security</p>
                <p>Cloud</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Company</p>
              <div className="mt-3 space-y-2 text-sm">
                <p>About</p>
                <p>Contact</p>
                <p>Privacy</p>
                <p>Terms</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Stay Updated</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-500"
                />
                <button className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-900">Go</button>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-4 text-xs text-slate-400">© 2026 InfoNet. All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}
