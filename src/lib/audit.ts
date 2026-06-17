import type { AuditAction, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Catat aktivitas ke audit log. Aman dipanggil setelah operasi data sensitif. */
export async function writeAudit(params: {
  tenantId?: string | null;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  changes?: Prisma.InputJsonValue;
}) {
  await db.auditLog.create({
    data: {
      tenantId: params.tenantId ?? null,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      changes: params.changes,
    },
  });
}
