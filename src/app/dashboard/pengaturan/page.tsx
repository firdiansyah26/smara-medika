import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import { SettingsView, type MemberRow } from "./settings-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  const tenant = await getActiveTenant();
  if (!tenant || !session?.user?.id) {
    return <PagePlaceholder navKey="settings" />;
  }

  const memberships = await db.membership.findMany({
    where: { tenantId: tenant.tenantId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const ownerCount = memberships.filter(
    (m) => m.role === "OWNER" && m.isActive,
  ).length;

  const members: MemberRow[] = memberships.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    active: m.isActive,
  }));

  const canManage = tenant.role === "OWNER" || tenant.role === "ADMIN";

  return (
    <SettingsView
      tenantName={tenant.tenantName}
      members={members}
      canManage={canManage}
      currentUserId={session.user.id}
      ownerCount={ownerCount}
    />
  );
}
