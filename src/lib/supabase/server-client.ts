import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createSupabaseServerClient(accessToken?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  } as const;

  if (!accessToken) {
    return createClient<Database, "public">(supabaseUrl, supabaseAnonKey, options);
  }

  return createClient<Database, "public">(supabaseUrl, supabaseAnonKey, {
    ...options,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
