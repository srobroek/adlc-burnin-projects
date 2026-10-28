import { createCatalog } from "./agenda/catalog.ts";
import { conference } from "./data/conference.ts";
import type { Conference } from "./domain.ts";
import { json } from "./http.ts";
import { agendaRoutes } from "./routes/agenda.ts";
import { catalogRoutes } from "./routes/catalog.ts";
import { speakerRoutes } from "./routes/speakers.ts";

/** Builds the route table for Bun.serve. */
export function createApp(data: Conference = conference) {
  const catalog = createCatalog(data);
  return {
    "/health": { GET: () => json({ ok: true }) },
    ...catalogRoutes(catalog),
    ...speakerRoutes(catalog),
    ...agendaRoutes(),
  };
}
