import { describe, it, expect } from "vitest";
import type { TeleconsultStatus } from "@prisma/client";
import {
  canStart,
  canEnd,
  canCancel,
  canJoin,
  makeRoomCode,
} from "./teleconsult-flow";

const ALL: TeleconsultStatus[] = ["SCHEDULED", "ONGOING", "ENDED", "CANCELLED"];

describe("teleconsult-flow: guard transisi", () => {
  it("start hanya dari SCHEDULED", () => {
    expect(canStart("SCHEDULED")).toBe(true);
    for (const s of ALL.filter((x) => x !== "SCHEDULED")) {
      expect(canStart(s)).toBe(false);
    }
  });

  it("end hanya dari ONGOING", () => {
    expect(canEnd("ONGOING")).toBe(true);
    for (const s of ALL.filter((x) => x !== "ONGOING")) {
      expect(canEnd(s)).toBe(false);
    }
  });

  it("cancel hanya dari SCHEDULED", () => {
    expect(canCancel("SCHEDULED")).toBe(true);
    for (const s of ALL.filter((x) => x !== "SCHEDULED")) {
      expect(canCancel(s)).toBe(false);
    }
  });

  it("join saat SCHEDULED atau ONGOING", () => {
    expect(canJoin("SCHEDULED")).toBe(true);
    expect(canJoin("ONGOING")).toBe(true);
    expect(canJoin("ENDED")).toBe(false);
    expect(canJoin("CANCELLED")).toBe(false);
  });
});

describe("teleconsult-flow: makeRoomCode", () => {
  it("panjang 8 dan hanya karakter tak-ambigu", () => {
    const code = makeRoomCode("abc123def456");
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/);
  });

  it("deterministik untuk seed sama", () => {
    expect(makeRoomCode("seed-x")).toBe(makeRoomCode("seed-x"));
  });

  it("berbeda untuk seed berbeda", () => {
    expect(makeRoomCode("seed-a")).not.toBe(makeRoomCode("seed-b"));
  });
});
