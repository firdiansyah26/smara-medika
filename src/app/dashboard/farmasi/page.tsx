import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PharmacyTable, type DrugRow } from "./pharmacy-table";

export const dynamic = "force-dynamic";

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

  return <PharmacyTable rows={rows} />;
}
