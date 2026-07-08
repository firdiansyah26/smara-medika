import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { EncounterEditor } from "./encounter-editor";

export const dynamic = "force-dynamic";

export default async function EncounterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const encounter = await db.encounter.findFirst({
    where: { id, tenantId: tenant.tenantId, deletedAt: null },
    include: {
      patient: { select: { id: true, name: true, mrNumber: true } },
      vitalSign: true,
      diagnoses: { orderBy: { type: "asc" } },
      prescriptions: {
        include: { items: { include: { drug: { select: { name: true, unit: true } } } } },
      },
    },
  });
  if (!encounter) notFound();

  const drugStocks = await db.drugStock.findMany({
    where: { tenantId: tenant.tenantId },
    include: { drug: { select: { name: true, unit: true } } },
    orderBy: { drug: { name: "asc" } },
  });
  const drugOptions = drugStocks.map((s) => ({
    drugId: s.drugId,
    name: s.drug.name,
    unit: s.drug.unit,
  }));
  const prescriptionItems = encounter.prescriptions.flatMap((p) =>
    p.items.map((it) => ({
      id: it.id,
      drugName: it.drug.name,
      unit: it.drug.unit,
      dosage: it.dosage,
      frequency: it.frequency,
      quantity: it.quantity,
      instruction: it.instruction,
    })),
  );

  const docs = await db.medicalDocument.findMany({
    where: { tenantId: tenant.tenantId, encounterId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, number: true, createdAt: true },
  });
  const documents = docs.map((d) => ({
    id: d.id,
    type: d.type,
    number: d.number,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <EncounterEditor
      documents={documents}
      data={{
        id: encounter.id,
        patientId: encounter.patient.id,
        patientName: encounter.patient.name,
        mrNumber: encounter.patient.mrNumber,
        visitDate: encounter.visitDate.toISOString(),
        status: encounter.status,
        subjective: encounter.subjective,
        objective: encounter.objective,
        assessment: encounter.assessment,
        plan: encounter.plan,
        vital: encounter.vitalSign
          ? {
              systolic: encounter.vitalSign.systolic,
              diastolic: encounter.vitalSign.diastolic,
              temperature: encounter.vitalSign.temperature,
              heartRate: encounter.vitalSign.heartRate,
              respiratoryRate: encounter.vitalSign.respiratoryRate,
              spo2: encounter.vitalSign.spo2,
              weight: encounter.vitalSign.weight,
              height: encounter.vitalSign.height,
            }
          : null,
        diagnoses: encounter.diagnoses.map((d) => ({
          id: d.id,
          icdCode: d.icdCode,
          icdName: d.icdName,
          type: d.type,
        })),
        prescriptionItems,
        drugOptions,
      }}
    />
  );
}
