import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const active = await getActiveTenant();

  return (
    <AppShell
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }}
      tenants={session.user.memberships ?? []}
      activeTenantId={active?.tenantId ?? ""}
    >
      {children}
    </AppShell>
  );
}
