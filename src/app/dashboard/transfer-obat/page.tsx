import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  TransferList,
  type OrderRow,
  type PartnerStock,
} from "./transfer-list";

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  const tenant = await getActiveTenant();
  if (!tenant) {
    return <TransferList outgoing={[]} incoming={[]} partners={[]} />;
  }
  const tenantId = tenant.tenantId;

  const [outgoingRaw, incomingRaw, partnerships] = await Promise.all([
    db.drugOrder.findMany({
      where: { requesterTenantId: tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        supplierTenant: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    }),
    db.drugOrder.findMany({
      where: { supplierTenantId: tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        requesterTenant: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    }),
    db.tenantPartnership.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ requesterTenantId: tenantId }, { addresseeTenantId: tenantId }],
      },
      include: {
        requesterTenant: { select: { id: true, name: true } },
        addresseeTenant: { select: { id: true, name: true } },
      },
    }),
  ]);

  const toRow = (o: { id: string; orderNumber: string; status: string; items: { quantity: number }[] }, partnerName: string): OrderRow => ({
    id: o.id,
    orderNumber: o.orderNumber,
    partnerName,
    status: o.status as OrderRow["status"],
    totalQty: o.items.reduce((s, i) => s + i.quantity, 0),
  });

  const outgoing = outgoingRaw.map((o) => toRow(o, o.supplierTenant.name));
  const incoming = incomingRaw.map((o) => toRow(o, o.requesterTenant.name));

  // Rekanan aktif + stok obat masing-masing (untuk form buat order).
  const partnerTenants = partnerships.map((p) =>
    p.requesterTenantId === tenantId ? p.addresseeTenant : p.requesterTenant,
  );
  const partners: PartnerStock[] = await Promise.all(
    partnerTenants.map(async (pt) => {
      const stocks = await db.drugStock.findMany({
        where: { tenantId: pt.id, quantity: { gt: 0 } },
        include: { drug: { select: { name: true, unit: true } } },
        orderBy: { drug: { name: "asc" } },
      });
      return {
        id: pt.id,
        name: pt.name,
        drugs: stocks.map((s) => ({
          drugId: s.drugId,
          name: s.drug.name,
          unit: s.drug.unit,
          stock: s.quantity,
        })),
      };
    }),
  );

  return (
    <TransferList outgoing={outgoing} incoming={incoming} partners={partners} />
  );
}
