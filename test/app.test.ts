import { afterAll, beforeAll, expect, test } from "bun:test";
import type { Server } from "bun";
import { createApp } from "../src/app.ts";

let server: Server<undefined>;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    routes: createApp(),
    fetch: () => new Response(null, { status: 404 }),
  });
});

afterAll(() => server.stop(true));

test("GET /health reports ok", async () => {
  const response = await fetch(new URL("/health", server.url));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
});
