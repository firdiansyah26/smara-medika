import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "SmaraMedika <onboarding@resend.dev>";

/** True jika layanan email aktif (RESEND_API_KEY terpasang). */
export function isEmailEnabled(): boolean {
  return !!apiKey;
}

/** URL publik dasar untuk tautan absolut di email. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  );
}

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!apiKey) return null;
  client ??= new Resend(apiKey);
  return client;
}

export type SendResult = {
  ok: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
};

/** Kirim email via Resend. Mengembalikan {skipped:true} bila email tidak aktif. */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string }[];
}): Promise<SendResult> {
  const c = getClient();
  if (!c) return { ok: false, skipped: true };
  try {
    const { data, error } = await c.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send_failed" };
  }
}

/** Bungkus konten dengan layout email berbrand SmaraMedika. */
function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    <div style="text-align:center;padding:8px 0 20px">
      <span style="font-size:20px;font-weight:700;color:#0d9488">Smara<span style="color:#0f172a">Medika</span></span>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
      <h1 style="margin:0 0 12px;font-size:18px">${title}</h1>
      ${body}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">© ${new Date().getFullYear()} SmaraMedika — Platform Rekam Medis Elektronik</p>
  </div></body></html>`;
}

/** Template email reset kata sandi. */
export function passwordResetEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Atur ulang kata sandi SmaraMedika";
  const html = layout(
    "Atur ulang kata sandi",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569">Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah untuk membuat kata sandi baru. Tautan berlaku <b>1 jam</b>.</p>
     <p style="text-align:center;margin:24px 0">
       <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px">Atur ulang kata sandi</a>
     </p>
     <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">Jika tombol tidak berfungsi, salin tautan ini: <br><span style="color:#0d9488;word-break:break-all">${resetUrl}</span></p>
     <p style="margin:16px 0 0;font-size:12px;color:#94a3b8">Abaikan email ini jika Anda tidak meminta perubahan kata sandi.</p>`,
  );
  const text = `Atur ulang kata sandi SmaraMedika.\n\nBuka tautan berikut (berlaku 1 jam):\n${resetUrl}\n\nAbaikan jika Anda tidak meminta perubahan.`;
  return { subject, html, text };
}

/** Template email pengiriman invoice (PDF terlampir). */
export function invoiceEmail(opts: {
  facilityName: string;
  invoiceNumber: string;
  patientName: string;
}): { subject: string; html: string; text: string } {
  const subject = `Invoice ${opts.invoiceNumber} — ${opts.facilityName}`;
  const html = layout(
    "Invoice Anda",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569">Halo <b>${opts.patientName}</b>, berikut kami lampirkan invoice <b>${opts.invoiceNumber}</b> dari <b>${opts.facilityName}</b> dalam format PDF.</p>
     <p style="margin:0;font-size:12px;color:#94a3b8">Terima kasih telah menggunakan layanan kami.</p>`,
  );
  const text = `Halo ${opts.patientName}, terlampir invoice ${opts.invoiceNumber} dari ${opts.facilityName} (PDF).`;
  return { subject, html, text };
}

/** Template email pengingat janji temu. */
export function appointmentReminderEmail(opts: {
  facilityName: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string; // sudah diformat
}): { subject: string; html: string; text: string } {
  const subject = `Pengingat janji temu — ${opts.facilityName}`;
  const html = layout(
    "Pengingat Janji Temu",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569">Halo <b>${opts.patientName}</b>, ini pengingat janji temu Anda di <b>${opts.facilityName}</b>.</p>
     <p style="margin:0 0 4px;font-size:14px"><b>Dokter:</b> ${opts.doctorName}</p>
     <p style="margin:0;font-size:14px"><b>Waktu:</b> ${opts.scheduledAt}</p>
     <p style="margin:16px 0 0;font-size:12px;color:#94a3b8">Mohon datang tepat waktu. Jika berhalangan, silakan hubungi fasilitas kami.</p>`,
  );
  const text = `Pengingat janji temu di ${opts.facilityName}.\nDokter: ${opts.doctorName}\nWaktu: ${opts.scheduledAt}`;
  return { subject, html, text };
}

/** Template email hasil lab/radiologi siap. */
export function labResultReadyEmail(opts: {
  facilityName: string;
  patientName: string;
  orderNumber: string;
  categoryLabel: string;
}): { subject: string; html: string; text: string } {
  const subject = `Hasil ${opts.categoryLabel} siap — ${opts.facilityName}`;
  const html = layout(
    "Hasil Pemeriksaan Siap",
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569">Halo <b>${opts.patientName}</b>, hasil pemeriksaan <b>${opts.categoryLabel}</b> Anda (${opts.orderNumber}) di <b>${opts.facilityName}</b> telah selesai.</p>
     <p style="margin:0;font-size:12px;color:#94a3b8">Silakan hubungi atau kunjungi fasilitas kami untuk mendapatkan hasilnya.</p>`,
  );
  const text = `Hasil ${opts.categoryLabel} (${opts.orderNumber}) di ${opts.facilityName} telah selesai. Silakan hubungi fasilitas kami.`;
  return { subject, html, text };
}
