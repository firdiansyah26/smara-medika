import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  BillingTable,
  type InvoiceRow,
  type PatientOption,
} from "./billing-table";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "RESEPSIONIS"];

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();

  let invoices: InvoiceRow[] = [];
  let patients: PatientOption[] = [];
  let canManage = false;

  if (tenant) {
    canManage = MANAGE_ROLES.includes(tenant.role);
    const [inv, pts] = await Promise.all([
      db.invoice.findMany({
        where: { tenantId: tenant.tenantId },
        orderBy: { createdAt: "desc" },
        include: { patient: { select: { name: true, mrNumber: true } } },
      }),
      db.patient.findMany({
        where: { tenantId: tenant.tenantId, deletedAt: null },
        orderBy: { name: "asc" },
        take: 200,
        select: { id: true, name: true, mrNumber: true },
      }),
    ]);
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
    />
  );
}
