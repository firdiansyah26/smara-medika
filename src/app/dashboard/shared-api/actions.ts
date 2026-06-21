"use server";

import { revalidatePath } from "next/cache";
import type { Role, ApiKeyMode } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getActiveTenant } from "@/lib/tenant-context";
import { writeAudit } from "@/lib/audit";
import { generateApiKey, API_SCOPES, type ApiScope } from "@/lib/api-auth";

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
