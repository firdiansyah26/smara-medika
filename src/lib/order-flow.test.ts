import { describe, it, expect } from "vitest";
import type { OrderStatus } from "@prisma/client";
import {
  SUPPLIER_FLOW,
  nextStatus,
  decrementsStockOnTransition,
  canCancel,
  canReject,
  canReceive,
} from "./order-flow";

describe("order-flow: nextStatus", () => {
  it("mengikuti urutan penyedia satu langkah", () => {
    expect(nextStatus("REQUESTED")).toBe("CONFIRMED");
    expect(nextStatus("CONFIRMED")).toBe("PREPARING");
    expect(nextStatus("PREPARING")).toBe("SHIPPED");
    expect(nextStatus("SHIPPED")).toBe("IN_TRANSIT");
    expect(nextStatus("IN_TRANSIT")).toBe("DELIVERED");
  });

  it("DELIVERED adalah akhir alur penyedia", () => {
    expect(nextStatus("DELIVERED")).toBeNull();
  });

  it("status terminal/di luar alur tidak bisa maju", () => {
    for (const s of ["RECEIVED", "REJECTED", "CANCELLED"] as OrderStatus[]) {
      expect(nextStatus(s)).toBeNull();
    }
  });
});

describe("order-flow: efek samping stok", () => {
  it("hanya SHIPPED yang memicu pengurangan stok penyedia", () => {
    expect(decrementsStockOnTransition("SHIPPED")).toBe(true);
    for (const s of SUPPLIER_FLOW.filter((x) => x !== "SHIPPED")) {
      expect(decrementsStockOnTransition(s)).toBe(false);
    }
  });
});

describe("order-flow: guard transisi", () => {
  it("cancel hanya sebelum dikirim", () => {
    expect(canCancel("REQUESTED")).toBe(true);
    expect(canCancel("CONFIRMED")).toBe(true);
    expect(canCancel("PREPARING")).toBe(true);
    for (const s of ["SHIPPED", "IN_TRANSIT", "DELIVERED", "RECEIVED"] as OrderStatus[]) {
      expect(canCancel(s)).toBe(false);
    }
  });

  it("reject hanya saat REQUESTED", () => {
    expect(canReject("REQUESTED")).toBe(true);
    for (const s of ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] as OrderStatus[]) {
      expect(canReject(s)).toBe(false);
    }
  });

  it("receive hanya saat DELIVERED", () => {
    expect(canReceive("DELIVERED")).toBe(true);
    for (const s of ["REQUESTED", "SHIPPED", "IN_TRANSIT", "RECEIVED"] as OrderStatus[]) {
      expect(canReceive(s)).toBe(false);
    }
  });
});
