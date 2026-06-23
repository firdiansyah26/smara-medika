"use server";

import { db } from "@/lib/db";
import { generateResetToken } from "@/lib/reset-token";
import { writeAudit } from "@/lib/audit";

export type ForgotState = { sent?: boolean; devUrl?: string; error?: boolean };

export async function requestPasswordReset(
  _prev: ForgotState | undefined,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: true };

  const user = await db.user.findUnique({ where: { email } });
  // Respons generik agar tidak membocorkan keberadaan email.
  if (!user || !user.isActive) return { sent: true };

  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  // Batalkan token lama yang belum dipakai.
  await db.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });
  await db.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt },
  });

  await writeAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "User",
    entityId: user.id,
    changes: { passwordResetRequested: true },
  });

  // Mode dev: tampilkan tautan (tanpa layanan email).
  return { sent: true, devUrl: `/reset-password?token=${raw}` };
}
