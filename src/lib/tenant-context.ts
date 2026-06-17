import { cookies } from "next/headers";
import { auth } from "@/auth";
import type { MembershipInfo } from "@/lib/auth-types";

export const ACTIVE_TENANT_COOKIE = "smara-active-tenant";

/** Tenant aktif user saat ini, dari sesi + cookie pilihan (fallback: tenant pertama). */
export async function getActiveTenant(): Promise<MembershipInfo | null> {
  const session = await auth();
  const memberships = session?.user?.memberships ?? [];
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const wanted = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  return memberships.find((m) => m.tenantId === wanted) ?? memberships[0];
}
