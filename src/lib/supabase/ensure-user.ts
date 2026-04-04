import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function ensurePublicUserRow(
  supabase: SupabaseClient<Database, "public">,
  user: User
) {
  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (!email) {
    throw new Error("User email is missing. Please sign out and sign in again.");
  }

  const { error } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw error;
  }
}
