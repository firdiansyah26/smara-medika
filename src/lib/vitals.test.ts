import { describe, it, expect } from "vitest";
import { interpretVitals } from "@/lib/vitals";

const codes = (v: Parameters<typeof interpretVitals>[0]) =>
  interpretVitals(v).map((a) => a.code);

describe("interpretVitals", () => {
  it("vital normal → tanpa peringatan", () => {
    expect(
      interpretVitals({
        systolic: 110,
        diastolic: 70,
        temperature: 36.8,
        heartRate: 80,
        respiratoryRate: 16,
        spo2: 98,
      }),
    ).toEqual([]);
  });

  it("krisis hipertensi", () => {
    const a = interpretVitals({ systolic: 185, diastolic: 121 });
    expect(a[0]).toEqual({ code: "bpCrisis", level: "crit" });
  });

  it("tekanan darah tinggi (warn)", () => {
    expect(codes({ systolic: 150, diastolic: 95 })).toContain("bpHigh");
  });

  it("demam tinggi → crit", () => {
    expect(interpretVitals({ temperature: 39 })).toEqual([
      { code: "tempFever", level: "crit" },
    ]);
  });

  it("SpO2 rendah kritis", () => {
    expect(codes({ spo2: 88 })).toContain("spo2Crit");
  });

  it("takikardia", () => {
    expect(codes({ heartRate: 110 })).toContain("hrHigh");
  });

  it("IMT obesitas dari berat & tinggi", () => {
    // 100kg / (1.6m)^2 ≈ 39 → obese
    expect(codes({ weight: 100, height: 160 })).toContain("bmiObese");
  });

  it("tanpa input → tanpa peringatan", () => {
    expect(interpretVitals({})).toEqual([]);
  });
});
