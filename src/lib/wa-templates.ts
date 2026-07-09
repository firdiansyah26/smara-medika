import type { NotificationType } from "@prisma/client";

/** Keperluan pesan WhatsApp = tipe notifikasi. */
export const WA_PURPOSES: NotificationType[] = [
  "APPOINTMENT_REMINDER",
  "LAB_RESULT_READY",
  "INVOICE",
  "GENERAL",
];

export const WA_PURPOSE_LABEL: Record<NotificationType, string> = {
  APPOINTMENT_REMINDER: "Pengingat Janji Temu",
  LAB_RESULT_READY: "Hasil Lab Siap",
  INVOICE: "Tagihan",
  GENERAL: "Umum",
};

/** Placeholder yang dikenali renderer. */
export const WA_PLACEHOLDERS = [
  "patient",
  "facility",
  "doctor",
  "datetime",
  "amount",
  "invoice",
] as const;

export type WaVars = Partial<Record<(typeof WA_PLACEHOLDERS)[number], string>>;

/** Template bawaan per keperluan (dipakai bila tenant belum menyimpan custom). */
export const DEFAULT_WA_TEMPLATES: Record<NotificationType, string> = {
  APPOINTMENT_REMINDER:
    "Halo {patient}, mengingatkan janji temu Anda di {facility} bersama {doctor} pada {datetime}. Mohon hadir tepat waktu. Terima kasih.",
  LAB_RESULT_READY:
    "Halo {patient}, hasil pemeriksaan lab Anda di {facility} sudah siap. Silakan menghubungi kami untuk pengambilan hasil. Terima kasih.",
  INVOICE:
    "Halo {patient}, tagihan {invoice} Anda di {facility} sebesar {amount} telah diterbitkan. Terima kasih.",
  GENERAL: "Halo {patient}, ada informasi dari {facility}. Terima kasih.",
};

/**
 * Isi placeholder `{key}` dengan nilai dari `vars`. Placeholder tanpa nilai
 * dibiarkan kosong agar pesan tetap rapi.
 */
export function renderTemplate(body: string, vars: WaVars): string {
  return body.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key as keyof WaVars];
    return v ?? "";
  });
}

/**
 * Normalisasi nomor Indonesia ke format internasional tanpa tanda plus.
 * "0812-3456-7890" -> "6281234567890", "+62812..." -> "62812...".
 * Mengembalikan null bila tidak ada digit.
 */
export function normalizePhoneID(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

/** Bangun tautan klik-untuk-chat wa.me. Null bila nomor tak valid. */
export function waLink(phone: string, message: string): string | null {
  const normalized = normalizePhoneID(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
