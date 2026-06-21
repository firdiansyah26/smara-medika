import { serveApi } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return serveApi(req, { scope: "encounters:read" }, async (key) => {
    const url = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20),
    );
    const offset = Math.max(
      0,
      parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
    );
    const patientId = url.searchParams.get("patient_id") ?? undefined;

    const where = {
      tenantId: key.tenantId,
      deletedAt: null,
      ...(patientId ? { patientId } : {}),
    };
    const [total, rows] = await Promise.all([
      db.encounter.count({ where }),
      db.encounter.findMany({
        where,
        orderBy: { visitDate: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          visitDate: true,
          status: true,
          patient: { select: { id: true, mrNumber: true, name: true } },
          doctor: { select: { name: true } },
        },
      }),
    ]);

    return {
      data: rows.map((e) => ({
        id: e.id,
        visit_date: e.visitDate.toISOString(),
        status: e.status,
        patient: {
          id: e.patient.id,
          mr_number: e.patient.mrNumber,
          name: e.patient.name,
        },
        doctor: e.doctor.name,
      })),
      pagination: { total, limit, offset },
    };
  });
}
