import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import { ProfilView } from "./profil-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) return <PagePlaceholder navKey="profile" />;

  const [user, tenant] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        memberships: {
          where: { isActive: true },
          select: { role: true, tenant: { select: { name: true } } },
        },
      },
    }),
    getActiveTenant(),
  ]);
  if (!user) return <PagePlaceholder navKey="profile" />;

  return (
    <ProfilView
      name={user.name}
      email={user.email}
      activeTenant={tenant?.tenantName ?? "—"}
      memberships={user.memberships.map((m) => ({
        tenant: m.tenant.name,
        role: m.role,
      }))}
    />
  );
}
