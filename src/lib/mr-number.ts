import type { Prisma } from "@prisma/client";

/**
 * Generate No. Rekam Medis `RM-YYYYMM-XXXXX`, unik per tenant.
 * Dipanggil di dalam $transaction untuk mengurangi race condition.
 */
export async function generateMrNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  now: Date = new Date(),
): Promise<string> {
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `RM-${ym}-`;

  const last = await tx.patient.findFirst({
    where: { tenantId, mrNumber: { startsWith: prefix } },
    orderBy: { mrNumber: "desc" },
    select: { mrNumber: true },
  });

  const lastSeq = last ? parseInt(last.mrNumber.slice(prefix.length), 10) : 0;
  const next = String(lastSeq + 1).padStart(5, "0");
  return `${prefix}${next}`;
}
