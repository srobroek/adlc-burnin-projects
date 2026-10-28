import { json } from "./http.ts";

/** Builds the route table for Bun.serve. */
export function createApp() {
  return {
    "/health": { GET: () => json({ ok: true }) },
  };
}
