import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/client";

function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim() || null;
}

export async function getUserFromRequest(req: NextRequest) {
  const token = extractBearerToken(req);
  if (!token) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user ?? null;
}
