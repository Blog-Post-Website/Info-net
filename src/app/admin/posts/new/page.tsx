"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/auth-fetch";

function normalizeSlug(raw: string) {
  const base = raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base.length > 120 ? base.slice(0, 120).replace(/-+$/g, "") : base;
}

export default function NewPostPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const [slug, setSlug] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");

  const handleSave = async (title: string, content: string) => {
    const normalizedSlug = normalizeSlug(slug);

    if (!title || !normalizedSlug) {
      alert("Please enter a title and slug");
      return;
    }

    try {
      const res = await authFetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: normalizedSlug,
          featured_image_url: featuredImageUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        let message = "Failed to create post";
        try {
          const data = (await res.json()) as { error?: unknown };
          if (typeof data?.error === "string" && data.error.trim()) {
            message = data.error;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const post = await res.json();
      router.push(`/admin/posts/${post.id}/edit`);
    } catch (err) {
      console.error("Error creating post:", err);
      alert(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4 dark:border-gray-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start writing a new blog post</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Slug Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Post Slug (URL-friendly identifier)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(normalizeSlug(e.target.value))}
            placeholder="my-first-post"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Use lowercase letters, numbers, and hyphens only.</p>
        </div>

        {/* Thumbnail / Featured Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail Image URL (optional)
          </label>
          <input
            type="url"
            value={featuredImageUrl}
            onChange={(e) => setFeaturedImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Use a direct http(s) image URL (jpg/png/webp).</p>
        </div>

        {/* Editor */}
        <MarkdownEditor onSave={handleSave} autoSaveInterval={10000} />
      </div>
    </div>
  );
}
