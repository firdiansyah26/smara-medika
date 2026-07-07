import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { buildInvoicePdf } from "@/lib/pdf-invoice";

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

  const result = await buildInvoicePdf(id, tenant.tenantId, tenant.tenantName);
  if (!result) return new Response("Not found", { status: 404 });

  const download = new URL(req.url).searchParams.get("download") === "1";
  const disposition = download ? "attachment" : "inline";

  return new Response(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${result.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
