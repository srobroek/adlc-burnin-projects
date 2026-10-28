import { afterAll, describe, expect, test } from "bun:test";
import { startApp } from "../support/app.ts";

const app = startApp();
afterAll(() => app.stop());

interface SessionBody {
  id: string;
  trackSlug: string;
  startsAt: string;
  local: { date: string; start: string; end: string };
}

describe("GET /event", () => {
  test("exposes the event time zone", async () => {
    const body = (await (await app.get("/event")).json()) as { timeZone: string };
    expect(body.timeZone).toBe("Europe/Amsterdam");
  });
});

describe("GET /tracks", () => {
  test("lists every track", async () => {
    const body = (await (await app.get("/tracks")).json()) as { slug: string }[];
    expect(body.map((t) => t.slug)).toEqual(["main", "agents", "platform"]);
  });
});

describe("GET /sessions", () => {
  test("lists sessions in start order with local wall-clock times", async () => {
    const body = (await (await app.get("/sessions")).json()) as SessionBody[];
    expect(body[0]?.id).toBe("keynote");
    expect(body[0]?.local).toEqual({ date: "2026-11-18", start: "09:00", end: "09:45" });
    const starts = body.map((s) => s.startsAt);
    expect(starts).toEqual([...starts].sort());
  });

  test("filters by track", async () => {
    const body = (await (await app.get("/sessions?track=agents")).json()) as SessionBody[];
    expect(body.map((s) => s.id)).toEqual(["pull-agents", "evals"]);
  });

  test("returns 404 for an unknown track", async () => {
    expect((await app.get("/sessions?track=nope")).status).toBe(404);
  });
});

describe("GET /sessions/:id", () => {
  test("returns one session", async () => {
    const body = (await (await app.get("/sessions/graphs")).json()) as SessionBody;
    expect(body.local.start).toBe("10:00");
  });

  test("returns 404 for an unknown session", async () => {
    expect((await app.get("/sessions/nope")).status).toBe(404);
  });
});
