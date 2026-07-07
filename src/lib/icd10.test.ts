import { describe, it, expect } from "vitest";
import { searchIcd10 } from "@/lib/icd10";

describe("searchIcd10", () => {
  it("query kosong → daftar awal (dibatasi limit)", () => {
    const r = searchIcd10("", 5);
    expect(r.length).toBe(5);
  });

  it("cari berdasarkan kode", () => {
    const r = searchIcd10("J06");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => /j06/i.test(c.code) || /j06/i.test(c.name))).toBe(
      true,
    );
  });

  it("cari berdasarkan nama (case-insensitive)", () => {
    const r = searchIcd10("demam");
    expect(r.some((c) => /demam/i.test(c.name))).toBe(true);
  });

  it("hormati limit", () => {
    expect(searchIcd10("a", 3).length).toBeLessThanOrEqual(3);
  });
});
