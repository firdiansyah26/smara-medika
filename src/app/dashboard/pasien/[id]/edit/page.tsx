import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PatientForm } from "../../patient-form";

export const dynamic = "force-dynamic";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const patient = await db.patient.findFirst({
    where: { id, tenantId: tenant.tenantId, deletedAt: null },
  });
  if (!patient) notFound();

  return (
    <PatientForm
      mode="edit"
      patient={{
        id: patient.id,
        name: patient.name,
        nik: patient.nik ?? "",
        birthDate: patient.birthDate.toISOString().slice(0, 10),
        gender: patient.gender,
        bloodType: (patient.bloodType ?? "") as "" | "A" | "B" | "AB" | "O",
        phone: patient.phone ?? "",
        address: patient.address ?? "",
        city: patient.city ?? "",
        bpjsNumber: patient.bpjsNumber ?? "",
        emergencyContact: patient.emergencyContact ?? "",
      }}
    />
  );
}
