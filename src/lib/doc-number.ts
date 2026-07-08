import type { Prisma } from "@prisma/client";

/** Nomor dokumen klinis `DOC-YYYYMM-XXXXX` per tenant. */
export async function generateDocNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  now: Date = new Date(),
): Promise<string> {
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `DOC-${ym}-`;
  const last = await tx.medicalDocument.findFirst({
    where: { tenantId, number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? parseInt(last.number.slice(prefix.length), 10) : 0;
  return `${prefix}${String(seq + 1).padStart(5, "0")}`;
}
