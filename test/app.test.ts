import { afterAll, expect, test } from "bun:test";
import { startApp } from "./support/app.ts";

const app = startApp();
afterAll(() => app.stop());

test("GET /health reports ok", async () => {
  const response = await app.get("/health");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
});
