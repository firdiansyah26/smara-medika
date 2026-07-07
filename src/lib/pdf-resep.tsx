import { renderToBuffer } from "@react-pdf/renderer";
import { ResepPdf, type ResepPdfData } from "@/components/pdf/resep-pdf";
import { db } from "@/lib/db";
import { calcAge } from "@/lib/utils";

/** Ambil encounter (tenant-scoped) & render resep ke buffer PDF. */
export async function buildResepPdf(
  encounterId: string,
  tenantId: string,
  facilityName: string,
): Promise<{ buffer: Buffer; label: string } | null> {
  const enc = await db.encounter.findFirst({
    where: { id: encounterId, tenantId, deletedAt: null },
    include: {
      patient: { select: { name: true, mrNumber: true, birthDate: true } },
      doctor: { select: { name: true } },
      prescriptions: {
        include: {
          items: { include: { drug: { select: { name: true, unit: true } } } },
        },
      },
    },
  });
  if (!enc) return null;

  const items = enc.prescriptions.flatMap((p) =>
    p.items.map((it) => ({
      drugName: it.drug.name,
      unit: it.drug.unit,
      dosage: it.dosage,
      frequency: it.frequency,
      quantity: it.quantity,
      instruction: it.instruction,
    })),
  );

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const data: ResepPdfData = {
    facilityName,
    patientName: enc.patient.name,
    mrNumber: enc.patient.mrNumber,
    patientAge: `${calcAge(enc.patient.birthDate)} tahun`,
    doctorName: enc.doctor.name,
    visitDate: dateFmt.format(enc.visitDate),
    items,
  };

  const buffer = await renderToBuffer(<ResepPdf data={data} />);
  return { buffer, label: `resep-${enc.patient.mrNumber}` };
}
