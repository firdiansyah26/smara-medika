import { serveApi } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return serveApi(req, { scope: null }, async (key) => {
    const tenant = await db.tenant.findUnique({
      where: { id: key.tenantId },
      select: { id: true, name: true, type: true, code: true },
    });
    return {
      tenant,
      key: { name: key.name, mode: key.mode, scopes: key.scopes },
    };
  });
}
