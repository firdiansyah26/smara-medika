import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { InvoicePrint } from "./invoice-print";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const inv = await db.invoice.findFirst({
    where: { id, tenantId: tenant.tenantId },
    include: {
      patient: { select: { name: true, mrNumber: true, address: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!inv) notFound();

  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);

  return (
    <InvoicePrint
      data={{
        facilityName: tenant.tenantName,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        patientName: inv.patient.name,
        mrNumber: inv.patient.mrNumber,
        address: inv.patient.address,
        createdAt: inv.createdAt.toISOString(),
        paidAt: inv.paidAt?.toISOString() ?? null,
        discount: inv.discount,
        subtotal,
        total: inv.total,
        items: inv.items.map((it) => ({
          category: it.category,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          amount: it.amount,
        })),
      }}
    />
  );
}
