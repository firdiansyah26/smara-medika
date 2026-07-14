"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role, LabCategory, LabFlag, LabOrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { generateLabOrderNumber } from "@/lib/lab-number";
import { notifyEmail } from "@/lib/notify";
import { labResultReadyEmail } from "@/lib/email";
import { dispatchWebhook } from "@/lib/webhooks";

const LAB_ROLES: Role[] = ["OWNER", "ADMIN", "DOKTER", "PERAWAT"];
const FLAGS: LabFlag[] = ["NORMAL", "LOW", "HIGH", "ABNORMAL"];

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !LAB_ROLES.includes(tenant.role)) return null;
  return {
    userId: session.user.id,
    tenantId: tenant.tenantId,
    tenantName: tenant.tenantName,
  };
}

export async function createLabOrder(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const patientId = String(formData.get("patientId") ?? "");
  const category = (String(formData.get("category") ?? "LABORATORIUM") ===
  "RADIOLOGI"
    ? "RADIOLOGI"
    : "LABORATORIUM") as LabCategory;
  const clinicalNote = String(formData.get("clinicalNote") ?? "").trim() || null;
  if (!patientId) return;

  const patient = await db.patient.findFirst({
    where: { id: patientId, tenantId: c.tenantId, deletedAt: null },
    select: { id: true },
  });
  if (!patient) return;

  const order = await db.$transaction(async (tx) => {
    const orderNumber = await generateLabOrderNumber(tx, c.tenantId, category);
    return tx.labOrder.create({
      data: {
        tenantId: c.tenantId,
        patientId,
        category,
        clinicalNote,
        orderNumber,
        orderedById: c.userId,
      },
    });
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "LabOrder",
    entityId: order.id,
    changes: { orderNumber: order.orderNumber, category },
  });

  redirect(`/dashboard/penunjang/${order.id}`);
}

async function loadOrder(orderId: string, tenantId: string) {
  if (!orderId) return null;
  return db.labOrder.findFirst({
    where: { id: orderId, tenantId },
    select: { id: true, status: true },
  });
}

export async function addLabItem(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const labOrderId = String(formData.get("labOrderId") ?? "");
  const order = await loadOrder(labOrderId, c.tenantId);
  if (!order || order.status === "COMPLETED" || order.status === "CANCELLED")
    return;

  const testName = String(formData.get("testName") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim() || null;
  const referenceRange =
    String(formData.get("referenceRange") ?? "").trim() || null;
  if (!testName) return;

  await db.labOrderItem.create({
    data: { labOrderId, testName, unit, referenceRange },
  });
  revalidatePath(`/dashboard/penunjang/${labOrderId}`);
}

export async function removeLabItem(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const itemId = String(formData.get("itemId") ?? "");
  const item = await db.labOrderItem.findUnique({
    where: { id: itemId },
    include: {
      labOrder: { select: { id: true, tenantId: true, status: true } },
    },
  });
  if (
    !item ||
    item.labOrder.tenantId !== c.tenantId ||
    item.labOrder.status === "COMPLETED" ||
    item.labOrder.status === "CANCELLED"
  )
    return;

  await db.labOrderItem.delete({ where: { id: itemId } });
  revalidatePath(`/dashboard/penunjang/${item.labOrder.id}`);
}

export async function saveLabResult(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const itemId = String(formData.get("itemId") ?? "");
  const item = await db.labOrderItem.findUnique({
    where: { id: itemId },
    include: {
      labOrder: { select: { id: true, tenantId: true, status: true } },
    },
  });
  if (
    !item ||
    item.labOrder.tenantId !== c.tenantId ||
    item.labOrder.status === "CANCELLED"
  )
    return;

  const result = String(formData.get("result") ?? "").trim() || null;
  const flagRaw = String(formData.get("flag") ?? "");
  const flag = FLAGS.includes(flagRaw as LabFlag) ? (flagRaw as LabFlag) : null;

  await db.labOrderItem.update({
    where: { id: itemId },
    data: { result, flag },
  });
  // Order pindah ke IN_PROGRESS begitu hasil mulai diisi.
  if (item.labOrder.status === "REQUESTED" && result) {
    await db.labOrder.update({
      where: { id: item.labOrder.id },
      data: { status: "IN_PROGRESS" },
    });
  }
  revalidatePath(`/dashboard/penunjang/${item.labOrder.id}`);
}

export async function updateLabStatus(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const labOrderId = String(formData.get("labOrderId") ?? "");
  const status = String(formData.get("status") ?? "") as LabOrderStatus;
  if (!["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) return;

  const order = await db.labOrder.findFirst({
    where: { id: labOrderId, tenantId: c.tenantId },
    select: { id: true, status: true },
  });
  if (!order || order.status === "COMPLETED" || order.status === "CANCELLED")
    return;

  // Untuk menyelesaikan order, minimal harus ada satu item.
  if (status === "COMPLETED") {
    const itemCount = await db.labOrderItem.count({ where: { labOrderId } });
    if (itemCount === 0) return;
  }

  await db.labOrder.update({
    where: { id: order.id },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "LabOrder",
    entityId: order.id,
    changes: { from: order.status, to: status },
  });

  // Notifikasi: hasil siap → email ke pasien (bila ada email).
  if (status === "COMPLETED") {
    const full = await db.labOrder.findUnique({
      where: { id: order.id },
      select: {
        orderNumber: true,
        category: true,
        patient: { select: { name: true, email: true } },
      },
    });
    if (full) {
      const categoryLabel =
        full.category === "RADIOLOGI" ? "Radiologi" : "Laboratorium";
      const tmpl = labResultReadyEmail({
        facilityName: c.tenantName,
        patientName: full.patient.name,
        orderNumber: full.orderNumber,
        categoryLabel,
      });
      await notifyEmail({
        tenantId: c.tenantId,
        type: "LAB_RESULT_READY",
        to: full.patient.email,
        subject: tmpl.subject,
        html: tmpl.html,
        text: tmpl.text,
        relatedType: "LabOrder",
        relatedId: order.id,
        createdById: c.userId,
      });
      try {
        await dispatchWebhook(c.tenantId, "lab_result.ready", {
          labOrderId: order.id,
          orderNumber: full.orderNumber,
          category: full.category,
        });
      } catch {}
    }
  }

  revalidatePath(`/dashboard/penunjang/${order.id}`);
  revalidatePath("/dashboard/penunjang");
}
