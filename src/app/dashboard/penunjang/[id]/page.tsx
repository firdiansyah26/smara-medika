import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { LabOrderDetail } from "./lab-detail";

export const dynamic = "force-dynamic";

const MANAGE_ROLES = ["OWNER", "ADMIN", "DOKTER", "PERAWAT"];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await auth();
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

  const attachments = await db.attachment.findMany({
    where: { tenantId: tenant.tenantId, entityType: "LAB_ORDER", entityId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });

  return (
    <LabOrderDetail
      canManage={MANAGE_ROLES.includes(tenant.role)}
      attachments={attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        mimeType: a.mimeType,
        size: a.size,
        createdAt: a.createdAt.toISOString(),
      }))}
      data={{
        id: order.id,
        orderNumber: order.orderNumber,
        category: order.category,
        status: order.status,
        patient: order.patient.name,
        mrNumber: order.patient.mrNumber,
        clinicalNote: order.clinicalNote,
        completedAt: order.completedAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((it) => ({
          id: it.id,
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
