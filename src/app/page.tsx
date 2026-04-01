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

const roadmap = [
  "Authentication and protected admin dashboard",
  "Post editor with autosave and markdown preview",
  "SEO-optimized blog listing and detail pages",
  "Supabase-backed content, tags, and categories",
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
        const res = await fetch("/api/public/posts?limit=3");
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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="rounded-3xl border border-emerald-100/70 bg-white/85 dark:bg-gray-900/85 dark:border-emerald-900/50 p-8 shadow-[0_16px_50px_rgba(16,32,23,0.08)] backdrop-blur sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Production Baseline
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl">
            Human-Operated Blog Platform
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 dark:text-gray-300 sm:text-lg">
            Next.js + Supabase + Vercel starter is ready. This foundation is configured for secure auth,
            CMS-style workflows, and SEO-first publishing.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {roadmap.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-gray-300"
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
              className="rounded-lg border border-slate-300 dark:border-gray-600 px-6 py-2 font-medium text-slate-700 dark:text-gray-300 transition hover:bg-slate-50 dark:hover:bg-gray-800"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>

      {/* Recent Posts Section */}
      {!postsLoading && posts.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Latest Posts</h2>
              <p className="text-gray-600 dark:text-gray-400">Explore our latest blog articles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {post.excerpt || post.content.substring(0, 100)}...
                  </p>
                  <div className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Read more →
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700"
              >
                View All Posts
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
