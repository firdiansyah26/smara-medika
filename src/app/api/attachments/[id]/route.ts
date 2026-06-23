import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";

export const dynamic = "force-dynamic";

/** Sajikan byte lampiran dari DB — wajib sesi & tenant aktif yang cocok. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const tenant = await getActiveTenant();
  if (!tenant) return new Response("Forbidden", { status: 403 });

  const att = await db.attachment.findFirst({
    where: { id, tenantId: tenant.tenantId },
    select: { data: true, mimeType: true, fileName: true },
  });
  if (!att) return new Response("Not found", { status: 404 });

  const body = new Uint8Array(att.data);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": att.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(att.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
