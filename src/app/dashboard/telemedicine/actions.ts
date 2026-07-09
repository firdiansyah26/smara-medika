"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { canStart, canEnd, canCancel, makeRoomCode } from "@/lib/teleconsult-flow";

const TELE_ROLES: Role[] = ["OWNER", "ADMIN", "RESEPSIONIS", "DOKTER", "PERAWAT"];

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !TELE_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

/** Jadwalkan sesi telekonsultasi baru. */
export async function createSession(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const patientId = String(formData.get("patientId") ?? "");
  const doctorId = String(formData.get("doctorId") ?? "");
  const scheduledRaw = String(formData.get("scheduledAt") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const scheduledAt = new Date(scheduledRaw);
  if (!patientId || !doctorId || Number.isNaN(scheduledAt.getTime())) return;

  // Validasi pasien & dokter milik tenant aktif.
  const patient = await db.patient.findFirst({
    where: { id: patientId, tenantId: c.tenantId },
    select: { id: true },
  });
  const doctor = await db.membership.findFirst({
    where: { userId: doctorId, tenantId: c.tenantId },
    select: { userId: true },
  });
  if (!patient || !doctor) return;

  const session = await db.teleconsultSession.create({
    data: {
      tenantId: c.tenantId,
      patientId,
      doctorId,
      scheduledAt,
      note,
      roomCode: makeRoomCode(`${patientId}${doctorId}${scheduledRaw}`),
      createdById: c.userId,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "TeleconsultSession",
    entityId: session.id,
  });

  revalidatePath("/dashboard/telemedicine");
  redirect(`/dashboard/telemedicine/${session.id}`);
}

async function loadOwn(sessionId: string, tenantId: string) {
  return db.teleconsultSession.findFirst({
    where: { id: sessionId, tenantId },
    select: { id: true, status: true },
  });
}

/** SCHEDULED → ONGOING. */
export async function startSession(sessionId: string): Promise<void> {
  const c = await ctx();
  if (!c) return;
  const s = await loadOwn(sessionId, c.tenantId);
  if (!s || !canStart(s.status)) return;
  await db.teleconsultSession.update({
    where: { id: sessionId },
    data: { status: "ONGOING", startedAt: new Date() },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "TeleconsultSession",
    entityId: sessionId,
    changes: { status: "ONGOING" },
  });
  revalidatePath(`/dashboard/telemedicine/${sessionId}`);
}

/** ONGOING → ENDED. */
export async function endSession(sessionId: string): Promise<void> {
  const c = await ctx();
  if (!c) return;
  const s = await loadOwn(sessionId, c.tenantId);
  if (!s || !canEnd(s.status)) return;
  await db.teleconsultSession.update({
    where: { id: sessionId },
    data: { status: "ENDED", endedAt: new Date() },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "TeleconsultSession",
    entityId: sessionId,
    changes: { status: "ENDED" },
  });
  revalidatePath(`/dashboard/telemedicine/${sessionId}`);
}

/** SCHEDULED → CANCELLED. */
export async function cancelSession(sessionId: string): Promise<void> {
  const c = await ctx();
  if (!c) return;
  const s = await loadOwn(sessionId, c.tenantId);
  if (!s || !canCancel(s.status)) return;
  await db.teleconsultSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "TeleconsultSession",
    entityId: sessionId,
    changes: { status: "CANCELLED" },
  });
  revalidatePath(`/dashboard/telemedicine/${sessionId}`);
}
