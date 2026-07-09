import type { TeleconsultStatus } from "@prisma/client";

/** Sesi bisa dimulai (SCHEDULED → ONGOING) hanya saat masih terjadwal. */
export function canStart(status: TeleconsultStatus): boolean {
  return status === "SCHEDULED";
}

/** Sesi bisa diakhiri (ONGOING → ENDED) hanya saat berlangsung. */
export function canEnd(status: TeleconsultStatus): boolean {
  return status === "ONGOING";
}

/** Sesi bisa dibatalkan hanya sebelum dimulai. */
export function canCancel(status: TeleconsultStatus): boolean {
  return status === "SCHEDULED";
}

/** Peserta boleh bergabung ke ruang saat terjadwal atau berlangsung. */
export function canJoin(status: TeleconsultStatus): boolean {
  return status === "SCHEDULED" || status === "ONGOING";
}

/** Kode ruang unik 8 karakter alfanumerik (tanpa karakter ambigu). */
export function makeRoomCode(seed: string): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  // Hash sederhana deterministik dari seed (cuid + waktu dilewatkan pemanggil).
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = 0; i < 8; i++) {
    out += alphabet[h % alphabet.length];
    h = Math.floor(h / alphabet.length) + seed.charCodeAt(i % seed.length) * 7;
  }
  return out;
}
