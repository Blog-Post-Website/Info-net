import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getUserFromRequest } from "@/lib/supabase/auth";
import { buildRateLimitKey, checkRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, validateUpdatePostPayload } from "@/lib/api/validation";
import { apiError, apiSuccess, createApiContext, isValidationLikeError, logApiError } from "@/lib/api/response";

/**
 * GET /api/posts/[id]
 * Get single post (published or owned by user)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = createApiContext(req, "GET /api/posts/[id]");

  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    let query = supabase.from("posts").select("*").eq("id", postId);

    // If not authenticated, only get published posts
    if (!user) {
      query = query.eq("status", "published");
    } else {
      // If authenticated, get published OR owned posts
      query = query.or(`status.eq.published,user_id.eq.${user.id}`);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return apiError(ctx, "Post not found", 404);
    }

    return apiSuccess(ctx, data);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to fetch post", 500);
  }
}

/**
 * PUT /api/posts/[id]
 * Update post (drafts only, or publish)
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = createApiContext(req, "PUT /api/posts/[id]");

  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    const rate = checkRateLimit({
      key: buildRateLimitKey(req, `post-update:${postId}`, user.id),
      limit: 120,
      windowMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return apiError(ctx, "Too many update requests. Please try again later.", 429, {
        "Retry-After": `${rate.retryAfterSeconds}`,
      });
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, title, content")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return apiError(ctx, "Post not found", 404);
    }

    if (post.user_id !== user.id) {
      return apiError(ctx, "Unauthorized", 403);
    }

    const payload = await parseJsonBody(req);
    const updates = validateUpdatePostPayload(payload);

    // Create version snapshot before updating
    await supabase.from("post_versions").insert([
      {
        post_id: postId,
        user_id: user.id,
        title: post.title,
        content: post.content,
      },
    ]);

    // Update post
    const { data, error } = await supabase
      .from("posts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;

    return apiSuccess(ctx, data);
  } catch (error) {
    logApiError(ctx, error);
    if (isValidationLikeError(error)) {
      return apiError(ctx, error instanceof Error ? error.message : "Invalid request payload", 400);
    }
    return apiError(ctx, "Failed to update post", 500);
  }
}

/**
 * DELETE /api/posts/[id]
 * Soft delete (archive) post
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = createApiContext(req, "DELETE /api/posts/[id]");

  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    const rate = checkRateLimit({
      key: buildRateLimitKey(req, "post-delete", user.id),
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return apiError(ctx, "Too many delete requests. Please try again later.", 429, {
        "Retry-After": `${rate.retryAfterSeconds}`,
      });
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return apiError(ctx, "Post not found", 404);
    }

    if (post.user_id !== user.id) {
      return apiError(ctx, "Unauthorized", 403);
    }

    // Soft delete (archive)
    const { data, error } = await supabase
      .from("posts")
      .update({ status: "archived" })
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;

    return apiSuccess(ctx, data);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to delete post", 500);
  }
}
