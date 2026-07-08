"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role, ServiceType } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { startOfToday } from "@/lib/queue";
import { writeAudit } from "@/lib/audit";

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

/** Daftarkan tiket antrian jadi kunjungan (encounter) + tandai SERVED. */
export async function registerVisit(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const ticketId = String(formData.get("ticketId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  if (!ticketId || !patientId) return;

  const ticket = await db.queueTicket.findFirst({
    where: { id: ticketId, tenantId: c.tenantId },
    select: { id: true, status: true, encounterId: true },
  });
  if (!ticket || ticket.encounterId) return;

  const patient = await db.patient.findFirst({
    where: { id: patientId, tenantId: c.tenantId, deletedAt: null },
    select: { id: true },
  });
  if (!patient) return;

  const encounter = await db.$transaction(async (tx) => {
    const enc = await tx.encounter.create({
      data: {
        tenantId: c.tenantId,
        patientId,
        doctorId: c.userId,
        status: "DIPERIKSA",
      },
    });
    await tx.queueTicket.update({
      where: { id: ticket.id },
      data: {
        status: "SERVED",
        servedAt: new Date(),
        patientId,
        encounterId: enc.id,
      },
    });
    return enc;
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "Encounter",
    entityId: encounter.id,
    changes: { fromTicket: ticket.id },
  });

  redirect(`/dashboard/rekam-medis/${encounter.id}`);
}
