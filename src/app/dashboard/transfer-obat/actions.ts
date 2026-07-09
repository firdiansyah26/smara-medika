"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { generateOrderNumber } from "@/lib/order-number";
import {
  nextStatus,
  canReceive,
  canReject,
  canCancel,
  decrementsStockOnTransition,
} from "@/lib/order-flow";

const ORDER_ROLES: Role[] = ["OWNER", "ADMIN", "APOTEKER", "DOKTER"];

async function ctx() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const tenant = await getActiveTenant();
  if (!tenant || !ORDER_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

/** Pemohon membuat order ke rekanan (single item). */
export async function createOrder(formData: FormData) {
  const c = await ctx();
  if (!c) return;

  const supplierTenantId = String(formData.get("supplierTenantId") ?? "");
  const drugId = String(formData.get("drugId") ?? "");
  const quantity = parseInt(String(formData.get("quantity") ?? "0"), 10);
  const note = String(formData.get("note") ?? "").trim() || undefined;
  if (!supplierTenantId || !drugId || !Number.isFinite(quantity) || quantity <= 0) {
    return;
  }

  // Validasi rekanan aktif.
  const partnership = await db.tenantPartnership.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { requesterTenantId: c.tenantId, addresseeTenantId: supplierTenantId },
        { requesterTenantId: supplierTenantId, addresseeTenantId: c.tenantId },
      ],
    },
  });
  if (!partnership) return;

  const order = await db.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx);
    return tx.drugOrder.create({
      data: {
        orderNumber,
        requesterTenantId: c.tenantId,
        supplierTenantId,
        status: "REQUESTED",
        requestedById: c.userId,
        note,
        items: { create: [{ drugId, quantity }] },
        trackings: { create: [{ status: "REQUESTED", changedById: c.userId }] },
      },
    });
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "DrugOrder",
    entityId: order.id,
  });

  revalidatePath("/dashboard/transfer-obat");
  redirect(`/dashboard/transfer-obat/${order.id}`);
}

/** Penyedia memproses ke status berikutnya (sampai DELIVERED). Stok dikurangi saat SHIPPED. */
export async function advanceOrder(orderId: string) {
  const c = await ctx();
  if (!c) return;
  const order = await db.drugOrder.findFirst({
    where: { id: orderId, supplierTenantId: c.tenantId },
    include: { items: true },
  });
  if (!order) return;
  const next = nextStatus(order.status);
  if (!next) return;

  await db.$transaction(async (tx) => {
    if (decrementsStockOnTransition(next)) {
      // Kurangi stok penyedia.
      for (const it of order.items) {
        await tx.drugStock.updateMany({
          where: { tenantId: c.tenantId, drugId: it.drugId },
          data: { quantity: { decrement: it.quantity } },
        });
      }
    }
    await tx.drugOrder.update({ where: { id: orderId }, data: { status: next } });
    await tx.drugOrderTracking.create({
      data: { orderId, status: next, changedById: c.userId },
    });
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "DrugOrder",
    entityId: orderId,
    changes: { status: next },
  });
  revalidatePath(`/dashboard/transfer-obat/${orderId}`);
}

/** Pemohon menerima obat → stok bertambah. */
export async function receiveOrder(orderId: string) {
  const c = await ctx();
  if (!c) return;
  const order = await db.drugOrder.findFirst({
    where: { id: orderId, requesterTenantId: c.tenantId },
    include: { items: true },
  });
  if (!order || !canReceive(order.status)) return;

  await db.$transaction(async (tx) => {
    for (const it of order.items) {
      await tx.drugStock.upsert({
        where: { tenantId_drugId: { tenantId: c.tenantId, drugId: it.drugId } },
        update: { quantity: { increment: it.quantity } },
        create: { tenantId: c.tenantId, drugId: it.drugId, quantity: it.quantity },
      });
    }
    await tx.drugOrder.update({ where: { id: orderId }, data: { status: "RECEIVED" } });
    await tx.drugOrderTracking.create({
      data: { orderId, status: "RECEIVED", changedById: c.userId },
    });
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "DrugOrder",
    entityId: orderId,
    changes: { status: "RECEIVED" },
  });
  revalidatePath(`/dashboard/transfer-obat/${orderId}`);
}

/** Penyedia menolak order (saat REQUESTED). */
export async function rejectOrder(orderId: string) {
  const c = await ctx();
  if (!c) return;
  const order = await db.drugOrder.findFirst({
    where: { id: orderId, supplierTenantId: c.tenantId },
  });
  if (!order || !canReject(order.status)) return;
  await db.drugOrder.update({ where: { id: orderId }, data: { status: "REJECTED" } });
  await db.drugOrderTracking.create({
    data: { orderId, status: "REJECTED", changedById: c.userId },
  });
  revalidatePath(`/dashboard/transfer-obat/${orderId}`);
}

/** Pemohon membatalkan order (sebelum dikirim). */
export async function cancelOrder(orderId: string) {
  const c = await ctx();
  if (!c) return;
  const order = await db.drugOrder.findFirst({
    where: { id: orderId, requesterTenantId: c.tenantId },
  });
  if (!order || !canCancel(order.status)) return;
  await db.drugOrder.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  await db.drugOrderTracking.create({
    data: { orderId, status: "CANCELLED", changedById: c.userId },
  });
  revalidatePath(`/dashboard/transfer-obat/${orderId}`);
}
