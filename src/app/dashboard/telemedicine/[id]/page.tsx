import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { RoomView } from "./room-view";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "RESEPSIONIS", "DOKTER", "PERAWAT"];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await auth();
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const s = await db.teleconsultSession.findFirst({
    where: { id, tenantId: tenant.tenantId },
    include: {
      patient: { select: { name: true, mrNumber: true } },
      doctor: { select: { name: true } },
    },
  });
  if (!s) notFound();

  return (
    <RoomView
      session={{
        id: s.id,
        roomCode: s.roomCode,
        status: s.status,
        scheduledAt: s.scheduledAt.toISOString(),
        startedAt: s.startedAt?.toISOString() ?? null,
        endedAt: s.endedAt?.toISOString() ?? null,
        note: s.note,
        patient: s.patient.name,
        mrNumber: s.patient.mrNumber,
        doctor: s.doctor.name,
        joinUrl: s.joinUrl,
      }}
      canManage={MANAGE_ROLES.includes(tenant.role)}
    />
  );
}
