"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role, AppointmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { notifyEmail } from "@/lib/notify";
import { appointmentReminderEmail } from "@/lib/email";

const APPT_ROLES: Role[] = [
  "OWNER",
  "ADMIN",
  "RESEPSIONIS",
  "DOKTER",
  "PERAWAT",
];

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !APPT_ROLES.includes(tenant.role)) return null;
  return {
    userId: session.user.id,
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
  };
}

/** Kirim pengingat janji temu ke email pasien (dicatat di log notifikasi). */
export async function sendAppointmentReminder(
  formData: FormData,
): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const appt = await db.appointment.findFirst({
    where: { id: appointmentId, tenantId: c.tenantId },
    include: {
      patient: { select: { name: true, email: true } },
      doctor: { select: { name: true } },
    },
  });
  if (!appt) return;

  const scheduledAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(appt.scheduledAt);

  const tmpl = appointmentReminderEmail({
    facilityName: c.tenantName,
    patientName: appt.patient.name,
    doctorName: appt.doctor.name,
    scheduledAt,
  });
  await notifyEmail({
    tenantId: c.tenantId,
    type: "APPOINTMENT_REMINDER",
    to: appt.patient.email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
    relatedType: "Appointment",
    relatedId: appointmentId,
    createdById: c.userId,
  });
  revalidatePath("/dashboard/jadwal");
  revalidatePath("/dashboard/notifikasi");
}

export async function createAppointment(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const patientId = String(formData.get("patientId") ?? "");
  const doctorId = String(formData.get("doctorId") ?? "");
  const scheduledRaw = String(formData.get("scheduledAt") ?? "");
  const durationMin = Math.max(
    5,
    parseInt(String(formData.get("durationMin") ?? "30"), 10) || 30,
  );
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!patientId || !doctorId || !scheduledRaw) return;

  const scheduledAt = new Date(scheduledRaw);
  if (isNaN(scheduledAt.getTime())) return;

  const [patient, doctorMembership] = await Promise.all([
    db.patient.findFirst({
      where: { id: patientId, tenantId: c.tenantId, deletedAt: null },
      select: { id: true },
    }),
    db.membership.findFirst({
      where: { userId: doctorId, tenantId: c.tenantId, isActive: true },
      select: { id: true },
    }),
  ]);
  if (!patient || !doctorMembership) return;

  const appt = await db.appointment.create({
    data: {
      tenantId: c.tenantId,
      patientId,
      doctorId,
      scheduledAt,
      durationMin,
      reason,
      createdById: c.userId,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "Appointment",
    entityId: appt.id,
    changes: { patientId, doctorId, scheduledAt: scheduledAt.toISOString() },
  });
  revalidatePath("/dashboard/jadwal");
}

export async function updateAppointmentStatus(
  formData: FormData,
): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const status = String(formData.get("status") ?? "") as AppointmentStatus;
  if (!["CONFIRMED", "CANCELLED", "NO_SHOW", "SCHEDULED"].includes(status))
    return;

  const appt = await db.appointment.findFirst({
    where: { id: appointmentId, tenantId: c.tenantId },
    select: { id: true, status: true },
  });
  if (!appt || appt.status === "COMPLETED") return;

  await db.appointment.update({
    where: { id: appt.id },
    data: { status },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "Appointment",
    entityId: appt.id,
    changes: { from: appt.status, to: status },
  });
  revalidatePath("/dashboard/jadwal");
}

/** Mulai kunjungan dari appointment: buat encounter & tandai appointment selesai. */
export async function startVisit(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const appt = await db.appointment.findFirst({
    where: { id: appointmentId, tenantId: c.tenantId },
  });
  if (!appt || appt.status === "COMPLETED" || appt.status === "CANCELLED")
    return;

  const encounter = await db.$transaction(async (tx) => {
    const enc = await tx.encounter.create({
      data: {
        tenantId: c.tenantId,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        status: "DIPERIKSA",
      },
    });
    await tx.appointment.update({
      where: { id: appt.id },
      data: { status: "COMPLETED", encounterId: enc.id },
    });
    return enc;
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "Encounter",
    entityId: encounter.id,
    changes: { fromAppointment: appt.id },
  });

  redirect(`/dashboard/rekam-medis/${encounter.id}`);
}
