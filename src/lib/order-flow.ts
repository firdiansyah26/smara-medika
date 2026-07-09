import type { OrderStatus } from "@prisma/client";

/** Urutan proses transfer obat oleh penyedia (supplier). */
export const SUPPLIER_FLOW: OrderStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
];

/** Status berikutnya dalam alur penyedia, atau null bila sudah akhir/di luar alur. */
export function nextStatus(cur: OrderStatus): OrderStatus | null {
  const i = SUPPLIER_FLOW.indexOf(cur);
  return i >= 0 && i < SUPPLIER_FLOW.length - 1 ? SUPPLIER_FLOW[i + 1] : null;
}

/** Stok penyedia dikurangi tepat saat transisi ke SHIPPED. */
export function decrementsStockOnTransition(next: OrderStatus): boolean {
  return next === "SHIPPED";
}

/** Status yang masih boleh dibatalkan oleh pemohon. */
export const CANCELLABLE: OrderStatus[] = ["REQUESTED", "CONFIRMED", "PREPARING"];

export function canCancel(status: OrderStatus): boolean {
  return CANCELLABLE.includes(status);
}

/** Penyedia hanya boleh menolak saat masih REQUESTED. */
export function canReject(status: OrderStatus): boolean {
  return status === "REQUESTED";
}

/** Pemohon menerima (stok bertambah) hanya saat DELIVERED. */
export function canReceive(status: OrderStatus): boolean {
  return status === "DELIVERED";
}
