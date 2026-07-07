import { describe, it, expect } from "vitest";
import {
  formatTicketCode,
  serviceByType,
  serviceByCounter,
} from "@/lib/queue";

describe("formatTicketCode", () => {
  it("BPJS → A dengan padding 4 digit", () => {
    expect(formatTicketCode("BPJS", 1)).toBe("A0001");
    expect(formatTicketCode("BPJS", 42)).toBe("A0042");
  });
  it("Asuransi → PA, Umum → U", () => {
    expect(formatTicketCode("ASURANSI", 12)).toBe("PA0012");
    expect(formatTicketCode("UMUM", 7)).toBe("U0007");
  });
});

describe("serviceByType / serviceByCounter", () => {
  it("prefix per layanan", () => {
    expect(serviceByType("BPJS").prefix).toBe("A");
    expect(serviceByType("ASURANSI").prefix).toBe("PA");
  });
  it("counter dipetakan ke layanan yang benar", () => {
    expect(serviceByCounter("A2")?.type).toBe("BPJS");
    expect(serviceByCounter("PA1")?.type).toBe("ASURANSI");
    expect(serviceByCounter("ZZ9")).toBeUndefined();
  });
});
