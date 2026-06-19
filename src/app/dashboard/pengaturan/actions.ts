"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";

const MANAGE_ROLES: Role[] = ["OWNER", "ADMIN"];
const VALID_ROLES: Role[] = [
  "OWNER",
  "ADMIN",
  "DOKTER",
  "PERAWAT",
  "RESEPSIONIS",
  "APOTEKER",
];

export type SettingsErrorCode =
  | "required"
  | "exists"
  | "lastOwner"
  | "self"
  | "notAllowed";

export type InviteState = { error?: SettingsErrorCode; ok?: boolean };

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !MANAGE_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

/** Jumlah Pemilik aktif lain di tenant selain membership tertentu. */
async function otherActiveOwners(tenantId: string, exceptMembershipId: string) {
  return db.membership.count({
    where: {
      tenantId,
      role: "OWNER",
      isActive: true,
      id: { not: exceptMembershipId },
    },
  });
}

export async function inviteMember(
  _prev: InviteState | undefined,
  formData: FormData,
): Promise<InviteState> {
  const c = await ctx();
  if (!c) return { error: "notAllowed" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "") as Role;
  const password = String(formData.get("password") ?? "");

  if (!email || !VALID_ROLES.includes(role) || !password) {
    return { error: "required" };
  }

  let user = await db.user.findUnique({ where: { email } });

  if (user) {
    const existing = await db.membership.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId: c.tenantId } },
    });
    if (existing && existing.isActive) return { error: "exists" };
    if (existing) {
      // Aktifkan kembali keanggotaan nonaktif
      await db.membership.update({
        where: { id: existing.id },
        data: { role, isActive: true, invitedById: c.userId },
      });
      revalidatePath("/dashboard/pengaturan");
      await writeAudit({
        tenantId: c.tenantId,
        userId: c.userId,
        action: "UPDATE",
        entity: "Membership",
        entityId: existing.id,
        changes: { role, reactivated: true },
      });
      return { ok: true };
    }
  } else {
    user = await db.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: await bcrypt.hash(password, 10),
      },
    });
  }

  const membership = await db.membership.create({
    data: {
      userId: user.id,
      tenantId: c.tenantId,
      role,
      invitedById: c.userId,
    },
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "Membership",
    entityId: membership.id,
    changes: { email, role },
  });

  revalidatePath("/dashboard/pengaturan");
  return { ok: true };
}

export async function updateMemberRole(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!membershipId || !VALID_ROLES.includes(role)) return;

  const m = await db.membership.findFirst({
    where: { id: membershipId, tenantId: c.tenantId },
  });
  if (!m) return;
  if (m.userId === c.userId) return; // tidak ubah diri sendiri
  if (m.role === role) return;

  // Jangan turunkan Pemilik terakhir
  if (m.role === "OWNER" && role !== "OWNER") {
    if ((await otherActiveOwners(c.tenantId, m.id)) === 0) return;
  }

  await db.membership.update({ where: { id: m.id }, data: { role } });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "Membership",
    entityId: m.id,
    changes: { from: m.role, to: role },
  });
  revalidatePath("/dashboard/pengaturan");
}

export async function removeMember(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const membershipId = String(formData.get("membershipId") ?? "");
  if (!membershipId) return;

  const m = await db.membership.findFirst({
    where: { id: membershipId, tenantId: c.tenantId },
  });
  if (!m) return;
  if (m.userId === c.userId) return; // tidak keluarkan diri sendiri

  if (m.role === "OWNER" && (await otherActiveOwners(c.tenantId, m.id)) === 0) {
    return; // jangan keluarkan Pemilik terakhir
  }

  await db.membership.delete({ where: { id: m.id } });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "DELETE",
    entity: "Membership",
    entityId: m.id,
    changes: { userId: m.userId, role: m.role },
  });
  revalidatePath("/dashboard/pengaturan");
}
