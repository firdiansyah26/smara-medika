import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { LabResultPrint } from "./lab-print";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getActiveTenant();
  if (!tenant) notFound();

  const order = await db.labOrder.findFirst({
    where: { id, tenantId: tenant.tenantId },
    include: {
      patient: { select: { name: true, mrNumber: true } },
      items: { orderBy: { id: "asc" } },
    },
  });
  if (!order) notFound();

  return (
    <LabResultPrint
      data={{
        facilityName: tenant.tenantName,
        orderNumber: order.orderNumber,
        category: order.category,
        status: order.status,
        patientName: order.patient.name,
        mrNumber: order.patient.mrNumber,
        clinicalNote: order.clinicalNote,
        createdAt: order.createdAt.toISOString(),
        completedAt: order.completedAt?.toISOString() ?? null,
        items: order.items.map((it) => ({
          testName: it.testName,
          result: it.result,
          unit: it.unit,
          referenceRange: it.referenceRange,
          flag: it.flag,
        })),
      }}
    />
  );
}
