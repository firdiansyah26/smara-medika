import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf, type InvoicePdfData } from "@/components/pdf/invoice-pdf";
import { db } from "@/lib/db";

const STATUS_ID: Record<string, string> = {
  DRAFT: "Draf",
  UNPAID: "Belum Bayar",
  PAID: "Lunas",
  CANCELLED: "Dibatalkan",
};
const CAT_ID: Record<string, string> = {
  CONSULTATION: "Konsultasi",
  DRUG: "Obat",
  PROCEDURE: "Tindakan",
  LAB: "Laboratorium",
  OTHER: "Lainnya",
};

/** Ambil invoice (tenant-scoped) & render ke buffer PDF. Null bila tak ada. */
export async function buildInvoicePdf(
  invoiceId: string,
  tenantId: string,
  facilityName: string,
): Promise<{ buffer: Buffer; invoiceNumber: string } | null> {
  const inv = await db.invoice.findFirst({
    where: { id: invoiceId, tenantId },
    include: {
      patient: { select: { name: true, mrNumber: true, address: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!inv) return null;

  const subtotal = inv.items.reduce((sum, i) => sum + i.amount, 0);
  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const data: InvoicePdfData = {
    facilityName,
    invoiceNumber: inv.invoiceNumber,
    status: STATUS_ID[inv.status] ?? inv.status,
    patientName: inv.patient.name,
    mrNumber: inv.patient.mrNumber,
    address: inv.patient.address,
    createdAt: dateFmt.format(inv.createdAt),
    paidAt: inv.paidAt ? dateFmt.format(inv.paidAt) : null,
    discount: inv.discount,
    subtotal,
    total: inv.total,
    items: inv.items.map((it) => ({
      category: CAT_ID[it.category] ?? it.category,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      amount: it.amount,
    })),
  };

  const buffer = await renderToBuffer(<InvoicePdf data={data} />);
  return { buffer, invoiceNumber: inv.invoiceNumber };
}
