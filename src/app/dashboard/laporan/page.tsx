import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  LaporanView,
  type ReportType,
  type VisitRow,
  type TransferRow,
} from "./laporan-view";
import type { Period } from "../dashboard-home";

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
  return undefined;
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; period?: string }>;
}) {
  await auth();
  const tenant = await getActiveTenant();
  const sp = await searchParams;
  const type: ReportType = sp.type === "transfer" ? "transfer" : "visits";
  const period: Period = PERIODS.includes(sp.period as Period)
    ? (sp.period as Period)
    : "month";

  let visits: VisitRow[] = [];
  let transfers: TransferRow[] = [];

  if (tenant) {
    const tenantId = tenant.tenantId;
    const from = periodStart(period);
    if (type === "visits") {
      const rows = await db.encounter.findMany({
        where: { tenantId, ...(from ? { visitDate: { gte: from } } : {}) },
        orderBy: { visitDate: "desc" },
        include: {
          patient: { select: { name: true, mrNumber: true } },
          doctor: { select: { name: true } },
          _count: { select: { diagnoses: true } },
        },
      });
      visits = rows.map((e) => ({
        date: e.visitDate.toISOString(),
        patient: e.patient.name,
        mrNumber: e.patient.mrNumber,
        doctor: e.doctor.name,
        status: e.status,
        diagnoses: e._count.diagnoses,
      }));
    } else {
      const rows = await db.drugOrder.findMany({
        where: {
          OR: [{ requesterTenantId: tenantId }, { supplierTenantId: tenantId }],
          ...(from ? { createdAt: { gte: from } } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          requesterTenant: { select: { name: true } },
          supplierTenant: { select: { name: true } },
          items: { select: { quantity: true } },
        },
      });
      transfers = rows.map((o) => {
        const out = o.requesterTenantId === tenantId;
        return {
          date: o.createdAt.toISOString(),
          orderNo: o.orderNumber,
          direction: out ? "out" : "in",
          partner: out ? o.supplierTenant.name : o.requesterTenant.name,
          status: o.status,
          qty: o.items.reduce((s, i) => s + i.quantity, 0),
        };
      });
    }
  }

  return (
    <LaporanView
      type={type}
      period={period}
      visits={visits}
      transfers={transfers}
    />
  );
}
