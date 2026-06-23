import type { Prisma } from "@prisma/client";

/** Generate nomor invoice `INV-YYYYMM-XXXXX` (unik per tenant). */
export async function generateInvoiceNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  now: Date = new Date(),
): Promise<string> {
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `INV-${ym}-`;
  const last = await tx.invoice.findFirst({
    where: { tenantId, invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const lastSeq = last
    ? parseInt(last.invoiceNumber.slice(prefix.length), 10)
    : 0;
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
}
