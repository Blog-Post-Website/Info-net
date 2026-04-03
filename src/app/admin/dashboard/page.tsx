"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getPublishedPosts } from "@/lib/supabase/queries";
import { useEffect, useState } from "react";

interface PostStats {
  total: number;
  published: number;
  drafts: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PostStats>({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        // For now, just load published posts as example
        // In Phase 3, we'll add full CRUD with user-specific posts
        const posts = await getPublishedPosts();
        setStats({
          total: posts.length,
          published: posts.length,
          drafts: 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Welcome back! Here&apos;s what&apos;s happening with your blog.</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Total Posts Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Total Posts</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="mt-2 text-xs text-slate-500">All-time posts</p>
            </div>

            {/* Published Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Published</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.published}</p>
              <p className="mt-2 text-xs text-slate-500">Live on the blog</p>
            </div>

            {/* Drafts Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-600">Drafts</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{stats.drafts}</p>
              <p className="mt-2 text-xs text-slate-500">Work in progress</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <a
              href="/admin/posts/new"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center font-medium text-emerald-700 hover:bg-emerald-100"
            >
              + New Post
            </a>
            <a
              href="/admin/posts"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
            >
              View All Posts
            </a>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">Next Steps</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>✓ Phase 1: Database schema created</li>
            <li>✓ Phase 2: Authentication setup complete</li>
            <li>→ Phase 3: Build the post editor and CRUD operations</li>
            <li>→ Phase 4: Implement markdown editor with autosave</li>
            <li>→ Phase 5: Add SEO optimization and sitemap</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
