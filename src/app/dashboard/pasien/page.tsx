import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { calcAge } from "@/lib/utils";
import { PatientsTable, type PatientRow } from "./patients-table";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const tenant = await getActiveTenant();

  const patients = tenant
    ? await db.patient.findMany({
        where: { tenantId: tenant.tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          encounters: {
            orderBy: { visitDate: "desc" },
            take: 1,
            select: { visitDate: true },
          },
        },
      })
    : [];

  const rows: PatientRow[] = patients.map((p) => ({
    id: p.id,
    mrNumber: p.mrNumber,
    name: p.name,
    gender: p.gender,
    age: calcAge(p.birthDate),
    phone: p.phone,
    lastVisit: p.encounters[0]?.visitDate.toISOString() ?? null,
  }));

  return <PatientsTable rows={rows} />;
}
