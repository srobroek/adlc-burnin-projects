import { afterAll, describe, expect, test } from "bun:test";
import { startApp } from "../support/app.ts";

const app = startApp();
afterAll(() => app.stop());

interface ScheduleBody {
  attendeeId: string;
  sessions: { id: string }[];
  clashes: { first: string; second: string; overlapMinutes: number }[];
}

const schedule = async (response: Response) => (await response.json()) as ScheduleBody;

describe("personal schedule", () => {
  test("starts empty", async () => {
    expect(await schedule(await app.get("/attendees/nobody/schedule"))).toEqual({
      attendeeId: "nobody",
      sessions: [],
      clashes: [],
    });
  });

  test("adds a session and warns about clashes", async () => {
    await app.send("POST", "/attendees/alice/schedule", { sessionId: "pull-agents" });
    const response = await app.send("POST", "/attendees/alice/schedule", { sessionId: "graphs" });
    expect(response.status).toBe(201);
    const body = await schedule(response);
    expect(body.sessions.map((s) => s.id)).toEqual(["pull-agents", "graphs"]);
    expect(body.clashes).toEqual([{ first: "pull-agents", second: "graphs", overlapMinutes: 30 }]);
  });

  test("rejects an unknown session", async () => {
    const response = await app.send("POST", "/attendees/alice/schedule", { sessionId: "nope" });
    expect(response.status).toBe(404);
  });

  test("rejects a malformed body", async () => {
    const response = await app.send("POST", "/attendees/alice/schedule", { id: 1 });
    expect(response.status).toBe(400);
  });

  test("removing a session is not implemented yet", async () => {
    expect((await app.send("DELETE", "/attendees/alice/schedule/graphs")).status).toBe(501);
  });
});
