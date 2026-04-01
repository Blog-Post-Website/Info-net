import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getUserFromRequest } from "@/lib/supabase/auth";
import { buildRateLimitKey, checkRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, validateVersionPayload } from "@/lib/api/validation";
import { apiError, apiSuccess, createApiContext, isValidationLikeError, logApiError } from "@/lib/api/response";

/**
 * GET /api/posts/[id]/versions
 * Get version history for a post
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = createApiContext(req, "GET /api/posts/[id]/versions");

  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    // Verify ownership
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return apiError(ctx, "Unauthorized", 403);
    }

    const { data, error } = await supabase
      .from("post_versions")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return apiSuccess(ctx, data || []);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to fetch versions", 500);
  }
}

/**
 * POST /api/posts/[id]/versions
 * Save version snapshot (for auto-save)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = createApiContext(req, "POST /api/posts/[id]/versions");

  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    const rate = checkRateLimit({
      key: buildRateLimitKey(req, `post-versions:${postId}`, user.id),
      limit: 180,
      windowMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return apiError(ctx, "Too many version save requests. Please try again later.", 429, {
        "Retry-After": `${rate.retryAfterSeconds}`,
      });
    }

    // Verify ownership
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return apiError(ctx, "Unauthorized", 403);
    }

    const payload = await parseJsonBody(req);
    const { title, content } = validateVersionPayload(payload);

    const { data, error } = await supabase.from("post_versions").insert([
      {
        post_id: postId,
        user_id: user.id,
        title,
        content,
      },
    ]);

    if (error) throw error;

    return apiSuccess(ctx, data, 201);
  } catch (error) {
    logApiError(ctx, error);
    if (isValidationLikeError(error)) {
      return apiError(ctx, error instanceof Error ? error.message : "Invalid request payload", 400);
    }
    return apiError(ctx, "Failed to save version", 500);
  }
}
