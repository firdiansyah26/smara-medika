import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  JadwalView,
  type ApptRow,
  type Option,
  type ApptFilter,
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
  let canManage = false;

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
          patient: { select: { name: true, mrNumber: true } },
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
      doctor: a.doctor.name,
      reason: a.reason,
      status: a.status,
    }));
    patients = pts.map((p) => ({ id: p.id, label: `${p.name} — ${p.mrNumber}` }));
    doctors = docs.map((m) => ({ id: m.user.id, label: m.user.name }));
  }

  return (
    <JadwalView
      filter={filter}
      appointments={appointments}
      patients={patients}
      doctors={doctors}
      canManage={canManage}
    />
  );
}
