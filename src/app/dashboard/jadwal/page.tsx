import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { DEFAULT_WA_TEMPLATES } from "@/lib/wa-templates";
import {
  JadwalView,
  type ApptRow,
  type Option,
  type ApptFilter,
  type ScheduleRow,
} from "./jadwal-view";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "RESEPSIONIS", "DOKTER", "PERAWAT"];
const FILTERS: ApptFilter[] = ["today", "upcoming", "all"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await auth();
  const tenant = await getActiveTenant();
  const sp = await searchParams;
  const filter: ApptFilter = FILTERS.includes(sp.filter as ApptFilter)
    ? (sp.filter as ApptFilter)
    : "upcoming";

  let appointments: ApptRow[] = [];
  let patients: Option[] = [];
  let doctors: Option[] = [];
  let schedules: ScheduleRow[] = [];
  let canManage = false;
  let facilityName = "";
  let waReminderTemplate = DEFAULT_WA_TEMPLATES.APPOINTMENT_REMINDER;

  if (tenant) {
    canManage = MANAGE_ROLES.includes(tenant.role);
    const now = new Date();
    let where: Record<string, unknown> = { tenantId: tenant.tenantId };
    if (filter === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      where = { ...where, scheduledAt: { gte: start, lte: end } };
    } else if (filter === "upcoming") {
      where = { ...where, scheduledAt: { gte: now } };
    }

    const [appts, pts, docs] = await Promise.all([
      db.appointment.findMany({
        where,
        orderBy: { scheduledAt: filter === "all" ? "desc" : "asc" },
        include: {
          patient: { select: { name: true, mrNumber: true, phone: true } },
          doctor: { select: { name: true } },
        },
      }),
      db.patient.findMany({
        where: { tenantId: tenant.tenantId, deletedAt: null },
        orderBy: { name: "asc" },
        take: 200,
        select: { id: true, name: true, mrNumber: true },
      }),
      db.membership.findMany({
        where: {
          tenantId: tenant.tenantId,
          isActive: true,
          role: { in: ["DOKTER", "OWNER"] },
        },
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    appointments = appts.map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt.toISOString(),
      durationMin: a.durationMin,
      patient: a.patient.name,
      mrNumber: a.patient.mrNumber,
      phone: a.patient.phone,
      doctor: a.doctor.name,
      reason: a.reason,
      status: a.status,
    }));
    patients = pts.map((p) => ({ id: p.id, label: `${p.name} — ${p.mrNumber}` }));
    doctors = docs.map((m) => ({ id: m.user.id, label: m.user.name }));

    const nameById = new Map(doctors.map((d) => [d.id, d.label]));
    const sched = await db.doctorSchedule.findMany({
      where: { tenantId: tenant.tenantId },
      orderBy: [{ doctorId: "asc" }, { dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    schedules = sched.map((s) => ({
      id: s.id,
      doctorId: s.doctorId,
      doctor: nameById.get(s.doctorId) ?? "—",
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    facilityName = tenant.tenantName;
    const waTmpl = await db.whatsappTemplate.findUnique({
      where: {
        tenantId_purpose: {
          tenantId: tenant.tenantId,
          purpose: "APPOINTMENT_REMINDER",
        },
      },
      select: { body: true },
    });
    if (waTmpl) waReminderTemplate = waTmpl.body;
  }

  return (
    <JadwalView
      filter={filter}
      appointments={appointments}
      patients={patients}
      doctors={doctors}
      schedules={schedules}
      canManage={canManage}
      facilityName={facilityName}
      waReminderTemplate={waReminderTemplate}
    />
  );
}
