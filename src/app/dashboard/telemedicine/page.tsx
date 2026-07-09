import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  TelemedicineView,
  type SessionRow,
  type Option,
} from "./telemedicine-view";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "RESEPSIONIS", "DOKTER", "PERAWAT"];

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();

  let sessions: SessionRow[] = [];
  let patients: Option[] = [];
  let doctors: Option[] = [];
  let canManage = false;

  if (tenant) {
    canManage = MANAGE_ROLES.includes(tenant.role);
    const [rows, pts, docs] = await Promise.all([
      db.teleconsultSession.findMany({
        where: { tenantId: tenant.tenantId },
        orderBy: { scheduledAt: "desc" },
        take: 100,
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

    sessions = rows.map((s) => ({
      id: s.id,
      roomCode: s.roomCode,
      scheduledAt: s.scheduledAt.toISOString(),
      patient: s.patient.name,
      mrNumber: s.patient.mrNumber,
      doctor: s.doctor.name,
      status: s.status,
    }));
    patients = pts.map((p) => ({ id: p.id, label: `${p.name} — ${p.mrNumber}` }));
    doctors = docs.map((m) => ({ id: m.user.id, label: m.user.name }));
  }

  return (
    <TelemedicineView
      sessions={sessions}
      patients={patients}
      doctors={doctors}
      canManage={canManage}
    />
  );
}
