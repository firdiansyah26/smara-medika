import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  PenunjangTable,
  type LabOrderRow,
  type PatientOption,
} from "./penunjang-table";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "DOKTER", "PERAWAT"];

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();

  let orders: LabOrderRow[] = [];
  let patients: PatientOption[] = [];
  let canManage = false;

  if (tenant) {
    canManage = MANAGE_ROLES.includes(tenant.role);
    const [ord, pts] = await Promise.all([
      db.labOrder.findMany({
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
    orders = ord.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      patient: o.patient.name,
      mrNumber: o.patient.mrNumber,
      category: o.category,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));
    patients = pts.map((p) => ({
      id: p.id,
      name: p.name,
      mrNumber: p.mrNumber,
    }));
  }

  return (
    <PenunjangTable orders={orders} patients={patients} canManage={canManage} />
  );
}
