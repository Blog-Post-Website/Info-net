import { supabase } from "./client";
import type { Database } from "@/types/database";

type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

/**
 * Create or get a tag
 */
export async function upsertTag(userId: string, name: string, slug: string) {
  const { data, error } = await supabase
    .from("tags")
    .upsert(
      [{ user_id: userId, name, slug }],
      { onConflict: "user_id,slug" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all tags for a user
 */
export async function getUserTags(userId: string) {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Add a tag to a post
 */
export async function addTagToPost(postId: string, tagId: string) {
  const { error } = await supabase.from("post_tags").insert([{ post_id: postId, tag_id: tagId }]);

  if (error && error.code !== "23505") {
    // 23505 is unique constraint violation - tag already added
    throw error;
  }
}

/**
 * Remove a tag from a post
 */
export async function removeTagFromPost(postId: string, tagId: string) {
  const { error } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", postId)
    .eq("tag_id", tagId);

  if (error) throw error;
}

/**
 * Get all tags for a post
 */
export async function getPostTags(postId: string) {
  const { data, error } = await supabase
    .from("post_tags")
    .select("tags(*)")
    .eq("post_id", postId);

  if (error) throw error;
  return data?.map((pt) => pt.tags).filter(Boolean) || [];
}
