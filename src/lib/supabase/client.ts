import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function normalizeSupabaseUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl.trim());
  if (!parsed.protocol.startsWith("http")) {
    throw new Error("Invalid Supabase URL protocol.");
  }

  // Use origin only so accidental path suffixes like /auth/v1 do not break auth endpoints.
  return parsed.origin;
}

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!rawSupabaseUrl || !supabaseAnonKey) {
  // Keep this explicit to fail fast in development if env vars are missing.
  throw new Error("Missing Supabase environment variables.");
}

let supabaseUrl = "";
try {
  supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
} catch {
  throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL. Expected format: https://<project-ref>.supabase.co");
}

export const supabase = createClient<Database, "public">(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
