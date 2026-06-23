import type { AttachmentEntity } from "@prisma/client";

/** Tipe file yang diizinkan untuk lampiran. */
export const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

/** Batas ukuran per file — disimpan di DB, jaga tetap kecil. */
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB

export const ATTACHMENT_ENTITIES: AttachmentEntity[] = [
  "DRUG",
  "PATIENT",
  "ENCOUNTER",
  "LAB_ORDER",
  "INVOICE",
  "OTHER",
];

export function isAllowedMime(mime: string): boolean {
  return (ALLOWED_MIME as readonly string[]).includes(mime);
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
