import { notImplemented } from "../http.ts";

export function exportRoutes() {
  return {
    "/attendees/:id/schedule.ics": { GET: () => notImplemented("calendar-export") },
  };
}
