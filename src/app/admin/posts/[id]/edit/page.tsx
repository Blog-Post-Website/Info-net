"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/auth-fetch";
import { uploadThumbnailFromDevice } from "@/lib/supabase/storage";

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  featured_image_url?: string | null;
}

type PostVersion = {
  id: string;
  title: string;
  created_at: string;
};

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState("");

  const postId = params.id as string;

  const handleThumbnailUpload = async (file: File) => {
    setThumbnailUploadError("");
    setThumbnailUploading(true);
    try {
      const url = await uploadThumbnailFromDevice(file, user?.id);
      setFeaturedImageUrl(url);
    } catch (err) {
      console.error("Thumbnail upload failed:", err);
      setThumbnailUploadError(err instanceof Error ? err.message : "Failed to upload thumbnail");
    } finally {
      setThumbnailUploading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchPost = async () => {
      try {
        const res = await authFetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        setPost(data);
        setFeaturedImageUrl(typeof data?.featured_image_url === "string" ? data.featured_image_url : "");

        // Also fetch versions
        const versionsRes = await authFetch(`/api/posts/${postId}/versions`);
        if (versionsRes.ok) {
          const versionsData = (await versionsRes.json()) as unknown;
          setVersions(Array.isArray(versionsData) ? (versionsData as PostVersion[]) : []);
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
      const res = await authFetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: post?.slug,
          featured_image_url: featuredImageUrl.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update post");
      const updated = await res.json();
      setPost(updated);

      // Refresh versions
      const versionsRes = await authFetch(`/api/posts/${postId}/versions`);
      if (versionsRes.ok) {
        const versionsData = await versionsRes.json();
        setVersions(versionsData);
      }
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Failed to save post");
    }
  };

  const handleAutoSave = async (title: string, content: string) => {
    try {
      const res = await authFetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: post?.slug,
          featured_image_url: featuredImageUrl.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to auto-save post");
      const updated = await res.json();
      setPost(updated);
    } catch (err) {
      console.error("Error auto-saving post:", err);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await authFetch(`/api/posts/${postId}/publish`, {
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
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Post not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
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
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Saved to the post as its thumbnail/featured image.</p>

          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or upload from device
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={thumbnailUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handleThumbnailUpload(file);
              }}
              className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 dark:file:border-gray-600 dark:file:bg-gray-800 dark:file:text-gray-200 dark:hover:file:bg-gray-700"
            />
            {thumbnailUploading ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Uploading...</p>
            ) : null}
            {thumbnailUploadError ? (
              <p className="mt-2 text-xs text-red-600">{thumbnailUploadError}</p>
            ) : null}
          </div>
        </div>

        {/* Editor */}
        <MarkdownEditor
          initialTitle={post.title}
          initialContent={post.content}
          onSave={handleSave}
          onAutoSave={handleAutoSave}
          autoSaveInterval={10000}
        />
      </div>
    </div>
  );
}
