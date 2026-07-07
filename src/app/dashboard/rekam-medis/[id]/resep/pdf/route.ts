import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { buildResepPdf } from "@/lib/pdf-resep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const tenant = await getActiveTenant();
  if (!tenant) return new Response("Forbidden", { status: 403 });

  const result = await buildResepPdf(id, tenant.tenantId, tenant.tenantName);
  if (!result) return new Response("Not found", { status: 404 });

  const download = new URL(req.url).searchParams.get("download") === "1";
  return new Response(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${result.label}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
