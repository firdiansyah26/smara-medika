// Interpretasi tanda vital dewasa (referensi umum; pediatrik berbeda — MVP).
// Mengembalikan daftar peringatan untuk nilai di luar rentang normal.

export type VitalLevel = "warn" | "crit";
export type VitalAlertCode =
  | "bpLow"
  | "bpElevated"
  | "bpHigh"
  | "bpCrisis"
  | "tempLow"
  | "tempFever"
  | "hrLow"
  | "hrHigh"
  | "rrLow"
  | "rrHigh"
  | "spo2Low"
  | "spo2Crit"
  | "bmiUnder"
  | "bmiOver"
  | "bmiObese";

export type VitalAlert = { code: VitalAlertCode; level: VitalLevel };

export type VitalInput = {
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
};

const num = (v?: number) => typeof v === "number" && !Number.isNaN(v);

export function interpretVitals(v: VitalInput): VitalAlert[] {
  const alerts: VitalAlert[] = [];

  // Tekanan darah (AHA)
  const sys = v.systolic;
  const dia = v.diastolic;
  if (num(sys) || num(dia)) {
    if ((sys ?? 0) >= 180 || (dia ?? 0) >= 120) {
      alerts.push({ code: "bpCrisis", level: "crit" });
    } else if ((sys ?? 0) >= 140 || (dia ?? 0) >= 90) {
      alerts.push({ code: "bpHigh", level: "warn" });
    } else if ((sys ?? 0) >= 120 || (dia ?? 0) >= 80) {
      alerts.push({ code: "bpElevated", level: "warn" });
    } else if ((num(sys) && (sys as number) < 90) || (num(dia) && (dia as number) < 60)) {
      alerts.push({ code: "bpLow", level: "warn" });
    }
  }

  // Suhu (°C)
  if (num(v.temperature)) {
    const t = v.temperature as number;
    if (t < 35 || t >= 39) alerts.push({ code: t < 35 ? "tempLow" : "tempFever", level: "crit" });
    else if (t >= 37.6) alerts.push({ code: "tempFever", level: "warn" });
    else if (t < 36) alerts.push({ code: "tempLow", level: "warn" });
  }

  // Nadi (x/mnt)
  if (num(v.heartRate)) {
    const hr = v.heartRate as number;
    if (hr > 100) alerts.push({ code: "hrHigh", level: "warn" });
    else if (hr < 60) alerts.push({ code: "hrLow", level: "warn" });
  }

  // Laju napas (x/mnt)
  if (num(v.respiratoryRate)) {
    const rr = v.respiratoryRate as number;
    if (rr > 20) alerts.push({ code: "rrHigh", level: "warn" });
    else if (rr < 12) alerts.push({ code: "rrLow", level: "warn" });
  }

  // SpO2 (%)
  if (num(v.spo2)) {
    const s = v.spo2 as number;
    if (s < 91) alerts.push({ code: "spo2Crit", level: "crit" });
    else if (s < 95) alerts.push({ code: "spo2Low", level: "warn" });
  }

  // IMT (BMI) dari berat & tinggi
  if (num(v.weight) && num(v.height) && (v.height as number) > 0) {
    const bmi = (v.weight as number) / Math.pow((v.height as number) / 100, 2);
    if (bmi < 18.5) alerts.push({ code: "bmiUnder", level: "warn" });
    else if (bmi >= 30) alerts.push({ code: "bmiObese", level: "warn" });
    else if (bmi >= 25) alerts.push({ code: "bmiOver", level: "warn" });
  }

  return alerts;
}
