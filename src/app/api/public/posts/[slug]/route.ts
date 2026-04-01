import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { apiError, apiSuccess, createApiContext, logApiError } from "@/lib/api/response";

/**
 * GET /api/public/posts/[slug]
 * Get single published post by slug (public endpoint)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = createApiContext(req, "GET /api/public/posts/[slug]");

  try {
    const { slug } = await params;

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      return apiError(ctx, "Post not found", 404);
    }

    return apiSuccess(ctx, data);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to fetch post", 500);
  }
}
