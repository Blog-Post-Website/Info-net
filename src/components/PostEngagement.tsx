"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

type EngagementProps = {
  postId: string;
  postTitle: string;
  postSlug: string;
  siteUrl: string;
};

type CommentItem = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user?: {
    display_name: string | null;
    avatar_url: string | null;
  };
};

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getInitial(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed[0]!.toUpperCase() : "U";
}

export default function PostEngagement({ postId, postTitle, postSlug, siteUrl }: EngagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const canonicalUrl = useMemo(() => `${siteUrl}/blog/${postSlug}`, [siteUrl, postSlug]);
  const nextParam = useMemo(() => encodeURIComponent(pathname || `/blog/${postSlug}`), [pathname, postSlug]);

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(canonicalUrl);
    const encodedTitle = encodeURIComponent(postTitle);

    return {
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
  }, [canonicalUrl, postTitle]);

  const redirectToAuth = (mode: "login" | "signup") => {
    const href = mode === "login" ? `/auth/login?next=${nextParam}` : `/auth/signup?next=${nextParam}`;
    router.push(href);
  };

  const loadLikes = useCallback(async () => {
    const { count } = await supabase
      .from("post_likes")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", postId);

    setLikeCount(typeof count === "number" ? count : 0);

    if (!user) {
      setLiked(false);
      return;
    }

    const { count: likedCount } = await supabase
      .from("post_likes")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setLiked((likedCount || 0) > 0);
  }, [postId, user]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);

    const { data } = await supabase
      .from("post_comments")
      .select("id, user_id, post_id, content, created_at, users:users(display_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    const mapped = (Array.isArray(data) ? data : []).map((row) => {
      const record = row as unknown as {
        id: string;
        user_id: string;
        post_id: string;
        content: string;
        created_at: string;
        users?: { display_name: string | null; avatar_url: string | null } | null;
      };

      return {
        id: record.id,
        user_id: record.user_id,
        post_id: record.post_id,
        content: record.content,
        created_at: record.created_at,
        user: record.users ?? undefined,
      } satisfies CommentItem;
    });

    setComments(mapped);
    setCommentsLoading(false);
  }, [postId]);

  useEffect(() => {
    void loadLikes();
  }, [loadLikes]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      toast({ variant: "success", title: "Copied", message: "Link copied to clipboard." });
    } catch {
      toast({ variant: "error", title: "Copy failed", message: "Could not copy the link." });
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      redirectToAuth("login");
      return;
    }

    if (likeLoading) return;

    setLikeLoading(true);

    try {
      if (!liked) {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        setLiked(true);
        setLikeCount((c) => c + 1);
      } else {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      toast({ variant: "error", title: "Like failed", message: err instanceof Error ? err.message : "Please try again." });
      await loadLikes();
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      redirectToAuth("login");
      return;
    }

    const content = commentText.trim();
    if (!content) {
      toast({ variant: "error", title: "Empty comment", message: "Write something before posting." });
      return;
    }

    if (commentSubmitting) return;

    setCommentSubmitting(true);

    try {
      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: postId, user_id: user.id, content });

      if (error) throw error;

      setCommentText("");
      toast({ variant: "success", title: "Posted", message: "Your comment is live." });
      await loadComments();
    } catch (err) {
      toast({ variant: "error", title: "Comment failed", message: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={shareLinks.x}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
          >
            Share on X
          </a>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
          >
            Facebook
          </a>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
          >
            LinkedIn
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
          >
            Copy link
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleLike}
          disabled={likeLoading}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            liked
              ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
              : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
          } disabled:opacity-50`}
        >
          {liked ? "Liked" : "Like"} ({likeCount})
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-950 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">Comments</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{comments.length}</p>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-slate-700 dark:text-slate-200">Sign in to write a comment.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => redirectToAuth("login")}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => redirectToAuth("signup")}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-gray-800 dark:text-slate-200 dark:hover:bg-gray-900"
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              placeholder="Write a comment..."
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Be respectful and stay on topic.</p>
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={commentSubmitting}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {commentSubmitting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 divide-y divide-slate-100 dark:divide-gray-800">
          {commentsLoading ? (
            <p className="py-3 text-sm text-slate-500 dark:text-slate-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="py-3 text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>
          ) : (
            comments.map((comment) => {
              const label = comment.user?.display_name || "User";
              const avatar = comment.user?.avatar_url || "";

              return (
                <article key={comment.id} className="py-4">
                  <div className="flex items-start gap-3">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                        {getInitial(label)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatShortDate(comment.created_at)}</p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
