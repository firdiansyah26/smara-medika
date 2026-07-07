import { renderToBuffer } from "@react-pdf/renderer";
import { LabPdf, type LabPdfData } from "@/components/pdf/lab-pdf";
import { db } from "@/lib/db";

const CAT_ID: Record<string, string> = {
  LABORATORIUM: "Laboratorium",
  RADIOLOGI: "Radiologi",
};
const STATUS_ID: Record<string, string> = {
  REQUESTED: "Diminta",
  IN_PROGRESS: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
const FLAG_ID: Record<string, string> = {
  NORMAL: "Normal",
  LOW: "Rendah",
  HIGH: "Tinggi",
  ABNORMAL: "Abnormal",
};

/** Ambil lab order (tenant-scoped) & render hasil ke buffer PDF. */
export async function buildLabPdf(
  labOrderId: string,
  tenantId: string,
  facilityName: string,
): Promise<{ buffer: Buffer; label: string } | null> {
  const order = await db.labOrder.findFirst({
    where: { id: labOrderId, tenantId },
    include: {
      patient: { select: { name: true, mrNumber: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!order) return null;

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const data: LabPdfData = {
    facilityName,
    orderNumber: order.orderNumber,
    categoryLabel: CAT_ID[order.category] ?? order.category,
    statusLabel: STATUS_ID[order.status] ?? order.status,
    patientName: order.patient.name,
    mrNumber: order.patient.mrNumber,
    createdAt: dateFmt.format(order.createdAt),
    completedAt: order.completedAt ? dateFmt.format(order.completedAt) : null,
    items: order.items.map((it) => ({
      testName: it.testName,
      result: it.result,
      unit: it.unit,
      referenceRange: it.referenceRange,
      flagLabel: it.flag ? (FLAG_ID[it.flag] ?? it.flag) : null,
      abnormal: it.flag != null && it.flag !== "NORMAL",
    })),
  };

  const buffer = await renderToBuffer(<LabPdf data={data} />);
  return { buffer, label: order.orderNumber };
}
