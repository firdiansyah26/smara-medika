import { serveApi } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return serveApi(req, { scope: "patients:read" }, async (key) => {
    const url = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20),
    );
    const offset = Math.max(
      0,
      parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
    );

    const where = { tenantId: key.tenantId, deletedAt: null };
    const [total, rows] = await Promise.all([
      db.patient.count({ where }),
      db.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          mrNumber: true,
          name: true,
          gender: true,
          birthDate: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: rows.map((p) => ({
        id: p.id,
        mr_number: p.mrNumber,
        name: p.name,
        gender: p.gender,
        birth_date: p.birthDate.toISOString().slice(0, 10),
        created_at: p.createdAt.toISOString(),
      })),
      pagination: { total, limit, offset },
    };
  });
}
