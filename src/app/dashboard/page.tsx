import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { DashboardHome } from "./dashboard-home";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tenant = await getActiveTenant();

  if (!tenant) {
    return (
      <DashboardHome
        greetingName="—"
        stats={{ patientsToday: 0, activeVisits: 0, pendingOrders: 0, partners: 0 }}
        recent={[]}
      />
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    owner,
    patientsToday,
    activeVisits,
    pendingOrders,
    partners,
    recentEncounters,
  ] = await Promise.all([
    db.membership.findFirst({
      where: { tenantId: tenant.id, role: "OWNER" },
      include: { user: { select: { name: true } } },
    }),
    db.encounter.count({
      where: { tenantId: tenant.id, visitDate: { gte: startOfToday } },
    }),
    db.encounter.count({
      where: { tenantId: tenant.id, status: { in: ["MENUNGGU", "DIPERIKSA"] } },
    }),
    db.drugOrder.count({
      where: {
        requesterTenantId: tenant.id,
        status: { notIn: ["RECEIVED", "REJECTED", "CANCELLED"] },
      },
    }),
    db.tenantPartnership.count({
      where: {
        status: "ACTIVE",
        OR: [
          { requesterTenantId: tenant.id },
          { addresseeTenantId: tenant.id },
        ],
      },
    }),
    db.encounter.findMany({
      where: { tenantId: tenant.id },
      orderBy: { visitDate: "desc" },
      take: 5,
      include: { patient: { select: { name: true, mrNumber: true } } },
    }),
  ]);

  return (
    <DashboardHome
      greetingName={owner?.user.name ?? "—"}
      stats={{ patientsToday, activeVisits, pendingOrders, partners }}
      recent={recentEncounters.map((e) => ({
        name: e.patient.name,
        mrNumber: e.patient.mrNumber,
        visitDate: e.visitDate.toISOString(),
      }))}
    />
  );
}
