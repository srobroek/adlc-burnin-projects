import { describe, expect, test } from "bun:test";
import type { Session } from "../../src/domain.ts";
import { findClashes } from "../../src/schedule/clash.ts";

const aSession = (id: string, startsAt: string, endsAt: string): Session => ({
  id,
  title: id,
  trackSlug: "main",
  speakerIds: [],
  room: "Room A",
  startsAt,
  endsAt,
});

describe("findClashes", () => {
  test("reports overlapping sessions with the overlap in minutes", () => {
    const a = aSession("a", "2026-11-18T09:00:00Z", "2026-11-18T10:00:00Z");
    const b = aSession("b", "2026-11-18T09:30:00Z", "2026-11-18T10:30:00Z");
    expect(findClashes([a, b])).toEqual([{ first: "a", second: "b", overlapMinutes: 30 }]);
  });

  test("ignores sessions that are apart", () => {
    const a = aSession("a", "2026-11-18T09:00:00Z", "2026-11-18T10:00:00Z");
    const b = aSession("b", "2026-11-18T11:00:00Z", "2026-11-18T12:00:00Z");
    expect(findClashes([a, b])).toEqual([]);
  });

  test("treats back-to-back sessions as clashing (current rule)", () => {
    const a = aSession("a", "2026-11-18T09:00:00Z", "2026-11-18T10:00:00Z");
    const b = aSession("b", "2026-11-18T10:00:00Z", "2026-11-18T11:00:00Z");
    expect(findClashes([a, b])).toEqual([{ first: "a", second: "b", overlapMinutes: 0 }]);
  });

  test("checks every pair", () => {
    const a = aSession("a", "2026-11-18T09:00:00Z", "2026-11-18T12:00:00Z");
    const b = aSession("b", "2026-11-18T09:30:00Z", "2026-11-18T09:45:00Z");
    const c = aSession("c", "2026-11-18T11:00:00Z", "2026-11-18T11:30:00Z");
    expect(findClashes([a, b, c]).map((x) => `${x.first}-${x.second}`)).toEqual(["a-b", "a-c"]);
  });
});
