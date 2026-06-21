import { serveApi } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return serveApi(req, { scope: "patients:read" }, async (key) => {
    const p = await db.patient.findFirst({
      where: { id, tenantId: key.tenantId, deletedAt: null },
      select: {
        id: true,
        mrNumber: true,
        name: true,
        nik: true,
        gender: true,
        bloodType: true,
        birthDate: true,
        phone: true,
        city: true,
        createdAt: true,
        allergies: {
          select: { allergen: true, reaction: true, severity: true },
        },
      },
    });
    if (!p) return { error: "not_found" };
    return {
      id: p.id,
      mr_number: p.mrNumber,
      name: p.name,
      nik: p.nik,
      gender: p.gender,
      blood_type: p.bloodType,
      birth_date: p.birthDate.toISOString().slice(0, 10),
      phone: p.phone,
      city: p.city,
      created_at: p.createdAt.toISOString(),
      allergies: p.allergies,
    };
  });
}
