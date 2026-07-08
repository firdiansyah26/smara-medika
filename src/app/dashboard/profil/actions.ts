"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { writeAudit } from "@/lib/audit";

export type ChangePasswordState = {
  ok?: boolean;
  error?: "notAuth" | "wrongCurrent" | "weak" | "mismatch";
};

export async function changePassword(
  _prev: ChangePasswordState | undefined,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "notAuth" };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 8) return { error: "weak" };
  if (next !== confirm) return { error: "mismatch" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "notAuth" };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "wrongCurrent" };

  await db.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(next, 10) },
  });
  await writeAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "User",
    entityId: user.id,
    changes: { passwordChanged: true },
  });
  revalidatePath("/dashboard/profil");
  return { ok: true };
}
