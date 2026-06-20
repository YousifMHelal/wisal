import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/generated/prisma/client";

export type { UserRole };

/**
 * Role hierarchy — higher index = more permissions.
 * PLATFORM_ADMIN can access everything.
 */
export const ROLE_HIERARCHY: UserRole[] = [
  "OPERATOR",
  "SUPERVISOR",
  "COMPLIANCE",
  "EXECUTIVE",
  "PLATFORM_ADMIN",
];

export function roleIndex(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/** True if `userRole` meets or exceeds the `required` role. */
export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return roleIndex(userRole) >= roleIndex(required);
}

/**
 * Server-side guard. Redirects to /signin if unauthenticated.
 * Returns session with role on the user.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session;
}

/**
 * Server-side role guard. Throws if insufficient role.
 * Returns session — use in page/server-action code.
 */
export async function requireRole(minimumRole: UserRole) {
  const session = await requireAuth();
  if (!hasRole(session.user.role, minimumRole)) {
    redirect("/unauthorized");
  }
  return session;
}

/**
 * Server-side check without redirect — use in widget data fetchers
 * to decide whether to return full data or a locked placeholder.
 */
export async function checkRole(minimumRole: UserRole): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return hasRole(session.user.role, minimumRole);
}

/** Human-readable role label */
export const ROLE_LABELS: Record<UserRole, string> = {
  OPERATOR: "Operator",
  SUPERVISOR: "Supervisor",
  COMPLIANCE: "Compliance",
  EXECUTIVE: "Executive",
  PLATFORM_ADMIN: "Platform Admin",
};
