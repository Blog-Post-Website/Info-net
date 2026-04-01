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

type DemoPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  trendScore: number;
};

const demoTrendingPosts: DemoPost[] = [
  {
    id: "demo-1",
    title: "Why Edge AI Is Rewriting Frontend Performance in 2026",
    excerpt:
      "From on-device embeddings to latency budgets, this guide breaks down how teams are shipping AI features without tanking Core Web Vitals.",
    category: "AI Engineering",
    readTime: "7 min read",
    trendScore: 98,
  },
  {
    id: "demo-2",
    title: "TypeScript 6 + React 20 Patterns That Actually Reduced Bugs",
    excerpt:
      "A production-focused playbook: stricter domain types, server boundaries, and event contracts that survived scale.",
    category: "Frontend",
    readTime: "9 min read",
    trendScore: 95,
  },
  {
    id: "demo-3",
    title: "Serverless Security Checklist: 12 Mistakes We Found in Real Audits",
    excerpt:
      "An opinionated checklist for Next.js and Supabase teams, including token leakage traps, SSR trust boundaries, and monitoring gaps.",
    category: "Cloud Security",
    readTime: "11 min read",
    trendScore: 93,
  },
  {
    id: "demo-4",
    title: "Postgres at Scale: Practical Index Strategies for Content Platforms",
    excerpt:
      "Index design patterns for posts, tags, and timelines with benchmark-backed tradeoffs and migration notes.",
    category: "Data",
    readTime: "8 min read",
    trendScore: 91,
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
        const res = await fetch("/api/public/posts?limit=8");
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
  const heroPost = hasLivePosts ? posts[0] : null;
  const secondaryPosts = hasLivePosts ? posts.slice(1, 5) : [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f7efe2_0%,_#ffffff_35%,_#eef4ff_100%)]">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-12">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">InfoNet Editorial</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Tech Pulse</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Breaking analysis, deep engineering guides, and market-moving trends across AI, web engineering, and cloud systems.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Open Full Blog
          </Link>
        </header>

        {!postsLoading && heroPost && (
          <section className="mb-12 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Link
              href={`/blog/${heroPost.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(25,45,80,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(25,45,80,0.14)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Featured Story</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{heroPost.title}</h2>
              <p className="mt-4 text-slate-600">{heroPost.excerpt || heroPost.content.substring(0, 220)}...</p>
              <div className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600">Continue reading</div>
            </Link>

            <div className="space-y-3">
              {secondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt || post.content.substring(0, 120)}...</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(!hasLivePosts || postsLoading) && (
          <section className="mb-12 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {postsLoading
              ? "Loading latest posts..."
              : "No published posts yet. Showing demo Tech trending cards below so you can visualize the homepage layout."}
          </section>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900">Trending In Tech</h2>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">
              Top Picks
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(hasLivePosts ? posts.slice(0, 4).map((post, index) => ({
              id: post.id,
              title: post.title,
              excerpt: post.excerpt || post.content.substring(0, 160),
              category: "Tech",
              readTime: `${6 + index} min read`,
              trendScore: 90 - index,
              slug: post.slug,
              live: true,
            })) : demoTrendingPosts.map((post) => ({ ...post, slug: "", live: false }))).map((post) => (
              post.live ? (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(25,45,80,0.12)]"
                >
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">{post.category}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug text-slate-900">{post.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Trend score: {post.trendScore}</span>
                    <span className="text-sm font-semibold text-blue-600">Read</span>
                  </div>
                </Link>
              ) : (
                <article
                  key={post.id}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">{post.category}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug text-slate-900">{post.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Trend score: {post.trendScore}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Demo</span>
                  </div>
                </article>
              )
            ))}
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Browse all posts
          </Link>
        </div>
      </div>
    </main>
  );
}
