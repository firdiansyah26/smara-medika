import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import {
  SharedApiView,
  type KeyRow,
  type RequestRow,
} from "./shared-api-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();
  if (!tenant) return <PagePlaceholder navKey="sharedApi" />;

  const canManage = tenant.role === "OWNER" || tenant.role === "ADMIN";

  const [keys, logs, totalRequests] = await Promise.all([
    db.apiKey.findMany({
      where: { tenantId: tenant.tenantId },
      orderBy: { createdAt: "desc" },
    }),
    db.apiRequestLog.findMany({
      where: { tenantId: tenant.tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.apiRequestLog.count({ where: { tenantId: tenant.tenantId } }),
  ]);

  const keyRows: KeyRow[] = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    mode: k.mode,
    scopes: k.scopes,
    status: k.status,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
  }));
  const requestRows: RequestRow[] = logs.map((l) => ({
    id: l.id,
    method: l.method,
    path: l.path,
    statusCode: l.statusCode,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <SharedApiView
      canManage={canManage}
      keys={keyRows}
      requests={requestRows}
      totalRequests={totalRequests}
    />
  );
}
