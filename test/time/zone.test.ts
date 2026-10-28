import { describe, expect, test } from "bun:test";
import { localParts, parseInstant, TimeError, toLocalSlot } from "../../src/time/zone.ts";

const AMS = "Europe/Amsterdam";

describe("parseInstant", () => {
  test("accepts UTC ISO 8601 instants", () => {
    expect(parseInstant("2026-11-18T08:00:00Z").toISOString()).toBe("2026-11-18T08:00:00.000Z");
    expect(parseInstant("2026-11-18T08:00Z").getUTCHours()).toBe(8);
  });

  test("rejects offsets and local wall-clock strings", () => {
    expect(() => parseInstant("2026-11-18T09:00:00+01:00")).toThrow(TimeError);
    expect(() => parseInstant("2026-11-18T09:00:00")).toThrow(TimeError);
    expect(() => parseInstant("18 Nov 2026 09:00")).toThrow(TimeError);
  });

  test("rejects impossible dates", () => {
    expect(() => parseInstant("2026-13-40T09:00:00Z")).toThrow(TimeError);
  });
});

describe("localParts", () => {
  test("renders winter time (UTC+1) in the event time zone", () => {
    expect(localParts("2026-11-18T08:00:00Z", AMS)).toEqual({
      date: "2026-11-18",
      time: "09:00",
      minutesOfDay: 540,
    });
  });

  test("renders summer time (UTC+2) after the DST switch", () => {
    expect(localParts("2026-06-10T08:00:00Z", AMS).time).toBe("10:00");
  });

  test("uses the local calendar date, not the UTC date", () => {
    expect(localParts("2026-11-18T23:30:00Z", AMS).date).toBe("2026-11-19");
  });
});

describe("toLocalSlot", () => {
  test("renders a daytime session with its duration", () => {
    expect(toLocalSlot("2026-11-18T08:00:00Z", "2026-11-18T08:45:00Z", AMS)).toEqual({
      date: "2026-11-18",
      start: "09:00",
      end: "09:45",
      durationMinutes: 45,
    });
  });
});
