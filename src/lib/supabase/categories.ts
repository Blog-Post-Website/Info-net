import { supabase } from "./client";
import type { Database } from "@/types/database";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

/**
 * Create a new category
 */
export async function createCategory(userId: string, name: string, slug: string, description?: string) {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ user_id: userId, name, slug, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all categories for a user
 */
export async function getUserCategories(userId: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<{ name: string; slug: string; description: string }>
) {
  const { data, error } = await supabase
    .from("categories")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) throw error;
}
