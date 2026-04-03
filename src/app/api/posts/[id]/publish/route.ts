import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAccessTokenFromRequest, getUserFromRequest } from "@/lib/supabase/auth";
import { buildRateLimitKey, checkRateLimit } from "@/lib/api/rate-limit";
import { apiError, apiSuccess, createApiContext, logApiError } from "@/lib/api/response";

/**
 * POST /api/posts/[id]/publish
 * Publish a draft post
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = createApiContext(req, "POST /api/posts/[id]/publish");

  try {
    const { id: postId } = await params;
    const accessToken = getAccessTokenFromRequest(req);
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    const supabase = createSupabaseServerClient(accessToken);

    const rate = checkRateLimit({
      key: buildRateLimitKey(req, "post-publish", user.id),
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return apiError(ctx, "Too many publish requests. Please try again later.", 429, {
        "Retry-After": `${rate.retryAfterSeconds}`,
      });
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("id, user_id, status")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return apiError(ctx, "Post not found", 404);
    }

    if (post.user_id !== user.id) {
      return apiError(ctx, "Unauthorized", 403);
    }

    if (post.status === "published") {
      return apiError(ctx, "Post already published", 400);
    }

    const { data, error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;

    return apiSuccess(ctx, data);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to publish post", 500);
  }
}
