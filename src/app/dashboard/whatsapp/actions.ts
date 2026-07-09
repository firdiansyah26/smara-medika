"use server";

import { revalidatePath } from "next/cache";
import type { NotificationType, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { WA_PURPOSES } from "@/lib/wa-templates";

const EDIT_ROLES: Role[] = ["OWNER", "ADMIN"];
const SEND_ROLES: Role[] = ["OWNER", "ADMIN", "RESEPSIONIS", "DOKTER", "PERAWAT"];

async function ctx(roles: Role[]) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !roles.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

/** Simpan/ubah template pesan WhatsApp untuk satu keperluan. */
export async function saveWaTemplate(formData: FormData): Promise<void> {
  const c = await ctx(EDIT_ROLES);
  if (!c) return;

  const purpose = String(formData.get("purpose") ?? "") as NotificationType;
  const body = String(formData.get("body") ?? "").trim();
  if (!WA_PURPOSES.includes(purpose) || !body) return;

  await db.whatsappTemplate.upsert({
    where: { tenantId_purpose: { tenantId: c.tenantId, purpose } },
    update: { body, updatedById: c.userId },
    create: { tenantId: c.tenantId, purpose, body, updatedById: c.userId },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "WhatsappTemplate",
    entityId: purpose,
  });
  revalidatePath("/dashboard/whatsapp");
}

/** Catat bahwa pesan WhatsApp telah disiapkan/dikirim manual (log notifikasi). */
export async function logWaSend(formData: FormData): Promise<void> {
  const c = await ctx(SEND_ROLES);
  if (!c) return;

  const purpose = String(formData.get("purpose") ?? "") as NotificationType;
  const recipient = String(formData.get("recipient") ?? "").trim();
  const patientName = String(formData.get("patientName") ?? "").trim();
  if (!WA_PURPOSES.includes(purpose) || !recipient) return;

  await db.notification.create({
    data: {
      tenantId: c.tenantId,
      type: purpose,
      channel: "WHATSAPP",
      recipient,
      subject: `WhatsApp ke ${patientName || recipient}`,
      status: "SENT",
      createdById: c.userId,
    },
  });
  revalidatePath("/dashboard/whatsapp");
  revalidatePath("/dashboard/notifikasi");
}
