"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { generateMrNumber } from "@/lib/mr-number";
import { writeAudit } from "@/lib/audit";
import { allergyFormSchema, patientFormSchema } from "@/lib/schemas/patient";

type ActionState = { error?: string } | undefined;

const MANAGE_ROLES: Role[] = ["OWNER", "ADMIN", "RESEPSIONIS"];
const CLINICAL_ROLES: Role[] = ["OWNER", "ADMIN", "DOKTER", "PERAWAT"];

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

export async function createPatient(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireContext(MANAGE_ROLES);
  if ("error" in ctx) return { error: ctx.error };

  const parsed = patientFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const v = parsed.data;

  const patient = await db.$transaction(async (tx) => {
    const mrNumber = await generateMrNumber(tx, ctx.tenantId);
    return tx.patient.create({
      data: {
        tenantId: ctx.tenantId,
        mrNumber,
        name: v.name,
        nik: v.nik,
        birthDate: new Date(v.birthDate),
        gender: v.gender,
        bloodType: v.bloodType,
        phone: v.phone,
        address: v.address,
        city: v.city,
        bpjsNumber: v.bpjsNumber,
        emergencyContact: v.emergencyContact,
      },
    });
  });

  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "CREATE",
    entity: "Patient",
    entityId: patient.id,
    changes: { mrNumber: patient.mrNumber, name: patient.name },
  });

  revalidatePath("/dashboard/pasien");
  redirect(`/dashboard/pasien/${patient.id}`);
}

export async function updatePatient(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireContext(MANAGE_ROLES);
  if ("error" in ctx) return { error: ctx.error };

  const id = String(formData.get("id") ?? "");
  const existing = await db.patient.findFirst({
    where: { id, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!existing) return { error: "Pasien tidak ditemukan." };

  const parsed = patientFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const v = parsed.data;

  await db.patient.update({
    where: { id },
    data: {
      name: v.name,
      nik: v.nik,
      birthDate: new Date(v.birthDate),
      gender: v.gender,
      bloodType: v.bloodType,
      phone: v.phone,
      address: v.address,
      city: v.city,
      bpjsNumber: v.bpjsNumber,
      emergencyContact: v.emergencyContact,
    },
  });

  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "UPDATE",
    entity: "Patient",
    entityId: id,
  });

  revalidatePath(`/dashboard/pasien/${id}`);
  redirect(`/dashboard/pasien/${id}`);
}

export async function softDeletePatient(formData: FormData) {
  const ctx = await requireContext(MANAGE_ROLES);
  if ("error" in ctx) return;

  const id = String(formData.get("id") ?? "");
  const existing = await db.patient.findFirst({
    where: { id, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!existing) return;

  await db.patient.update({ where: { id }, data: { deletedAt: new Date() } });
  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "DELETE",
    entity: "Patient",
    entityId: id,
  });

  revalidatePath("/dashboard/pasien");
  redirect("/dashboard/pasien");
}

export async function addAllergy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await requireContext(CLINICAL_ROLES);
  if ("error" in ctx) return { error: ctx.error };

  const patientId = String(formData.get("patientId") ?? "");
  const patient = await db.patient.findFirst({
    where: { id: patientId, tenantId: ctx.tenantId, deletedAt: null },
  });
  if (!patient) return { error: "Pasien tidak ditemukan." };

  const parsed = allergyFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const v = parsed.data;

  await db.allergy.create({
    data: {
      patientId,
      allergen: v.allergen,
      reaction: v.reaction,
      severity: v.severity,
    },
  });
  await writeAudit({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    action: "CREATE",
    entity: "Allergy",
    entityId: patientId,
  });

  revalidatePath(`/dashboard/pasien/${patientId}`);
  return undefined;
}
