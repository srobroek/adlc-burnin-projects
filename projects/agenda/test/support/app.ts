import type { Server } from "bun";
import { createApp } from "../../src/app.ts";

export interface TestApp {
  get(path: string): Promise<Response>;
  send(method: string, path: string, body?: unknown): Promise<Response>;
  stop(): void;
}

/** Starts the real route table on an ephemeral port. */
export function startApp(): TestApp {
  const server: Server<undefined> = Bun.serve({
    port: 0,
    routes: createApp(),
    fetch: () => new Response(null, { status: 404 }),
  });
  const send = (method: string, path: string, body?: unknown) =>
    fetch(new URL(path, server.url), {
      method,
      headers: { "content-type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  return {
    get: (path) => send("GET", path),
    send,
    stop: () => server.stop(true),
  };
}
