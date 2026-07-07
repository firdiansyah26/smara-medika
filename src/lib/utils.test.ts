import { describe, it, expect } from "vitest";
import { formatIDR, calcAge, calcAgeParts, cn } from "@/lib/utils";

describe("formatIDR", () => {
  it("format rupiah dengan pemisah ribuan", () => {
    expect(formatIDR(150000)).toBe("Rp 150.000");
    expect(formatIDR(0)).toBe("Rp 0");
    expect(formatIDR(1500)).toBe("Rp 1.500");
  });
});

describe("calcAge", () => {
  const now = new Date("2026-06-24");
  it("menghitung umur tahun penuh", () => {
    expect(calcAge(new Date("2000-06-24"), now)).toBe(26);
  });
  it("belum ulang tahun → kurang satu", () => {
    expect(calcAge(new Date("2000-06-25"), now)).toBe(25);
  });
});

describe("calcAgeParts", () => {
  it("tahun/bulan/hari tepat", () => {
    const now = new Date("2026-06-24");
    expect(calcAgeParts(new Date("2000-06-24"), now)).toEqual({
      years: 26,
      months: 0,
      days: 0,
    });
  });
  it("hitung selisih bulan & hari", () => {
    const now = new Date("2026-06-24");
    expect(calcAgeParts(new Date("2026-04-10"), now)).toEqual({
      years: 0,
      months: 2,
      days: 14,
    });
  });
});

describe("cn", () => {
  it("menggabung & mengatasi konflik Tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-ink", false && "hidden", "font-bold")).toBe(
      "text-ink font-bold",
    );
  });
});
