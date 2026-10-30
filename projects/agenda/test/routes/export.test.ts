import { afterAll, describe, expect, test } from "bun:test";
import { startApp } from "../support/app.ts";

const app = startApp();
afterAll(() => app.stop());

describe("GET /attendees/:id/schedule.ics", () => {
  test("is not implemented yet", async () => {
    expect((await app.get("/attendees/alice/schedule.ics")).status).toBe(501);
  });
});
