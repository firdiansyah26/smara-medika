import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { SERVICES, startOfToday } from "@/lib/queue";
import { QueuePanel } from "./queue-panel";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const tenant = await getActiveTenant();
  if (!tenant) {
    return <QueuePanel tenantCode="" services={[]} called={[]} />;
  }

  const tenantId = tenant.tenantId;
  const since = startOfToday();

  const [tenantRow, services, called] = await Promise.all([
    db.tenant.findUnique({ where: { id: tenantId }, select: { code: true } }),
    Promise.all(
      SERVICES.map(async (s) => {
        const waiting = await db.queueTicket.findMany({
          where: {
            tenantId,
            serviceType: s.type,
            status: "WAITING",
            createdAt: { gte: since },
          },
          orderBy: { number: "asc" },
          select: { code: true },
        });
        return {
          type: s.type,
          counters: s.counters,
          waitingCount: waiting.length,
          nextCode: waiting[0]?.code ?? null,
        };
      }),
    ),
    db.queueTicket.findMany({
      where: { tenantId, status: "CALLED", calledAt: { gte: since } },
      orderBy: { calledAt: "desc" },
      take: 12,
      select: { id: true, code: true, counter: true },
    }),
  ]);

  return (
    <QueuePanel
      tenantCode={tenantRow?.code ?? ""}
      services={services}
      called={called}
    />
  );
}
