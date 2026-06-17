import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { DashboardHome, type Period } from "./dashboard-home";

export const dynamic = "force-dynamic";

const PERIODS: Period[] = ["today", "week", "month", "all"];

function periodStart(period: Period): Date | undefined {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") return new Date(now.getTime() - 7 * 86400000);
  if (period === "month") return new Date(now.getTime() - 30 * 86400000);
  return undefined; // all
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  const tenant = await getActiveTenant();
  const greetingName = session?.user?.name ?? "—";

  const sp = await searchParams;
  const period: Period = PERIODS.includes(sp.period as Period)
    ? (sp.period as Period)
    : "month";

  if (!tenant) {
    return (
      <DashboardHome
        greetingName={greetingName}
        period={period}
        stats={{ patientsToday: 0, activeVisits: 0, pendingOrders: 0, partners: 0 }}
        recent={[]}
        topDiagnoses={[]}
        visitsInPeriod={0}
      />
    );
  }

  const tenantId = tenant.tenantId;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const from = periodStart(period);
  const periodFilter = from ? { visitDate: { gte: from } } : {};

  const [
    patientsToday,
    activeVisits,
    pendingOrders,
    partners,
    recentEncounters,
    visitsInPeriod,
    diagGroups,
  ] = await Promise.all([
    db.encounter.count({ where: { tenantId, visitDate: { gte: startOfToday } } }),
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
    db.encounter.count({ where: { tenantId, ...periodFilter } }),
    db.diagnosis.groupBy({
      by: ["icdCode", "icdName"],
      where: { encounter: { tenantId, ...periodFilter } },
      _count: { _all: true },
      orderBy: { _count: { icdCode: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <DashboardHome
      greetingName={greetingName}
      period={period}
      stats={{ patientsToday, activeVisits, pendingOrders, partners }}
      recent={recentEncounters.map((e) => ({
        name: e.patient.name,
        mrNumber: e.patient.mrNumber,
        visitDate: e.visitDate.toISOString(),
      }))}
      visitsInPeriod={visitsInPeriod}
      topDiagnoses={diagGroups.map((g) => ({
        code: g.icdCode,
        name: g.icdName,
        count: g._count._all,
      }))}
    />
  );
}
