import { afterAll, describe, expect, test } from "bun:test";
import { startApp } from "../support/app.ts";

const app = startApp();
afterAll(() => app.stop());

describe("GET /agenda", () => {
  test("is not implemented yet", async () => {
    expect((await app.get("/agenda?date=2026-11-18")).status).toBe(501);
  });
});
