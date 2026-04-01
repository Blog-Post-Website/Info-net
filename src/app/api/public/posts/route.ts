import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { parsePagination } from "@/lib/api/validation";
import { apiError, apiSuccess, createApiContext, logApiError } from "@/lib/api/response";

/**
 * GET /api/public/posts
 * Get published posts (public endpoint)
 */
export async function GET(req: NextRequest) {
  const ctx = createApiContext(req, "GET /api/public/posts");

  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return apiSuccess(ctx, data || []);
  } catch (error) {
    logApiError(ctx, error);
    return apiError(ctx, "Failed to fetch posts", 500);
  }
}
