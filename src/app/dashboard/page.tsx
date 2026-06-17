import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { DashboardHome } from "./dashboard-home";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const tenant = await getActiveTenant();
  const greetingName = session?.user?.name ?? "—";

  if (!tenant) {
    return (
      <DashboardHome
        greetingName={greetingName}
        stats={{ patientsToday: 0, activeVisits: 0, pendingOrders: 0, partners: 0 }}
        recent={[]}
      />
    );
  }

  const tenantId = tenant.tenantId;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [patientsToday, activeVisits, pendingOrders, partners, recentEncounters] =
    await Promise.all([
      db.encounter.count({
        where: { tenantId, visitDate: { gte: startOfToday } },
      }),
      db.encounter.count({
        where: { tenantId, status: { in: ["MENUNGGU", "DIPERIKSA"] } },
      }),
      db.drugOrder.count({
        where: {
          requesterTenantId: tenantId,
          status: { notIn: ["RECEIVED", "REJECTED", "CANCELLED"] },
        },
      }),
      db.tenantPartnership.count({
        where: {
          status: "ACTIVE",
          OR: [{ requesterTenantId: tenantId }, { addresseeTenantId: tenantId }],
        },
      }),
      db.encounter.findMany({
        where: { tenantId },
        orderBy: { visitDate: "desc" },
        take: 5,
        include: { patient: { select: { name: true, mrNumber: true } } },
      }),
    ]);

  return (
    <DashboardHome
      greetingName={greetingName}
      stats={{ patientsToday, activeVisits, pendingOrders, partners }}
      recent={recentEncounters.map((e) => ({
        name: e.patient.name,
        mrNumber: e.patient.mrNumber,
        visitDate: e.visitDate.toISOString(),
      }))}
    />
  );
}
