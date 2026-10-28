import { createCatalog } from "./agenda/catalog.ts";
import { conference } from "./data/conference.ts";
import type { Conference } from "./domain.ts";
import { json } from "./http.ts";
import { agendaRoutes } from "./routes/agenda.ts";
import { catalogRoutes } from "./routes/catalog.ts";
import { exportRoutes } from "./routes/export.ts";
import { scheduleRoutes } from "./routes/schedule.ts";
import { speakerRoutes } from "./routes/speakers.ts";
import { createScheduleStore, type ScheduleStore } from "./schedule/store.ts";

/** Builds the route table for Bun.serve. */
export function createApp(
  data: Conference = conference,
  store: ScheduleStore = createScheduleStore(),
) {
  const catalog = createCatalog(data);
  return {
    "/health": { GET: () => json({ ok: true }) },
    ...catalogRoutes(catalog),
    ...speakerRoutes(catalog),
    ...agendaRoutes(),
    ...scheduleRoutes(catalog, store),
    ...exportRoutes(),
  };
}
