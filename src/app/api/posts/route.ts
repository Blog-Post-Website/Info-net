import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getUserFromRequest } from "@/lib/supabase/auth";

/**
 * POST /api/posts
 * Create a new draft post
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content = "", slug, excerpt = "", meta_description = "" } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug required" }, { status: 400 });
    }

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

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create post" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts
 * List all posts for authenticated user (drafts, published, archived)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
