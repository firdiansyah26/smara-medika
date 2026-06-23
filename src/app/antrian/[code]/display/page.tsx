import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DisplayBoard } from "./display-board";

export const dynamic = "force-dynamic";

export default async function DisplayPage({
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

  return <DisplayBoard tenantCode={tenant.code} tenantName={tenant.name} />;
}
