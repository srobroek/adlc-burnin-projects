import { notImplemented } from "../http.ts";

export function agendaRoutes() {
  return {
    "/agenda": { GET: () => notImplemented("agenda-day-view") },
  };
}
