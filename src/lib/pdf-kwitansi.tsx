import { renderToBuffer } from "@react-pdf/renderer";
import { KwitansiPdf, type KwitansiPdfData } from "@/components/pdf/kwitansi-pdf";
import { db } from "@/lib/db";
import { terbilang } from "@/lib/utils";

/** Render kwitansi dari invoice LUNAS (tenant-scoped). Null bila tak ada / belum lunas. */
export async function buildKwitansiPdf(
  invoiceId: string,
  tenantId: string,
  facilityName: string,
): Promise<{ buffer: Buffer; receiptNo: string } | null> {
  const inv = await db.invoice.findFirst({
    where: { id: invoiceId, tenantId, status: "PAID" },
    include: {
      patient: { select: { name: true } },
      tenant: { select: { city: true } },
    },
  });
  if (!inv) return null;

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const receiptNo = inv.invoiceNumber.replace(/^INV-/, "KW-");
  const words = terbilang(inv.total);

  const data: KwitansiPdfData = {
    facilityName,
    receiptNo,
    invoiceNumber: inv.invoiceNumber,
    patientName: inv.patient.name,
    total: inv.total,
    totalWords: words.charAt(0).toUpperCase() + words.slice(1),
    purpose: "Layanan kesehatan",
    paidAt: inv.paidAt ? dateFmt.format(inv.paidAt) : dateFmt.format(new Date()),
    city: inv.tenant.city ?? "-",
  };

  const buffer = await renderToBuffer(<KwitansiPdf data={data} />);
  return { buffer, receiptNo };
}
