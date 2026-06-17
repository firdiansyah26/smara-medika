import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { RecordsList, type RecordRow } from "./records-list";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const tenant = await getActiveTenant();

  const encounters = tenant
    ? await db.encounter.findMany({
        where: { tenantId: tenant.tenantId, deletedAt: null },
        orderBy: { visitDate: "desc" },
        take: 50,
        include: {
          patient: { select: { name: true, mrNumber: true } },
          _count: { select: { diagnoses: true } },
        },
      })
    : [];

  const rows: RecordRow[] = encounters.map((e) => ({
    id: e.id,
    date: e.visitDate.toISOString(),
    patientName: e.patient.name,
    mrNumber: e.patient.mrNumber,
    status: e.status,
    diagnosesCount: e._count.diagnoses,
  }));

  return <RecordsList rows={rows} />;
}
