import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User, UserRole } from "@/types";

/**
 * Get the current authenticated user with their profile data.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  return profile as User | null;
}

/**
 * Require the current user to have one of the allowed roles.
 * Redirects to login if not authenticated, or to dashboard if unauthorized.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/");
  }

  return user;
}

/**
 * Check if a user has a specific role.
 */
export function hasRole(user: User, role: UserRole): boolean {
  return user.role === role;
}

/**
 * Check if a user can access a specific deal.
 * Admins can access all deals. Other users must be deal members.
 */
export async function canAccessDeal(
  userId: string,
  dealId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Check if user is admin
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (user?.role === "admin") return true;

  // Check if user is a member of the deal
  const { data: membership } = await supabase
    .from("deal_members")
    .select("deal_id")
    .eq("deal_id", dealId)
    .eq("user_id", userId)
    .single();

  return !!membership;
}
