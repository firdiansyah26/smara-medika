"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashResetToken } from "@/lib/reset-token";
import { writeAudit } from "@/lib/audit";

export type ResetState = {
  error?: "invalid" | "expired" | "weak" | "mismatch";
};

export async function resetPassword(
  _prev: ResetState | undefined,
  formData: FormData,
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "invalid" };
  if (password.length < 8) return { error: "weak" };
  if (password !== confirm) return { error: "mismatch" };

  const rec = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    return { error: "expired" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { password: hashed } }),
    db.passwordResetToken.update({
      where: { id: rec.id },
      data: { usedAt: new Date() },
    }),
    // Hapus token lain milik user ini.
    db.passwordResetToken.deleteMany({
      where: { userId: rec.userId, id: { not: rec.id } },
    }),
  ]);

  await writeAudit({
    userId: rec.userId,
    action: "UPDATE",
    entity: "User",
    entityId: rec.userId,
    changes: { passwordReset: true },
  });

  redirect("/login?reset=1");
}
