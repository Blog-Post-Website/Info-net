"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { authFetch } from "@/lib/auth-fetch";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export default function AdminPostsPage() {
  const { loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (loading) return;

    const fetchPosts = async () => {
      try {
        const res = await authFetch("/api/posts");
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [loading]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesFilter = filter === "all" || post.status === filter;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [posts, filter, searchQuery]);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {stats.total} total • {stats.published} published • {stats.drafts} drafts
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Post
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <div className="flex gap-2">
          {(["all", "draft", "published", "archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Updated
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {post.slug}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : post.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2 flex">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      Edit
                    </Link>
                    {post.status === "draft" && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await authFetch(`/api/posts/${post.id}/publish`, {
                              method: "POST",
                            });
                            if (res.ok) {
                              setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: "published" as const } : p)));
                            }
                          } catch (err) {
                            console.error("Error publishing post:", err);
                          }
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm("Delete this post?")) {
                          try {
                            const res = await authFetch(`/api/posts/${post.id}`, {
                              method: "DELETE",
                            });
                            if (res.ok) {
                              setPosts(posts.filter((p) => p.id !== post.id));
                            }
                          } catch (err) {
                            console.error("Error deleting post:", err);
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No posts found. {searchQuery && "Try adjusting your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
