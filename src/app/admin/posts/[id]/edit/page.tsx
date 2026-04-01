"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  const postId = params.id as string;

  useEffect(() => {
    if (authLoading) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        setPost(data);

        // Also fetch versions
        const versionsRes = await fetch(`/api/posts/${postId}/versions`);
        if (versionsRes.ok) {
          const versionsData = await versionsRes.json();
          setVersions(versionsData);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        alert("Failed to load post");
        router.push("/admin/posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, authLoading, router]);

  const handleSave = async (title: string, content: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, slug: post?.slug }),
      });

      if (!res.ok) throw new Error("Failed to update post");
      const updated = await res.json();
      setPost(updated);

      // Refresh versions
      const versionsRes = await fetch(`/api/posts/${postId}/versions`);
      if (versionsRes.ok) {
        const versionsData = await versionsRes.json();
        setVersions(versionsData);
      }
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Failed to save post");
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to publish post");
      const updated = await res.json();
      setPost(updated);
      alert("Post published!");
    } catch (err) {
      console.error("Error publishing post:", err);
      alert("Failed to publish post");
    }
  };

  if (authLoading || isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4 dark:border-gray-600">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {post.status === "published"
              ? `Published on ${new Date(post.published_at!).toLocaleDateString()}`
              : "Draft"}
          </p>
        </div>
        <div className="flex gap-2">
          {post.status === "draft" && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Publish
            </button>
          )}
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Versions ({versions.length})
          </button>
          <button
            onClick={() => router.push("/admin/posts")}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Versions Sidebar */}
      {showVersions && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Version History</h3>
          {versions.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{version.title}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {new Date(version.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No versions yet</p>
          )}
        </div>
      )}

      {/* Editor */}
      <MarkdownEditor
        initialTitle={post.title}
        initialContent={post.content}
        onSave={handleSave}
        onAutoSave={handleSave}
        autoSaveInterval={10000}
      />
    </div>
  );
}
