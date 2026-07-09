import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveTenant } from "@/lib/tenant-context";
import { PagePlaceholder } from "@/components/page-placeholder";
import {
  DEFAULT_WA_TEMPLATES,
  WA_PURPOSES,
} from "@/lib/wa-templates";
import { WhatsappView, type PatientOption, type TemplateRow } from "./whatsapp-view";
import type { NotificationType } from "@prisma/client";

export const dynamic = "force-dynamic";

const EDIT_ROLES = ["OWNER", "ADMIN"];

export default async function Page() {
  await auth();
  const tenant = await getActiveTenant();
  if (!tenant) return <PagePlaceholder navKey="whatsapp" />;

  const [saved, patients] = await Promise.all([
    db.whatsappTemplate.findMany({ where: { tenantId: tenant.tenantId } }),
    db.patient.findMany({
      where: { tenantId: tenant.tenantId, deletedAt: null, phone: { not: null } },
      orderBy: { name: "asc" },
      take: 300,
      select: { id: true, name: true, mrNumber: true, phone: true },
    }),
  ]);

  const savedByPurpose = new Map(saved.map((t) => [t.purpose, t.body]));
  const templates: TemplateRow[] = WA_PURPOSES.map((p) => ({
    purpose: p as NotificationType,
    body: savedByPurpose.get(p) ?? DEFAULT_WA_TEMPLATES[p],
    isCustom: savedByPurpose.has(p),
  }));

  const patientOptions: PatientOption[] = patients.map((p) => ({
    id: p.id,
    name: p.name,
    mrNumber: p.mrNumber,
    phone: p.phone ?? "",
  }));

  return (
    <WhatsappView
      facilityName={tenant.tenantName}
      templates={templates}
      patients={patientOptions}
      canEdit={EDIT_ROLES.includes(tenant.role)}
    />
  );
}
