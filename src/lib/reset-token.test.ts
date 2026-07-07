import { describe, it, expect } from "vitest";
import { generateResetToken, hashResetToken } from "@/lib/reset-token";

describe("reset-token", () => {
  it("hash dari raw konsisten & raw ≠ hash", () => {
    const { raw, hash } = generateResetToken();
    expect(hashResetToken(raw)).toBe(hash);
    expect(raw).not.toBe(hash);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("token acak berbeda tiap panggilan", () => {
    expect(generateResetToken().raw).not.toBe(generateResetToken().raw);
  });
});
