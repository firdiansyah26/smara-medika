import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { calcAge } from "@/lib/utils";
import { PatientDetail } from "./patient-detail";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const patient = await db.patient.findFirst({
    where: { id, tenantId: tenant.tenantId, deletedAt: null },
    include: {
      encounters: {
        orderBy: { visitDate: "desc" },
        select: { id: true, visitDate: true, status: true },
      },
      allergies: { orderBy: { allergen: "asc" } },
    },
  });
  if (!patient) notFound();

  return (
    <PatientDetail
      data={{
        id: patient.id,
        mrNumber: patient.mrNumber,
        name: patient.name,
        nik: patient.nik,
        gender: patient.gender,
        bloodType: patient.bloodType,
        phone: patient.phone,
        address: patient.address,
        city: patient.city,
        bpjsNumber: patient.bpjsNumber,
        emergencyContact: patient.emergencyContact,
        birthDate: patient.birthDate.toISOString(),
        age: calcAge(patient.birthDate),
        visits: patient.encounters.map((e) => ({
          id: e.id,
          visitDate: e.visitDate.toISOString(),
          status: e.status,
        })),
        allergies: patient.allergies.map((a) => ({
          id: a.id,
          allergen: a.allergen,
          reaction: a.reaction,
          severity: a.severity,
        })),
      }}
    />
  );
}
