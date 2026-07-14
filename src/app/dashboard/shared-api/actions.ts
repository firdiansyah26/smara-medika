"use server";

import { revalidatePath } from "next/cache";
import type { Role, ApiKeyMode } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { generateApiKey, API_SCOPES, type ApiScope } from "@/lib/api-auth";
import {
  generateWebhookSecret,
  retryDelivery,
  WEBHOOK_EVENTS,
} from "@/lib/webhooks";

const MANAGE_ROLES: Role[] = ["OWNER", "ADMIN"];

export type CreateKeyState = {
  token?: string;
  prefix?: string;
  error?: "notAllowed" | "required";
};

async function ctx() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const tenant = await getActiveTenant();
  if (!tenant || !MANAGE_ROLES.includes(tenant.role)) return null;
  return { userId: session.user.id, tenantId: tenant.tenantId };
}

export async function createApiKey(
  _prev: CreateKeyState | undefined,
  formData: FormData,
): Promise<CreateKeyState> {
  const c = await ctx();
  if (!c) return { error: "notAllowed" };

  const name = String(formData.get("name") ?? "").trim();
  const mode = (String(formData.get("mode") ?? "LIVE") === "TEST"
    ? "TEST"
    : "LIVE") as ApiKeyMode;
  const scopes = formData
    .getAll("scopes")
    .map((s) => String(s))
    .filter((s): s is ApiScope => (API_SCOPES as readonly string[]).includes(s));

  if (!name || scopes.length === 0) return { error: "required" };

  const { prefix, hashedSecret, token } = generateApiKey(mode);
  const key = await db.apiKey.create({
    data: {
      tenantId: c.tenantId,
      name,
      prefix,
      hashedSecret,
      mode,
      scopes,
      createdById: c.userId,
    },
  });

  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "ApiKey",
    entityId: key.id,
    changes: { name, mode, scopes },
  });

  revalidatePath("/dashboard/shared-api");
  // Token penuh hanya dikembalikan sekali di sini.
  return { token, prefix };
}

export async function revokeApiKey(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const id = String(formData.get("id") ?? "");
  const key = await db.apiKey.findFirst({
    where: { id, tenantId: c.tenantId },
    select: { id: true, status: true },
  });
  if (!key || key.status === "REVOKED") return;

  await db.apiKey.update({ where: { id: key.id }, data: { status: "REVOKED" } });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "UPDATE",
    entity: "ApiKey",
    entityId: key.id,
    changes: { status: "REVOKED" },
  });
  revalidatePath("/dashboard/shared-api");
}

/** Daftarkan endpoint webhook baru (secret di-generate otomatis). */
export async function createWebhookEndpoint(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;

  const url = String(formData.get("url") ?? "").trim();
  const events = formData
    .getAll("events")
    .map((e) => String(e))
    .filter((e) => (WEBHOOK_EVENTS as readonly string[]).includes(e));
  if (!/^https?:\/\/.+/.test(url) || events.length === 0) return;

  const ep = await db.webhookEndpoint.create({
    data: {
      tenantId: c.tenantId,
      url,
      secret: generateWebhookSecret(),
      events,
      isActive: true,
    },
  });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "CREATE",
    entity: "WebhookEndpoint",
    entityId: ep.id,
    changes: { url, events },
  });
  revalidatePath("/dashboard/shared-api");
}

/** Aktif/nonaktifkan endpoint. */
export async function toggleWebhookEndpoint(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;
  const id = String(formData.get("id") ?? "");
  const ep = await db.webhookEndpoint.findFirst({
    where: { id, tenantId: c.tenantId },
    select: { id: true, isActive: true },
  });
  if (!ep) return;
  await db.webhookEndpoint.update({
    where: { id: ep.id },
    data: { isActive: !ep.isActive },
  });
  revalidatePath("/dashboard/shared-api");
}

/** Hapus endpoint (beserta riwayat pengirimannya via cascade). */
export async function deleteWebhookEndpoint(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;
  const id = String(formData.get("id") ?? "");
  const ep = await db.webhookEndpoint.findFirst({
    where: { id, tenantId: c.tenantId },
    select: { id: true },
  });
  if (!ep) return;
  await db.webhookEndpoint.delete({ where: { id: ep.id } });
  await writeAudit({
    tenantId: c.tenantId,
    userId: c.userId,
    action: "DELETE",
    entity: "WebhookEndpoint",
    entityId: ep.id,
  });
  revalidatePath("/dashboard/shared-api");
}

/** Kirim ulang satu pengiriman webhook (manual), dibatasi ke tenant aktif. */
export async function resendWebhookDelivery(formData: FormData): Promise<void> {
  const c = await ctx();
  if (!c) return;
  const id = String(formData.get("id") ?? "");
  const delivery = await db.webhookDelivery.findFirst({
    where: { id, endpoint: { tenantId: c.tenantId } },
    select: { id: true },
  });
  if (!delivery) return;
  await retryDelivery(delivery.id);
  revalidatePath("/dashboard/shared-api");
}
