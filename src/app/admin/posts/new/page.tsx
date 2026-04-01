"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useAuth } from "@/contexts/AuthContext";

export default function NewPostPage() {
  const router = useRouter();
  const { loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState("");

  const handleSave = async (title: string, content: string) => {
    if (!title || !slug) {
      alert("Please enter a title and slug");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: slug.toLowerCase().replace(/\s+/g, "-"),
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      const post = await res.json();
      router.push(`/admin/posts/${post.id}/edit`);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
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
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-first-post"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Editor */}
      <MarkdownEditor onSave={handleSave} onAutoSave={handleSave} autoSaveInterval={10000} />
    </div>
  );
}
