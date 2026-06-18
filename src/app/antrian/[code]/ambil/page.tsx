import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Kiosk } from "./kiosk";

export const dynamic = "force-dynamic";

export default async function KioskPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const tenant = await db.tenant.findUnique({
    where: { code },
    select: { name: true, code: true },
  });
  if (!tenant) notFound();

  return <Kiosk tenantCode={tenant.code} tenantName={tenant.name} />;
}
