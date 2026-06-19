import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { InvoiceDetail } from "./invoice-detail";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "RESEPSIONIS"];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await auth();
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const inv = await db.invoice.findFirst({
    where: { id, tenantId: tenant.tenantId },
    include: {
      patient: { select: { name: true, mrNumber: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!inv) notFound();

  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);

  return (
    <InvoiceDetail
      canManage={MANAGE_ROLES.includes(tenant.role)}
      data={{
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        patient: inv.patient.name,
        mrNumber: inv.patient.mrNumber,
        discount: inv.discount,
        subtotal,
        total: inv.total,
        note: inv.note,
        paidAt: inv.paidAt?.toISOString() ?? null,
        createdAt: inv.createdAt.toISOString(),
        items: inv.items.map((it) => ({
          id: it.id,
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
