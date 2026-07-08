import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  BillingTable,
  type InvoiceRow,
  type PatientOption,
} from "./billing-table";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

const MANAGE_ROLES = ["OWNER", "ADMIN", "RESEPSIONIS"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await auth();
  const tenant = await getActiveTenant();
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);

  let invoices: InvoiceRow[] = [];
  let patients: PatientOption[] = [];
  let canManage = false;
  let total = 0;

  if (tenant) {
    canManage = MANAGE_ROLES.includes(tenant.role);
    const [count, inv, pts] = await Promise.all([
      db.invoice.count({ where: { tenantId: tenant.tenantId } }),
      db.invoice.findMany({
        where: { tenantId: tenant.tenantId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { patient: { select: { name: true, mrNumber: true } } },
      }),
      db.patient.findMany({
        where: { tenantId: tenant.tenantId, deletedAt: null },
        orderBy: { name: "asc" },
        take: 200,
        select: { id: true, name: true, mrNumber: true },
      }),
    ]);
    total = count;
    invoices = inv.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      patient: i.patient.name,
      mrNumber: i.patient.mrNumber,
      total: i.total,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
    }));
    patients = pts.map((p) => ({
      id: p.id,
      name: p.name,
      mrNumber: p.mrNumber,
    }));
  }

  return (
    <BillingTable
      invoices={invoices}
      patients={patients}
      canManage={canManage}
      page={page}
      pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
    />
  );
}
