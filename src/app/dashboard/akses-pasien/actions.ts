"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";

async function ctx() {
  const session = await auth();
  if (!session?.user) return null;
  const tenant = await getActiveTenant();
  if (!tenant) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

function maskNik(nik: string | null): string | null {
  if (!nik) return null;
  if (nik.length <= 8) return nik;
  return `${nik.slice(0, 4)}${"*".repeat(nik.length - 8)}${nik.slice(-4)}`;
}

export type SearchResult = {
  id: string;
  name: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  city: string | null;
  nikMasked: string | null;
  ownerName: string;
  requestStatus: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED" | null;
};

/** Cari pasien lintas tenant (info terbatas). */
export async function searchCrossTenant(query: string): Promise<SearchResult[]> {
  const c = await ctx();
  if (!c) return [];
  const q = query.trim();
  if (q.length < 2) return [];

  const patients = await db.patient.findMany({
    where: {
      deletedAt: null,
      tenantId: { not: c.tenantId },
      OR: [
        { nik: { contains: q } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 10,
    include: { tenant: { select: { name: true } } },
  });

  const reqs = await db.patientAccessRequest.findMany({
    where: {
      requesterTenantId: c.tenantId,
      patientId: { in: patients.map((p) => p.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const statusByPatient = new Map<string, SearchResult["requestStatus"]>();
  for (const r of reqs) {
    if (!statusByPatient.has(r.patientId)) statusByPatient.set(r.patientId, r.status);
  }

  return patients.map((p) => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    city: p.city,
    nikMasked: maskNik(p.nik),
    ownerName: p.tenant.name,
    requestStatus: statusByPatient.get(p.id) ?? null,
  }));
}

/** Wrapper untuk useActionState (baca query dari formData). */
export async function searchAction(
  _prev: SearchResult[] | null,
  formData: FormData,
): Promise<SearchResult[]> {
  return searchCrossTenant(String(formData.get("q") ?? ""));
}

export async function requestAccess(patientId: string, reason: string) {
  const c = await ctx();
  if (!c) return;
  const patient = await db.patient.findFirst({
    where: { id: patientId, deletedAt: null },
    select: { id: true, tenantId: true },
  });
  if (!patient || patient.tenantId === c.tenantId) return;

  const existing = await db.patientAccessRequest.findFirst({
    where: {
      patientId,
      requesterTenantId: c.tenantId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });
  if (existing) return;

  const r = await db.patientAccessRequest.create({
    data: {
      patientId,
      ownerTenantId: patient.tenantId,
      requesterTenantId: c.tenantId,
      requestedById: c.userId,
      reason: reason.trim() || undefined,
      status: "PENDING",
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "PatientAccessRequest",
    entityId: r.id,
  });
  revalidatePath("/dashboard/akses-pasien");
}

export async function respondAccess(id: string, approve: boolean) {
  const c = await ctx();
  if (!c) return;
  const r = await db.patientAccessRequest.findFirst({
    where: { id, ownerTenantId: c.tenantId, status: "PENDING" },
  });
  if (!r) return;

  const expiresAt = approve
    ? new Date(Date.now() + 30 * 86400000)
    : null;
  await db.patientAccessRequest.update({
    where: { id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      respondedById: c.userId,
      expiresAt,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "PatientAccessRequest",
    entityId: id,
    changes: { status: approve ? "APPROVED" : "REJECTED" },
  });
  revalidatePath("/dashboard/akses-pasien");
}

export async function revokeAccess(id: string) {
  const c = await ctx();
  if (!c) return;
  const r = await db.patientAccessRequest.findFirst({
    where: { id, ownerTenantId: c.tenantId, status: "APPROVED" },
  });
  if (!r) return;
  await db.patientAccessRequest.update({
    where: { id },
    data: { status: "REVOKED" },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "PatientAccessRequest",
    entityId: id,
    changes: { status: "REVOKED" },
  });
  revalidatePath("/dashboard/akses-pasien");
}

/** Cek apakah tenant aktif punya akses APPROVED & belum kedaluwarsa ke pasien. */
export async function hasPatientAccess(
  tenantId: string,
  patientId: string,
): Promise<boolean> {
  const r = await db.patientAccessRequest.findFirst({
    where: {
      patientId,
      requesterTenantId: tenantId,
      status: "APPROVED",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return !!r;
}
