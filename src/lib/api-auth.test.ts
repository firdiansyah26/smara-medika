import { describe, it, expect } from "vitest";
import { generateApiKey, extractToken, API_SCOPES } from "@/lib/api-auth";

describe("generateApiKey", () => {
  it("prefix sesuai mode & token = prefix.secret", () => {
    const live = generateApiKey("LIVE");
    expect(live.prefix.startsWith("smk_live_")).toBe(true);
    expect(live.token.startsWith(live.prefix + ".")).toBe(true);
    expect(live.hashedSecret).toMatch(/^[a-f0-9]{64}$/);

    const test = generateApiKey("TEST");
    expect(test.prefix.startsWith("smk_test_")).toBe(true);
  });

  it("setiap key unik", () => {
    expect(generateApiKey("LIVE").token).not.toBe(generateApiKey("LIVE").token);
  });
});

describe("extractToken", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://x/api/v1/me", { headers });

  it("ambil dari Authorization: Bearer", () => {
    expect(extractToken(req({ authorization: "Bearer abc.def" }))).toBe(
      "abc.def",
    );
  });
  it("ambil dari X-API-Key", () => {
    expect(extractToken(req({ "x-api-key": "xyz.123" }))).toBe("xyz.123");
  });
  it("null bila tak ada header", () => {
    expect(extractToken(req({}))).toBeNull();
  });
});

describe("API_SCOPES", () => {
  it("mencakup scope inti", () => {
    expect(API_SCOPES).toContain("patients:read");
    expect(API_SCOPES).toContain("encounters:read");
  });
});
