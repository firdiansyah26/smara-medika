import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import type { AuditAction } from "@prisma/client";
import { AuditView, type AuditRow } from "./audit-view";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

const ACTIONS: AuditAction[] = ["CREATE", "READ", "UPDATE", "DELETE", "LOGIN"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; page?: string }>;
}) {
  await auth();
  const tenant = await getActiveTenant();
  if (!tenant || !(tenant.role === "OWNER" || tenant.role === "ADMIN")) {
    return <PagePlaceholder navKey="audit" />;
  }

  const sp = await searchParams;
  const action = ACTIONS.includes(sp.action as AuditAction)
    ? (sp.action as AuditAction)
    : undefined;
  const entity = sp.entity && sp.entity !== "all" ? sp.entity : undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const where = {
    tenantId: tenant.tenantId,
    ...(action ? { action } : {}),
    ...(entity ? { entity } : {}),
  };

  const [total, logs, entityGroups] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true } } },
    }),
    db.auditLog.groupBy({
      by: ["entity"],
      where: { tenantId: tenant.tenantId },
      orderBy: { entity: "asc" },
    }),
  ]);

  const rows: AuditRow[] = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    user: l.user.name,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AuditView
      rows={rows}
      entities={entityGroups.map((e) => e.entity)}
      action={action ?? "all"}
      entity={entity ?? "all"}
      page={page}
      pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
    />
  );
}
