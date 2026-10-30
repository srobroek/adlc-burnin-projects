import type { BunRequest } from "bun";
import { z } from "zod";
import type { Catalog } from "../agenda/catalog.ts";
import type { Session } from "../domain.ts";
import { badRequest, json, notFound, notImplemented } from "../http.ts";
import { findClashes } from "../schedule/clash.ts";
import type { ScheduleStore } from "../schedule/store.ts";
import { sessionView } from "./catalog.ts";

const AddSession = z.object({ sessionId: z.string().min(1) });

export function scheduleRoutes(catalog: Catalog, store: ScheduleStore) {
  const scheduleOf = (attendeeId: string) => {
    const sessions = store
      .sessionIds(attendeeId)
      .map((id) => catalog.session(id))
      .filter((s): s is Session => s !== undefined);
    return {
      attendeeId,
      sessions: sessions.map((s) => sessionView(s, catalog.event.timeZone)),
      clashes: findClashes(sessions),
    };
  };

  return {
    "/attendees/:id/schedule": {
      GET: (req: BunRequest<"/attendees/:id/schedule">) => json(scheduleOf(req.params.id)),
      POST: async (req: BunRequest<"/attendees/:id/schedule">) => {
        const parsed = AddSession.safeParse(await req.json().catch(() => undefined));
        if (!parsed.success) return badRequest('body must be {"sessionId": string}');
        const { sessionId } = parsed.data;
        if (catalog.session(sessionId) === undefined) return notFound(`session ${sessionId}`);
        store.add(req.params.id, sessionId);
        return json(scheduleOf(req.params.id), 201);
      },
    },
    "/attendees/:id/schedule/:sessionId": {
      DELETE: () => notImplemented("schedule-remove"),
    },
  };
}
