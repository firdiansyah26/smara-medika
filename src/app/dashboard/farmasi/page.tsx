import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import type { AttachmentItem } from "@/components/attachments/attachment-section";
import { PharmacyTable, type DrugRow } from "./pharmacy-table";

export const dynamic = "force-dynamic";

const PHARMACY_ROLES = ["OWNER", "ADMIN", "APOTEKER"];

export default async function PharmacyPage() {
  const tenant = await getActiveTenant();

  const stocks = tenant
    ? await db.drugStock.findMany({
        where: { tenantId: tenant.tenantId },
        include: { drug: true },
        orderBy: { drug: { name: "asc" } },
      })
    : [];

  const rows: DrugRow[] = stocks.map((s) => ({
    drugId: s.drugId,
    name: s.drug.name,
    genericName: s.drug.genericName,
    unit: s.drug.unit,
    category: s.drug.category,
    quantity: s.quantity,
    price: s.price ? Number(s.price) : null,
    minStock: s.minStock,
  }));

  // Lampiran (foto obat) per drug, dikelompokkan.
  const attachmentsByDrug: Record<string, AttachmentItem[]> = {};
  if (tenant && rows.length > 0) {
    const atts = await db.attachment.findMany({
      where: {
        tenantId: tenant.tenantId,
        entityType: "DRUG",
        entityId: { in: rows.map((r) => r.drugId) },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        entityId: true,
        fileName: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    });
    for (const a of atts) {
      (attachmentsByDrug[a.entityId] ??= []).push({
        id: a.id,
        fileName: a.fileName,
        mimeType: a.mimeType,
        size: a.size,
        createdAt: a.createdAt.toISOString(),
      });
    }
  }

  const canManage = tenant ? PHARMACY_ROLES.includes(tenant.role) : false;

  return (
    <PharmacyTable
      rows={rows}
      attachmentsByDrug={attachmentsByDrug}
      canManage={canManage}
    />
  );
}
