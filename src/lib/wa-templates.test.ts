import { describe, it, expect } from "vitest";
import {
  renderTemplate,
  normalizePhoneID,
  waLink,
  DEFAULT_WA_TEMPLATES,
  WA_PURPOSES,
} from "./wa-templates";

describe("wa-templates: renderTemplate", () => {
  it("mengisi placeholder yang dikenal", () => {
    const out = renderTemplate("Halo {patient} di {facility}", {
      patient: "Andi",
      facility: "Klinik Sehat",
    });
    expect(out).toBe("Halo Andi di Klinik Sehat");
  });

  it("placeholder tanpa nilai jadi kosong", () => {
    expect(renderTemplate("Hai {patient}{doctor}", { patient: "Budi" })).toBe(
      "Hai Budi",
    );
  });

  it("template bawaan tersedia untuk semua keperluan", () => {
    for (const p of WA_PURPOSES) {
      expect(DEFAULT_WA_TEMPLATES[p]).toBeTruthy();
    }
  });
});

describe("wa-templates: normalizePhoneID", () => {
  it("08xx menjadi 62xx", () => {
    expect(normalizePhoneID("0812-3456-7890")).toBe("6281234567890");
  });
  it("+62 dipertahankan tanpa plus", () => {
    expect(normalizePhoneID("+62 812 3456 7890")).toBe("6281234567890");
  });
  it("awalan 8 diberi 62", () => {
    expect(normalizePhoneID("81234567890")).toBe("6281234567890");
  });
  it("tanpa digit -> null", () => {
    expect(normalizePhoneID("abc")).toBeNull();
  });
});

describe("wa-templates: waLink", () => {
  it("membangun tautan wa.me terenkode", () => {
    const link = waLink("08123456789", "Halo dunia & selamat");
    expect(link).toBe(
      "https://wa.me/628123456789?text=Halo%20dunia%20%26%20selamat",
    );
  });
  it("nomor tak valid -> null", () => {
    expect(waLink("", "x")).toBeNull();
  });
});
