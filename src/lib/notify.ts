import type { NotificationType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export type NotifyResult = { status: "SENT" | "FAILED" | "SKIPPED" };

/**
 * Kirim notifikasi email + catat ke tabel Notification.
 * Jika penerima kosong atau email dinonaktifkan → status SKIPPED (tetap dicatat).
 */
export async function notifyEmail(opts: {
  tenantId: string;
  type: NotificationType;
  to: string | null | undefined;
  subject: string;
  html: string;
  text?: string;
  relatedType?: string;
  relatedId?: string;
  createdById?: string;
}): Promise<NotifyResult> {
  const base = {
    tenantId: opts.tenantId,
    type: opts.type,
    subject: opts.subject,
    relatedType: opts.relatedType ?? null,
    relatedId: opts.relatedId ?? null,
    createdById: opts.createdById ?? null,
  };

  if (!opts.to) {
    await db.notification.create({
      data: { ...base, recipient: "—", status: "SKIPPED", error: "no_recipient" },
    });
    return { status: "SKIPPED" };
  }

  const res = await sendEmail({
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  const status = res.skipped ? "SKIPPED" : res.ok ? "SENT" : "FAILED";
  await db.notification.create({
    data: {
      ...base,
      recipient: opts.to,
      status,
      error: res.error ?? (res.skipped ? "email_disabled" : null),
    },
  });
  return { status };
}
