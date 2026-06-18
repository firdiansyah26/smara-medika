import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { OrderDetail } from "./order-detail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const order = await db.drugOrder.findFirst({
    where: {
      id,
      OR: [
        { requesterTenantId: tenant.tenantId },
        { supplierTenantId: tenant.tenantId },
      ],
    },
    include: {
      requesterTenant: { select: { name: true } },
      supplierTenant: { select: { name: true } },
      items: { include: { drug: { select: { name: true, unit: true } } } },
      trackings: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  return (
    <OrderDetail
      data={{
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        isSupplier: order.supplierTenantId === tenant.tenantId,
        requesterName: order.requesterTenant.name,
        supplierName: order.supplierTenant.name,
        note: order.note,
        items: order.items.map((i) => ({
          name: i.drug.name,
          unit: i.drug.unit,
          quantity: i.quantity,
        })),
        trackings: order.trackings.map((tr) => ({
          status: tr.status,
          note: tr.note,
          createdAt: tr.createdAt.toISOString(),
        })),
      }}
    />
  );
}
