import { renderToBuffer } from "@react-pdf/renderer";
import {
  MedicalDocPdf,
  type MedicalDocPdfData,
  type SickNoteData,
  type ReferralData,
} from "@/components/pdf/medical-doc-pdf";
import { db } from "@/lib/db";
import { calcAge } from "@/lib/utils";

/** Render dokumen klinis (surat sakit/rujukan) ke buffer PDF (tenant-scoped). */
export async function buildMedicalDocPdf(
  docId: string,
  tenantId: string,
  facilityName: string,
): Promise<{ buffer: Buffer; number: string } | null> {
  const doc = await db.medicalDocument.findFirst({
    where: { id: docId, tenantId },
    include: { tenant: { select: { city: true } } },
  });
  if (!doc) return null;

  const [patient, doctor] = await Promise.all([
    db.patient.findUnique({
      where: { id: doc.patientId },
      select: { name: true, gender: true, birthDate: true, address: true, city: true },
    }),
    db.user.findUnique({
      where: { id: doc.doctorId },
      select: { name: true },
    }),
  ]);
  if (!patient) return null;

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const raw = doc.data as Record<string, unknown>;
  const body =
    doc.type === "SICK_NOTE"
      ? ({
          kind: "SICK_NOTE",
          restDays: Number(raw.restDays ?? 0),
          startDate: String(raw.startDate ?? ""),
          diagnosis: String(raw.diagnosis ?? ""),
          note: String(raw.note ?? ""),
        } satisfies SickNoteData)
      : ({
          kind: "REFERRAL",
          toFacility: String(raw.toFacility ?? ""),
          toDoctor: String(raw.toDoctor ?? ""),
          reason: String(raw.reason ?? ""),
          diagnosis: String(raw.diagnosis ?? ""),
        } satisfies ReferralData);

  const data: MedicalDocPdfData = {
    facilityName,
    facilityCity: doc.tenant.city || "-",
    number: doc.number,
    patientName: patient.name,
    patientAge: `${calcAge(patient.birthDate)} tahun`,
    patientGender:
      patient.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
    patientAddress: patient.address ?? patient.city ?? "-",
    doctorName: doctor?.name ?? "-",
    dateStr: dateFmt.format(doc.createdAt),
    body,
  };

  const buffer = await renderToBuffer(<MedicalDocPdf data={data} />);
  return { buffer, number: doc.number };
}
