import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAccessTokenFromRequest, getUserFromRequest } from "@/lib/supabase/auth";
import { buildRateLimitKey, checkRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, validateCreatePostPayload } from "@/lib/api/validation";
import { apiError, apiSuccess, createApiContext, isValidationLikeError, logApiError } from "@/lib/api/response";

function getPostgrestishError(error: unknown): { code?: string; message?: string; details?: string | null; hint?: string | null } | null {
  if (!error || typeof error !== "object") return null;
  const anyErr = error as Record<string, unknown>;
  const code = typeof anyErr.code === "string" ? anyErr.code : undefined;
  const message = typeof anyErr.message === "string" ? anyErr.message : undefined;
  const details = typeof anyErr.details === "string" ? anyErr.details : null;
  const hint = typeof anyErr.hint === "string" ? anyErr.hint : null;

  if (!code && !message) return null;
  return { code, message, details, hint };
}

function mapCreatePostError(error: unknown): { status: number; message: string } | null {
  const pg = getPostgrestishError(error);
  if (!pg) return null;

  const msg = (pg.message ?? "").toLowerCase();

  // Unique constraint / duplicate value
  if (pg.code === "23505" || msg.includes("duplicate")) {
    return { status: 409, message: "Slug already exists. Please choose a different slug." };
  }

  // Row-level security / permissions
  if (pg.code === "42501" || msg.includes("row-level security") || msg.includes("permission denied")) {
    return { status: 403, message: "Permission denied. Please sign out and sign in again." };
  }

  // Invalid text representation / bad input
  if (pg.code === "22P02") {
    return { status: 400, message: "Invalid input." };
  }

  return null;
}

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
    const { title, content, slug, excerpt, meta_description, featured_image_url } =
      validateCreatePostPayload(payload);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: user.id,
          title,
          content,
          slug,
          excerpt,
          featured_image_url,
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

    const mapped = mapCreatePostError(error);
    if (mapped) {
      return apiError(ctx, mapped.message, mapped.status);
    }

    // If we got a structured error from PostgREST, surface its message for admin-only endpoints.
    const pg = getPostgrestishError(error);
    if (pg?.message) {
      return apiError(ctx, pg.message, 500);
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
