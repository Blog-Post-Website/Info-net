"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminEmail: string;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase();
  const isAdmin = !!user?.email && user.email.toLowerCase() === adminEmail;

  useEffect(() => {
    const upsertPublicUser = async () => {
      if (!user?.id || !user.email) return;

      const displayNameRaw = (user.user_metadata as Record<string, unknown> | undefined)?.full_name;
      const avatarUrlRaw = (user.user_metadata as Record<string, unknown> | undefined)?.avatar_url;

      const email = user.email.trim();
      const display_name = typeof displayNameRaw === "string" && displayNameRaw.trim() ? displayNameRaw.trim() : email.split("@")[0] || null;
      const avatar_url = typeof avatarUrlRaw === "string" && avatarUrlRaw.trim() ? avatarUrlRaw.trim() : null;

      try {
        await supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              email,
              display_name,
              avatar_url,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      } catch {
        // Ignore: this is best-effort and is also ensured on server-side admin writes.
      }
    };

    void upsertPublicUser();
  }, [user]);

  useEffect(() => {
    // Check current session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (_error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminEmail, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
