import type { Prisma } from "@prisma/client";

/** Generate nomor order transfer `TRF-YYYYMM-XXXXX` (unik global). */
export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
  now: Date = new Date(),
): Promise<string> {
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `TRF-${ym}-`;
  const last = await tx.drugOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const lastSeq = last ? parseInt(last.orderNumber.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
}
