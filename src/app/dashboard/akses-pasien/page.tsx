import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import {
  AccessPanel,
  type IncomingItem,
  type OutgoingItem,
} from "./access-panel";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const tenant = await getActiveTenant();
  if (!tenant) return <AccessPanel incoming={[]} outgoing={[]} />;
  const tenantId = tenant.tenantId;

  const [incomingRaw, outgoingRaw] = await Promise.all([
    db.patientAccessRequest.findMany({
      where: { ownerTenantId: tenantId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { name: true } },
        requesterTenant: { select: { name: true } },
      },
    }),
    db.patientAccessRequest.findMany({
      where: { requesterTenantId: tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { id: true, name: true } },
        ownerTenant: { select: { name: true } },
      },
    }),
  ]);

  const incoming: IncomingItem[] = incomingRaw.map((r) => ({
    id: r.id,
    patientName: r.patient.name,
    requesterName: r.requesterTenant.name,
    reason: r.reason,
  }));

  const outgoing: OutgoingItem[] = outgoingRaw.map((r) => ({
    id: r.id,
    patientId: r.patient.id,
    patientName: r.patient.name,
    ownerName: r.ownerTenant.name,
    status: r.status,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
  }));

  return <AccessPanel incoming={incoming} outgoing={outgoing} />;
}
