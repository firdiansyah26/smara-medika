"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role, BillingCategory, InvoiceStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { generateInvoiceNumber } from "@/lib/invoice-number";

const BILLING_ROLES: Role[] = ["OWNER", "ADMIN", "RESEPSIONIS"];
const CATEGORIES: BillingCategory[] = [
  "CONSULTATION",
  "DRUG",
  "PROCEDURE",
  "LAB",
  "OTHER",
];

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !BILLING_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

/** Hitung ulang total = Σ item − diskon (≥ 0). */
async function recompute(invoiceId: string) {
  const inv = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: { select: { amount: true } } },
  });
  if (!inv) return;
  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
  const total = Math.max(0, subtotal - inv.discount);
  await db.invoice.update({ where: { id: invoiceId }, data: { total } });
}

export async function createInvoice(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const patientId = String(formData.get("patientId") ?? "");
  const encounterId = String(formData.get("encounterId") ?? "") || null;
  if (!patientId) return;

  const patient = await db.patient.findFirst({
    where: { id: patientId, tenantId: c.tenantId, deletedAt: null },
    select: { id: true },
  });
  if (!patient) return;

  const invoice = await db.$transaction(async (tx) => {
    const invoiceNumber = await generateInvoiceNumber(tx, c.tenantId);
    return tx.invoice.create({
      data: {
        tenantId: c.tenantId,
        patientId,
        encounterId,
        invoiceNumber,
        status: "DRAFT",
        createdById: c.userId,
      },
    });
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "Invoice",
    entityId: invoice.id,
    changes: { invoiceNumber: invoice.invoiceNumber, patientId },
  });

  redirect(`/dashboard/billing/${invoice.id}`);
}

async function loadDraft(invoiceId: string, tenantId: string) {
  if (!invoiceId) return null;
  const inv = await db.invoice.findFirst({
    where: { id: invoiceId, tenantId },
    select: { id: true, status: true },
  });
  if (!inv || inv.status !== "DRAFT") return null;
  return inv;
}

export async function addInvoiceItem(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!(await loadDraft(invoiceId, c.tenantId))) return;

  const category = String(formData.get("category") ?? "OTHER") as BillingCategory;
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Math.max(1, parseInt(String(formData.get("quantity") ?? "1"), 10) || 1);
  const unitPrice = Math.max(0, parseInt(String(formData.get("unitPrice") ?? "0"), 10) || 0);
  if (!description) return;

  await db.invoiceItem.create({
    data: {
      invoiceId,
      category: CATEGORIES.includes(category) ? category : "OTHER",
      description,
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    },
  });
  await recompute(invoiceId);
  revalidatePath(`/dashboard/billing/${invoiceId}`);
}

export async function removeInvoiceItem(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const itemId = String(formData.get("itemId") ?? "");
  const item = await db.invoiceItem.findUnique({
    where: { id: itemId },
    include: { invoice: { select: { id: true, tenantId: true, status: true } } },
  });
  if (!item || item.invoice.tenantId !== c.tenantId || item.invoice.status !== "DRAFT")
    return;

  await db.invoiceItem.delete({ where: { id: itemId } });
  await recompute(item.invoice.id);
  revalidatePath(`/dashboard/billing/${item.invoice.id}`);
}

export async function setDiscount(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!(await loadDraft(invoiceId, c.tenantId))) return;

  const discount = Math.max(0, parseInt(String(formData.get("discount") ?? "0"), 10) || 0);
  await db.invoice.update({ where: { id: invoiceId }, data: { discount } });
  await recompute(invoiceId);
  revalidatePath(`/dashboard/billing/${invoiceId}`);
}

export async function updateInvoiceStatus(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const invoiceId = String(formData.get("invoiceId") ?? "");
  const status = String(formData.get("status") ?? "") as InvoiceStatus;
  if (!["UNPAID", "PAID", "CANCELLED"].includes(status)) return;

  const inv = await db.invoice.findFirst({
    where: { id: invoiceId, tenantId: c.tenantId },
    select: { id: true, status: true },
  });
  if (!inv || inv.status === "CANCELLED") return;
  // Wajib ada item sebelum diterbitkan
  if (status !== "CANCELLED") {
    const itemCount = await db.invoiceItem.count({ where: { invoiceId } });
    if (itemCount === 0) return;
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "Invoice",
    entityId: invoiceId,
    changes: { from: inv.status, to: status },
  });
  revalidatePath(`/dashboard/billing/${invoiceId}`);
  revalidatePath("/dashboard/billing");
}
