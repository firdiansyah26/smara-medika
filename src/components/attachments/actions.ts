"use server";

import { revalidatePath } from "next/cache";
import type { AttachmentEntity } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import {
  ATTACHMENT_ENTITIES,
  MAX_ATTACHMENT_BYTES,
  isAllowedMime,
} from "@/lib/attachments";

export type UploadState = {
  error?: "notAllowed" | "noFile" | "tooLarge" | "badType";
  ok?: boolean;
};

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

export async function uploadAttachment(
  _prev: UploadState | undefined,
  formData: FormData,
): Promise<UploadState> {
  const c = await ctx();
  if (!c) return { error: "notAllowed" };

  const entityType = String(formData.get("entityType") ?? "") as AttachmentEntity;
  const entityId = String(formData.get("entityId") ?? "");
  const revalidate = String(formData.get("revalidate") ?? "");
  if (!ATTACHMENT_ENTITIES.includes(entityType) || !entityId) {
    return { error: "notAllowed" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "noFile" };
  if (file.size > MAX_ATTACHMENT_BYTES) return { error: "tooLarge" };
  if (!isAllowedMime(file.type)) return { error: "badType" };

  const buffer = Buffer.from(await file.arrayBuffer());

  const att = await db.attachment.create({
    data: {
      tenantId: c.tenantId,
      entityType,
      entityId,
      fileName: file.name.slice(0, 200),
      mimeType: file.type,
      size: file.size,
      data: buffer,
      uploadedById: c.userId,
    },
    select: { id: true },
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "Attachment",
    entityId: att.id,
    changes: { entityType, entityId, fileName: file.name, size: file.size },
  });

  if (revalidate) revalidatePath(revalidate);
  return { ok: true };
}

export async function deleteAttachment(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const id = String(formData.get("id") ?? "");
  const revalidate = String(formData.get("revalidate") ?? "");
  const att = await db.attachment.findFirst({
    where: { id, tenantId: c.tenantId },
    select: { id: true },
  });
  if (!att) return;

  await db.attachment.delete({ where: { id: att.id } });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "DELETE",
    entity: "Attachment",
    entityId: att.id,
  });

  if (revalidate) revalidatePath(revalidate);
}
