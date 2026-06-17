import { db } from "@/lib/db";

// PLACEHOLDER: hingga Auth.js & tenant switcher asli disiapkan, kita pakai
// tenant pertama (berdasarkan urutan dibuat) sebagai "tenant aktif".
// Nanti diganti dengan tenant dari sesi user.
export async function getActiveTenant() {
  return db.tenant.findFirst({ orderBy: { createdAt: "asc" } });
}
