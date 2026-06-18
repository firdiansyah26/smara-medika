"use server";

import { revalidatePath } from "next/cache";
import type { Role, ServiceType } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { startOfToday } from "@/lib/queue";

const QUEUE_ROLES: Role[] = ["OWNER", "ADMIN", "RESEPSIONIS", "PERAWAT"];

async function ctx() {
  const session = await auth();
  if (!session?.user) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !QUEUE_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

export async function callNext(serviceType: ServiceType, counter: string) {
  const c = await ctx();
  if (!c) return;
  const next = await db.queueTicket.findFirst({
    where: {
      tenantId: c.tenantId,
      serviceType,
      status: "WAITING",
      createdAt: { gte: startOfToday() },
    },
    orderBy: { number: "asc" },
  });
  if (!next) return;
  await db.queueTicket.update({
    where: { id: next.id },
    data: { status: "CALLED", counter, calledAt: new Date(), calledById: c.userId },
  });
  revalidatePath("/dashboard/antrian");
}

export async function recallTicket(ticketId: string) {
  const c = await ctx();
  if (!c) return;
  const tk = await db.queueTicket.findFirst({
    where: { id: ticketId, tenantId: c.tenantId },
  });
  if (!tk) return;
  await db.queueTicket.update({
    where: { id: ticketId },
    data: { status: "CALLED", calledAt: new Date() },
  });
  revalidatePath("/dashboard/antrian");
}

export async function serveTicket(ticketId: string) {
  const c = await ctx();
  if (!c) return;
  const tk = await db.queueTicket.findFirst({
    where: { id: ticketId, tenantId: c.tenantId },
  });
  if (!tk) return;
  await db.queueTicket.update({
    where: { id: ticketId },
    data: { status: "SERVED", servedAt: new Date() },
  });
  revalidatePath("/dashboard/antrian");
}

export async function skipTicket(ticketId: string) {
  const c = await ctx();
  if (!c) return;
  const tk = await db.queueTicket.findFirst({
    where: { id: ticketId, tenantId: c.tenantId },
  });
  if (!tk) return;
  await db.queueTicket.update({
    where: { id: ticketId },
    data: { status: "SKIPPED" },
  });
  revalidatePath("/dashboard/antrian");
}
