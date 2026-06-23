"use server";

import { db } from "@/lib/db";
import { generateResetToken } from "@/lib/reset-token";
import { writeAudit } from "@/lib/audit";
import {
  isEmailEnabled,
  sendEmail,
  siteUrl,
  passwordResetEmail,
} from "@/lib/email";

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

  const resetUrl = `${siteUrl()}/reset-password?token=${raw}`;

  // Mode dev (tanpa RESEND_API_KEY): tampilkan tautan di layar.
  if (!isEmailEnabled()) {
    return { sent: true, devUrl: `/reset-password?token=${raw}` };
  }

  // Produksi: kirim email reset. Respons tetap generik (anti-enumeration).
  const tmpl = passwordResetEmail(resetUrl);
  const res = await sendEmail({
    to: user.email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
  });
  if (!res.ok) {
    console.error("[reset-password] gagal kirim email:", res.error);
  }
  return { sent: true };
}
