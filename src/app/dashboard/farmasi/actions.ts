"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { drugFormSchema, stockFormSchema } from "@/lib/schemas/drug";

type ActionState = { error?: string } | undefined;

const PHARMACY_ROLES: Role[] = ["OWNER", "ADMIN", "APOTEKER"];

async function ctx() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const tenant = await getActiveTenant();
  if (!tenant) return { error: "Tidak ada fasilitas aktif." as const };
  if (!PHARMACY_ROLES.includes(tenant.role)) {
    return { error: "Anda tidak punya izin untuk aksi ini." as const };
  }
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

export async function addDrug(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = await ctx();
  if ("error" in c) return { error: c.error };

  const parsed = drugFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const v = parsed.data;

  await db.$transaction(async (tx) => {
    // Pakai obat katalog yang sudah ada (by nama) atau buat baru.
    const drug =
      (await tx.drug.findFirst({ where: { name: v.name } })) ??
      (await tx.drug.create({
        data: {
          name: v.name,
          genericName: v.genericName,
          unit: v.unit,
          category: v.category,
        },
      }));

    await tx.drugStock.upsert({
      where: { tenantId_drugId: { tenantId: c.tenantId, drugId: drug.id } },
      update: { quantity: v.quantity, price: v.price },
      create: {
        tenantId: c.tenantId,
        drugId: drug.id,
        quantity: v.quantity,
        price: v.price,
      },
    });

    await writeAudit({
      tenantId: c.tenantId,
      userId: c.userId,
      action: "CREATE",
      entity: "DrugStock",
      entityId: drug.id,
      changes: { name: v.name, quantity: v.quantity },
    });
  });

  revalidatePath("/dashboard/farmasi");
  return undefined;
}

export async function updateStock(formData: FormData) {
  const c = await ctx();
  if ("error" in c) return;

  const parsed = stockFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const v = parsed.data;

  const stock = await db.drugStock.findUnique({
    where: { tenantId_drugId: { tenantId: c.tenantId, drugId: v.drugId } },
  });
  if (!stock) return;

  await db.drugStock.update({
    where: { tenantId_drugId: { tenantId: c.tenantId, drugId: v.drugId } },
    data: { quantity: v.quantity, price: v.price },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "DrugStock",
    entityId: v.drugId,
  });

  revalidatePath("/dashboard/farmasi");
  return undefined;
}
