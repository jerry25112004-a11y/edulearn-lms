import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";
import type { Role } from "@prisma/client";

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "INSTRUCTOR":
      return "/instructor/dashboard";
    case "STUDENT":
      return "/student/dashboard";
    default:
      return "/";
  }
}

/**
 * Requires an authenticated user. Redirects to /login if not authenticated.
 * This must be called at the top of every protected server component / layout
 * — it is the server-side enforcement point, independent of any client-side
 * navigation hiding.
 */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Requires an authenticated user with one of the given roles.
 * Redirects to /unauthorized if the role does not match.
 */
export async function requireRole(roles: Role | Role[]): Promise<SessionPayload> {
  const session = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) {
    redirect("/unauthorized");
  }
  return session;
}

/** Returns the session, or null. Does not redirect. Use in public pages that adapt to auth state. */
export async function getOptionalUser(): Promise<SessionPayload | null> {
  return getSession();
}
