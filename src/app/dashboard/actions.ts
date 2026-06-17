"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { ACTIVE_TENANT_COOKIE } from "@/lib/tenant-context";

/** Ganti tenant aktif (validasi user memang anggota tenant tsb). */
export async function switchTenant(tenantId: string) {
  const session = await auth();
  const isMember = session?.user?.memberships?.some(
    (m) => m.tenantId === tenantId,
  );
  if (!isMember) return;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/dashboard", "layout");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
