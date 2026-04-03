import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAccessTokenFromRequest, getUserFromRequest } from "@/lib/supabase/auth";
import { buildRateLimitKey, checkRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, validateCreatePostPayload } from "@/lib/api/validation";
import { apiError, apiSuccess, createApiContext, isValidationLikeError, logApiError } from "@/lib/api/response";

/**
 * POST /api/posts
 * Create a new draft post
 */
export async function POST(req: NextRequest) {
  const ctx = createApiContext(req, "POST /api/posts");

  try {
    const accessToken = getAccessTokenFromRequest(req);
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    const supabase = createSupabaseServerClient(accessToken);

    const rate = checkRateLimit({
      key: buildRateLimitKey(req, "post-create", user.id),
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return apiError(ctx, "Too many requests. Please try again later.", 429, {
        "Retry-After": `${rate.retryAfterSeconds}`,
      });
    }

    const payload = await parseJsonBody(req);
    const { title, content, slug, excerpt, meta_description } = validateCreatePostPayload(payload);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: user.id,
          title,
          content,
          slug,
          excerpt,
          meta_description,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return apiSuccess(ctx, data, 201);
  } catch (error) {
    logApiError(ctx, error);
    if (isValidationLikeError(error)) {
      return apiError(ctx, error instanceof Error ? error.message : "Invalid request payload", 400);
    }
    return apiError(ctx, "Failed to create post", 500);
  }
}

/**
 * GET /api/posts
 * List all posts for authenticated user (drafts, published, archived)
 */
export async function GET(req: NextRequest) {
  const ctx = createApiContext(req, "GET /api/posts");

  try {
    const accessToken = getAccessTokenFromRequest(req);
    const user = await getUserFromRequest(req);

    if (!user) {
      return apiError(ctx, "Unauthorized", 401);
    }

    const supabase = createSupabaseServerClient(accessToken);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return apiSuccess(ctx, data);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to fetch posts", 500);
  }
}
