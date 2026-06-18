import type { Prisma, ServiceType } from "@prisma/client";

export type ServiceDef = {
  type: ServiceType;
  prefix: string;
  counters: string[];
};

// Konfigurasi layanan & counter. BPJS → A (A1/A2/A3), Asuransi → PA, Umum → U.
export const SERVICES: ServiceDef[] = [
  { type: "BPJS", prefix: "A", counters: ["A1", "A2", "A3"] },
  { type: "ASURANSI", prefix: "PA", counters: ["PA1", "PA2"] },
  { type: "UMUM", prefix: "U", counters: ["U1", "U2"] },
];

export const ALL_COUNTERS = SERVICES.flatMap((s) => s.counters);

export function serviceByType(type: ServiceType): ServiceDef {
  return SERVICES.find((s) => s.type === type) ?? SERVICES[0];
}

/** Counter (mis. "A1") milik layanan apa. */
export function serviceByCounter(counter: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.counters.includes(counter));
}

export function formatTicketCode(type: ServiceType, num: number): string {
  return `${serviceByType(type).prefix}${String(num).padStart(4, "0")}`;
}

export function startOfToday(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Nomor antrian berikutnya per tenant + layanan + hari (reset harian). */
export async function nextTicketNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  type: ServiceType,
): Promise<number> {
  const last = await tx.queueTicket.findFirst({
    where: { tenantId, serviceType: type, createdAt: { gte: startOfToday() } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 0) + 1;
}
