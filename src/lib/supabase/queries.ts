import { supabase } from "./client";
import type { Database } from "@/types/database";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
type Post = Database["public"]["Tables"]["posts"]["Row"];

/**
 * Get all published posts ordered by published_at descending
 */
export async function getPublishedPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a single post by slug (published only)
 */
export async function getPublishedPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a post with all related data by ID (only if user owns it or it's published)
 */
export async function getPostWithTags(postId: string, userId?: string) {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (postError) throw postError;

  // Check authorization
  if (post.status !== "published" && post.user_id !== userId) {
    throw new Error("Unauthorized to view this post");
  }

  // Get tags
  const { data: postTags, error: tagsError } = await supabase
    .from("post_tags")
    .select("tag_id, tags(id, name, slug)")
    .eq("post_id", postId);

  if (tagsError) throw tagsError;

  return {
    ...post,
    tags: postTags?.map((pt) => pt.tags).filter(Boolean) || [],
  };
}

/**
 * Create a new draft post
 */
export async function createPost(post: PostInsert) {
  const { data, error } = await supabase.from("posts").insert([post]).select().single();

  if (error) throw error;
  return data;
}

/**
 * Update a post
 */
export async function updatePost(postId: string, updates: PostUpdate) {
  const { data, error } = await supabase
    .from("posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a post (soft delete - archive)
 */
export async function deletePost(postId: string) {
  return updatePost(postId, { status: "archived" });
}

/**
 * Publish a post (set status to published and published_at timestamp)
 */
export async function publishPost(postId: string) {
  return updatePost(postId, {
    status: "published",
    published_at: new Date().toISOString(),
  });
}

/**
 * Create a version snapshot of a post
 */
export async function createPostVersion(
  postId: string,
  userId: string,
  title: string,
  content: string
) {
  const { data, error } = await supabase.from("post_versions").insert([
    {
      post_id: postId,
      user_id: userId,
      title,
      content,
    },
  ]);

  if (error) throw error;
  return data;
}

/**
 * Get version history for a post
 */
export async function getPostVersions(postId: string) {
  const { data, error } = await supabase
    .from("post_versions")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
