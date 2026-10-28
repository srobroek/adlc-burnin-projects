import { afterAll, describe, expect, test } from "bun:test";
import { startApp } from "../support/app.ts";

const app = startApp();
afterAll(() => app.stop());

describe("GET /speakers", () => {
  test("lists speakers", async () => {
    const body = (await (await app.get("/speakers")).json()) as { id: string }[];
    expect(body.map((s) => s.id)).toEqual(["ada", "ben", "chen", "dana"]);
  });
});

describe("GET /speakers/:id", () => {
  test("is not implemented yet", async () => {
    expect((await app.get("/speakers/ada")).status).toBe(501);
  });
});
