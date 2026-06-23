import type { Prisma, LabCategory } from "@prisma/client";

/** Generate nomor order penunjang `LAB-YYYYMM-XXXXX` / `RAD-YYYYMM-XXXXX` per tenant. */
export async function generateLabOrderNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  category: LabCategory,
  now: Date = new Date(),
): Promise<string> {
  const tag = category === "RADIOLOGI" ? "RAD" : "LAB";
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `${tag}-${ym}-`;
  const last = await tx.labOrder.findFirst({
    where: { tenantId, orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const lastSeq = last
    ? parseInt(last.orderNumber.slice(prefix.length), 10)
    : 0;
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
}
