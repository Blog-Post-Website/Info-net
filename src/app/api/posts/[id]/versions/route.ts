import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getUserFromRequest } from "@/lib/supabase/auth";

/**
 * GET /api/posts/[id]/versions
 * Get version history for a post
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("post_versions")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/posts/[id]/versions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts/[id]/versions
 * Save version snapshot (for auto-save)
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, content } = await req.json();

    const { data, error } = await supabase.from("post_versions").insert([
      {
        post_id: postId,
        user_id: user.id,
        title,
        content,
      },
    ]);

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts/[id]/versions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save version" },
      { status: 500 }
    );
  }
}
