"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { encounterSaveSchema, diagnosisSchema } from "@/lib/schemas/encounter";

type ActionState = { error?: string; ok?: boolean } | undefined;

const CLINICAL_ROLES: Role[] = ["OWNER", "ADMIN", "DOKTER", "PERAWAT"];
const DIAGNOSIS_ROLES: Role[] = ["OWNER", "ADMIN", "DOKTER"];

async function requireContext(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const tenant = await getActiveTenant();
  if (!tenant) return { error: "Tidak ada fasilitas aktif." as const };
  if (!allowed.includes(tenant.role)) {
    return { error: "Anda tidak punya izin untuk aksi ini." as const };
  }
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

export async function createEncounter(formData: FormData) {
  const ctx = await requireContext(CLINICAL_ROLES);
  if ("error" in ctx) return;

  const patientId = String(formData.get("patientId") ?? "");
  const patient = await db.patient.findFirst({
    where: { id: patientId, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!patient) return;

  const encounter = await db.encounter.create({
    data: {
      tenantId: ctx.tenantId,
      patientId,
      doctorId: ctx.userId,
      status: "DIPERIKSA",
    },
  });
  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "CREATE",
    entity: "Encounter",
    entityId: encounter.id,
  });

  redirect(`/dashboard/rekam-medis/${encounter.id}`);
}

export async function saveEncounter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireContext(CLINICAL_ROLES);
  if ("error" in ctx) return { error: ctx.error };

  const id = String(formData.get("id") ?? "");
  const existing = await db.encounter.findFirst({
    where: { id, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!existing) return { error: "Kunjungan tidak ditemukan." };

  const parsed = encounterSaveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const v = parsed.data;

  await db.$transaction([
    db.encounter.update({
      where: { id },
      data: {
        status: v.status,
        subjective: v.subjective,
        objective: v.objective,
        assessment: v.assessment,
        plan: v.plan,
      },
    }),
    db.vitalSign.upsert({
      where: { encounterId: id },
      update: {
        systolic: v.systolic,
        diastolic: v.diastolic,
        temperature: v.temperature,
        heartRate: v.heartRate,
        respiratoryRate: v.respiratoryRate,
        spo2: v.spo2,
        weight: v.weight,
        height: v.height,
      },
      create: {
        encounterId: id,
        systolic: v.systolic,
        diastolic: v.diastolic,
        temperature: v.temperature,
        heartRate: v.heartRate,
        respiratoryRate: v.respiratoryRate,
        spo2: v.spo2,
        weight: v.weight,
        height: v.height,
      },
    }),
  ]);

  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "UPDATE",
    entity: "Encounter",
    entityId: id,
  });

  revalidatePath(`/dashboard/rekam-medis/${id}`);
  return { ok: true };
}

export async function addDiagnosis(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireContext(DIAGNOSIS_ROLES);
  if ("error" in ctx) return { error: ctx.error };

  const encounterId = String(formData.get("encounterId") ?? "");
  const encounter = await db.encounter.findFirst({
    where: { id: encounterId, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!encounter) return { error: "Kunjungan tidak ditemukan." };

  const parsed = diagnosisSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pilih diagnosa yang valid." };
  const v = parsed.data;

  await db.diagnosis.create({
    data: {
      encounterId,
      icdCode: v.icdCode,
      icdName: v.icdName,
      type: v.type,
    },
  });

  revalidatePath(`/dashboard/rekam-medis/${encounterId}`);
  return { ok: true };
}

export async function removeDiagnosis(formData: FormData) {
  const ctx = await requireContext(DIAGNOSIS_ROLES);
  if ("error" in ctx) return;

  const id = String(formData.get("id") ?? "");
  const diagnosis = await db.diagnosis.findUnique({
    where: { id },
    include: { encounter: { select: { tenantId: true, id: true } } },
  });
  if (!diagnosis || diagnosis.encounter.tenantId !== ctx.tenantId) return;

  await db.diagnosis.delete({ where: { id } });
  revalidatePath(`/dashboard/rekam-medis/${diagnosis.encounter.id}`);
}

// --- Resep elektronik ---

export async function addPrescriptionItem(formData: FormData) {
  const ctx = await requireContext(DIAGNOSIS_ROLES);
  if ("error" in ctx) return;

  const encounterId = String(formData.get("encounterId") ?? "");
  const drugId = String(formData.get("drugId") ?? "");
  const quantity = parseInt(String(formData.get("quantity") ?? "1"), 10);
  const dosage = String(formData.get("dosage") ?? "").trim() || undefined;
  const frequency = String(formData.get("frequency") ?? "").trim() || undefined;
  const instruction = String(formData.get("instruction") ?? "").trim() || undefined;
  if (!encounterId || !drugId) return;

  const encounter = await db.encounter.findFirst({
    where: { id: encounterId, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!encounter) return;

  await db.$transaction(async (tx) => {
    let prescription = await tx.prescription.findFirst({
      where: { encounterId },
    });
    if (!prescription) {
      prescription = await tx.prescription.create({
        data: { tenantId: ctx.tenantId, encounterId },
      });
    }
    await tx.prescriptionItem.create({
      data: {
        prescriptionId: prescription.id,
        drugId,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        dosage,
        frequency,
        instruction,
      },
    });
  });

  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "CREATE",
    entity: "PrescriptionItem",
    entityId: encounterId,
  });
  revalidatePath(`/dashboard/rekam-medis/${encounterId}`);
}

export async function removePrescriptionItem(formData: FormData) {
  const ctx = await requireContext(DIAGNOSIS_ROLES);
  if ("error" in ctx) return;

  const id = String(formData.get("id") ?? "");
  const item = await db.prescriptionItem.findUnique({
    where: { id },
    include: { prescription: { select: { tenantId: true, encounterId: true } } },
  });
  if (!item || item.prescription.tenantId !== ctx.tenantId) return;

  await db.prescriptionItem.delete({ where: { id } });
  revalidatePath(`/dashboard/rekam-medis/${item.prescription.encounterId}`);
}
