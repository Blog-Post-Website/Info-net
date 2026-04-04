"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormLink from "@/components/FormLink";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/admin-login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const revokeNonAdminSession = async () => {
      if (!loading && user && !isAdmin) {
        await signOut();
        router.push("/auth/admin-login?error=not-admin");
      }
    };

    void revokeNonAdminSession();
  }, [user, isAdmin, loading, signOut, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/auth/admin-login");
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm">
        <div className="sticky top-0 flex h-20 items-center border-b border-slate-200 px-6">
          <h1 className="text-lg font-bold text-slate-900">Blog Admin</h1>
        </div>

        <nav className="space-y-1 px-3 py-4">
          <FormLink href="/admin/dashboard" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            Dashboard
          </FormLink>
          <FormLink href="/admin/posts" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            Posts
          </FormLink>
          <FormLink href="/admin/categories" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            Categories
          </FormLink>
          <FormLink href="/admin/tags" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            Tags
          </FormLink>
          <FormLink href="/admin/account" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            Change Password
          </FormLink>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="mt-3 w-full rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          >
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
