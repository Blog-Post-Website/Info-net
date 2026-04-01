import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getUserFromRequest } from "@/lib/supabase/auth";
import { buildRateLimitKey, checkRateLimit } from "@/lib/api/rate-limit";

/**
 * POST /api/posts/[id]/publish
 * Publish a draft post
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = checkRateLimit({
      key: buildRateLimitKey(req, "post-publish", user.id),
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many publish requests. Please try again later." },
        { status: 429, headers: { "Retry-After": `${rate.retryAfterSeconds}` } }
      );
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, status")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (post.status === "published") {
      return NextResponse.json({ error: "Post already published" }, { status: 400 });
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/posts/[id]/publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish post" },
      { status: 500 }
    );
  }
}
