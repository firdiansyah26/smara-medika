import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { calcAge } from "@/lib/utils";
import { hasPatientAccess } from "../actions";
import { AccessView } from "./access-view";

export const dynamic = "force-dynamic";

export default async function AccessViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const allowed = await hasPatientAccess(tenant.tenantId, id);
  if (!allowed) {
    return <AccessView data={null} />;
  }

  const patient = await db.patient.findFirst({
    where: { id },
    include: {
      tenant: { select: { name: true } },
      allergies: { orderBy: { allergen: "asc" } },
      encounters: {
        orderBy: { visitDate: "desc" },
        take: 10,
        select: { id: true, visitDate: true, status: true },
      },
    },
  });
  if (!patient) notFound();

  return (
    <AccessView
      data={{
        name: patient.name,
        gender: patient.gender,
        ownerName: patient.tenant.name,
        birthDate: patient.birthDate.toISOString(),
        age: calcAge(patient.birthDate),
        allergies: patient.allergies.map((a) => ({
          allergen: a.allergen,
          reaction: a.reaction,
          severity: a.severity,
        })),
        visits: patient.encounters.map((e) => ({
          visitDate: e.visitDate.toISOString(),
          status: e.status,
        })),
      }}
    />
  );
}
