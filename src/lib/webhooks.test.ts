import { describe, it, expect } from "vitest";
import {
  signPayload,
  eventMatches,
  backoffDelayMs,
  generateWebhookSecret,
  deliveryHeaders,
  WEBHOOK_EVENTS,
} from "./webhooks";

describe("webhooks: signPayload", () => {
  it("HMAC-SHA256 deterministik & sensitif terhadap secret/body", () => {
    const a = signPayload("s3cr3t", '{"x":1}');
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(signPayload("s3cr3t", '{"x":1}')).toBe(a);
    expect(signPayload("other", '{"x":1}')).not.toBe(a);
    expect(signPayload("s3cr3t", '{"x":2}')).not.toBe(a);
  });
});

describe("webhooks: eventMatches", () => {
  it("cocok persis", () => {
    expect(eventMatches(["invoice.created"], "invoice.created")).toBe(true);
    expect(eventMatches(["invoice.created"], "encounter.created")).toBe(false);
  });
  it("wildcard total", () => {
    expect(eventMatches(["*"], "lab_result.ready")).toBe(true);
  });
  it("wildcard prefix", () => {
    expect(eventMatches(["invoice.*"], "invoice.created")).toBe(true);
    expect(eventMatches(["invoice.*"], "encounter.created")).toBe(false);
  });
  it("daftar kosong tidak cocok", () => {
    expect(eventMatches([], "invoice.created")).toBe(false);
  });
});

describe("webhooks: backoffDelayMs", () => {
  it("eksponensial dengan batas atas", () => {
    expect(backoffDelayMs(1)).toBe(1000);
    expect(backoffDelayMs(2)).toBe(2000);
    expect(backoffDelayMs(3)).toBe(4000);
    expect(backoffDelayMs(6)).toBe(32000);
    expect(backoffDelayMs(99)).toBe(32000); // dibatasi
  });
});

describe("webhooks: helpers", () => {
  it("secret berawalan whsec_ & unik", () => {
    const s = generateWebhookSecret();
    expect(s.startsWith("whsec_")).toBe(true);
    expect(generateWebhookSecret()).not.toBe(s);
  });
  it("header membawa signature & event", () => {
    const h = deliveryHeaders("abc", "invoice.created", "del_1");
    expect(h["x-smara-signature"]).toBe("sha256=abc");
    expect(h["x-smara-event"]).toBe("invoice.created");
    expect(h["x-smara-delivery"]).toBe("del_1");
  });
  it("daftar event berisi tiga event inti", () => {
    expect(WEBHOOK_EVENTS).toContain("encounter.created");
    expect(WEBHOOK_EVENTS).toContain("invoice.created");
    expect(WEBHOOK_EVENTS).toContain("lab_result.ready");
  });
});
