import crypto from "crypto";

/** Buat token reset acak + hash SHA-256 (yang disimpan adalah hash-nya). */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

/** Hash token mentah untuk pencocokan dengan yang tersimpan. */
export function hashResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
