"use server";

import type { ServiceType } from "@prisma/client";
import { db } from "@/lib/db";
import { formatTicketCode, nextTicketNumber } from "@/lib/queue";

export type TakeTicketResult =
  | { ok: true; code: string; serviceType: ServiceType; createdAt: string }
  | { ok: false; error: string };

/** Kiosk publik: ambil nomor antrian untuk tenant (by code). */
export async function takeTicket(
  tenantCode: string,
  serviceType: ServiceType,
): Promise<TakeTicketResult> {
  const tenant = await db.tenant.findUnique({
    where: { code: tenantCode },
    select: { id: true },
  });
  if (!tenant) return { ok: false, error: "Fasilitas tidak ditemukan." };

  const ticket = await db.$transaction(async (tx) => {
    const number = await nextTicketNumber(tx, tenant.id, serviceType);
    return tx.queueTicket.create({
      data: {
        tenantId: tenant.id,
        serviceType,
        number,
        code: formatTicketCode(serviceType, number),
      },
    });
  });

  return {
    ok: true,
    code: ticket.code,
    serviceType,
    createdAt: ticket.createdAt.toISOString(),
  };
}
