"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";

const PARTNER_ROLES: Role[] = ["OWNER", "ADMIN"];

async function ctx() {
  const session = await auth();
  if (!session?.user) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !PARTNER_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

export async function requestPartnership(addresseeTenantId: string) {
  const c = await ctx();
  if (!c || addresseeTenantId === c.tenantId) return;

  const existing = await db.tenantPartnership.findFirst({
    where: {
      status: { in: ["PENDING", "ACTIVE"] },
      OR: [
        { requesterTenantId: c.tenantId, addresseeTenantId },
        { requesterTenantId: addresseeTenantId, addresseeTenantId: c.tenantId },
      ],
    },
  });
  if (existing) return;

  const p = await db.tenantPartnership.create({
    data: {
      requesterTenantId: c.tenantId,
      addresseeTenantId,
      status: "PENDING",
      requestedById: c.userId,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "TenantPartnership",
    entityId: p.id,
  });
  revalidatePath("/dashboard/rekanan");
}

export async function respondPartnership(id: string, accept: boolean) {
  const c = await ctx();
  if (!c) return;
  const p = await db.tenantPartnership.findFirst({
    where: { id, addresseeTenantId: c.tenantId, status: "PENDING" },
  });
  if (!p) return;

  await db.tenantPartnership.update({
    where: { id },
    data: {
      status: accept ? "ACTIVE" : "REJECTED",
      respondedById: c.userId,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "TenantPartnership",
    entityId: id,
  });
  revalidatePath("/dashboard/rekanan");
}

export async function endPartnership(id: string) {
  const c = await ctx();
  if (!c) return;
  const p = await db.tenantPartnership.findFirst({
    where: {
      id,
      status: "ACTIVE",
      OR: [{ requesterTenantId: c.tenantId }, { addresseeTenantId: c.tenantId }],
    },
  });
  if (!p) return;

  await db.tenantPartnership.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "TenantPartnership",
    entityId: id,
  });
  revalidatePath("/dashboard/rekanan");
}
