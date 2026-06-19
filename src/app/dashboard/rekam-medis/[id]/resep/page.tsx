import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { ResepPrint } from "./resep-print";

export const dynamic = "force-dynamic";

export default async function ResepPage({
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
      patient: { select: { name: true, mrNumber: true, birthDate: true } },
      doctor: { select: { name: true } },
      prescriptions: {
        include: { items: { include: { drug: { select: { name: true, unit: true } } } } },
      },
    },
  });
  if (!encounter) notFound();

  const items = encounter.prescriptions.flatMap((p) =>
    p.items.map((it) => ({
      drugName: it.drug.name,
      unit: it.drug.unit,
      dosage: it.dosage,
      frequency: it.frequency,
      quantity: it.quantity,
      instruction: it.instruction,
    })),
  );

  return (
    <ResepPrint
      data={{
        facilityName: tenant.tenantName,
        patientName: encounter.patient.name,
        mrNumber: encounter.patient.mrNumber,
        doctorName: encounter.doctor.name,
        visitDate: encounter.visitDate.toISOString(),
        items,
      }}
    />
  );
}
