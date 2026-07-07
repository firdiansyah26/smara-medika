import { describe, it, expect } from "vitest";
import {
  isAllowedMime,
  isImageMime,
  formatBytes,
  MAX_ATTACHMENT_BYTES,
} from "@/lib/attachments";

describe("isAllowedMime", () => {
  it("izinkan gambar & PDF", () => {
    expect(isAllowedMime("image/png")).toBe(true);
    expect(isAllowedMime("image/jpeg")).toBe(true);
    expect(isAllowedMime("application/pdf")).toBe(true);
  });
  it("tolak tipe lain", () => {
    expect(isAllowedMime("text/html")).toBe(false);
    expect(isAllowedMime("application/zip")).toBe(false);
  });
});

describe("isImageMime", () => {
  it("hanya image/*", () => {
    expect(isImageMime("image/webp")).toBe(true);
    expect(isImageMime("application/pdf")).toBe(false);
  });
});

describe("formatBytes", () => {
  it("B / KB / MB", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });
});

describe("MAX_ATTACHMENT_BYTES", () => {
  it("batas 2 MB", () => {
    expect(MAX_ATTACHMENT_BYTES).toBe(2 * 1024 * 1024);
  });
});
