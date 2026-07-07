import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import { NotificationsView, type NotifRow } from "./notifications-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();
  if (!tenant) return <PagePlaceholder navKey="notifications" />;

  const logs = await db.notification.findMany({
    where: { tenantId: tenant.tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const rows: NotifRow[] = logs.map((n) => ({
    id: n.id,
    type: n.type,
    recipient: n.recipient,
    subject: n.subject,
    status: n.status,
    createdAt: n.createdAt.toISOString(),
  }));

  return <NotificationsView rows={rows} />;
}
