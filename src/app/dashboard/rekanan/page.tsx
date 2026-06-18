import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { RekananPanel, type PartnerItem, type TenantOption } from "./rekanan-panel";

export const dynamic = "force-dynamic";

export default async function RekananPage() {
  const tenant = await getActiveTenant();
  if (!tenant) {
    return <RekananPanel incoming={[]} outgoing={[]} active={[]} candidates={[]} />;
  }
  const tenantId = tenant.tenantId;

  const partnerships = await db.tenantPartnership.findMany({
    where: {
      OR: [{ requesterTenantId: tenantId }, { addresseeTenantId: tenantId }],
    },
    include: {
      requesterTenant: { select: { id: true, name: true, type: true } },
      addresseeTenant: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const other = (p: (typeof partnerships)[number]) =>
    p.requesterTenantId === tenantId ? p.addresseeTenant : p.requesterTenant;

  const toItem = (p: (typeof partnerships)[number]): PartnerItem => {
    const o = other(p);
    return { id: p.id, name: o.name, type: o.type };
  };

  const incoming = partnerships
    .filter((p) => p.addresseeTenantId === tenantId && p.status === "PENDING")
    .map(toItem);
  const outgoing = partnerships
    .filter((p) => p.requesterTenantId === tenantId && p.status === "PENDING")
    .map(toItem);
  const active = partnerships
    .filter((p) => p.status === "ACTIVE")
    .map(toItem);

  const relatedIds = new Set(
    partnerships
      .filter((p) => p.status === "PENDING" || p.status === "ACTIVE")
      .map((p) => (p.requesterTenantId === tenantId ? p.addresseeTenantId : p.requesterTenantId)),
  );
  const candidatesRaw = await db.tenant.findMany({
    where: { id: { notIn: [tenantId, ...relatedIds] }, isActive: true },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
  const candidates: TenantOption[] = candidatesRaw;

  return (
    <RekananPanel
      incoming={incoming}
      outgoing={outgoing}
      active={active}
      candidates={candidates}
    />
  );
}
