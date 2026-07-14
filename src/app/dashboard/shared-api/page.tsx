import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import {
  SharedApiView,
  type KeyRow,
  type RequestRow,
  type EndpointRow,
  type DeliveryRow,
} from "./shared-api-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();
  if (!tenant) return <PagePlaceholder navKey="sharedApi" />;

  const canManage = tenant.role === "OWNER" || tenant.role === "ADMIN";

  const [keys, logs, totalRequests, endpoints, deliveries] = await Promise.all([
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
    db.webhookEndpoint.findMany({
      where: { tenantId: tenant.tenantId },
      orderBy: { createdAt: "desc" },
    }),
    db.webhookDelivery.findMany({
      where: { endpoint: { tenantId: tenant.tenantId } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
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
  const endpointRows: EndpointRow[] = endpoints.map((e) => ({
    id: e.id,
    url: e.url,
    events: e.events,
    isActive: e.isActive,
    createdAt: e.createdAt.toISOString(),
  }));
  const deliveryRows: DeliveryRow[] = deliveries.map((d) => ({
    id: d.id,
    event: d.event,
    status: d.status,
    attempts: d.attempts,
    responseCode: d.responseCode,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <SharedApiView
      canManage={canManage}
      keys={keyRows}
      requests={requestRows}
      totalRequests={totalRequests}
      endpoints={endpointRows}
      deliveries={deliveryRows}
    />
  );
}
