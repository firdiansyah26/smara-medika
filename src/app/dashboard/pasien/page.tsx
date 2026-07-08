import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { calcAge } from "@/lib/utils";
import { PatientsTable, type PatientRow } from "./patients-table";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const tenant = await getActiveTenant();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const where = tenant
    ? {
        tenantId: tenant.tenantId,
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { mrNumber: { contains: q, mode: "insensitive" as const } },
                { nik: { contains: q, mode: "insensitive" as const } },
                { phone: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      }
    : null;

  const [total, patients] = where
    ? await Promise.all([
        db.patient.count({ where }),
        db.patient.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            encounters: {
              orderBy: { visitDate: "desc" },
              take: 1,
              select: { visitDate: true },
            },
          },
        }),
      ])
    : [0, []];

  const rows: PatientRow[] = patients.map((p) => ({
    id: p.id,
    mrNumber: p.mrNumber,
    name: p.name,
    gender: p.gender,
    age: calcAge(p.birthDate),
    phone: p.phone,
    lastVisit: p.encounters[0]?.visitDate.toISOString() ?? null,
  }));

  return (
    <PatientsTable
      rows={rows}
      q={q}
      page={page}
      pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
    />
  );
}
