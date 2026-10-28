import type { BunRequest } from "bun";
import type { Catalog } from "../agenda/catalog.ts";
import type { Session } from "../domain.ts";
import { json, notFound } from "../http.ts";
import { toLocalSlot } from "../time/zone.ts";

/** A session as the API returns it: UTC instants plus wall-clock time in the event zone. */
export function sessionView(session: Session, timeZone: string) {
  const { date, start, end } = toLocalSlot(session.startsAt, session.endsAt, timeZone);
  return { ...session, local: { date, start, end } };
}

export function catalogRoutes(catalog: Catalog) {
  const view = (session: Session) => sessionView(session, catalog.event.timeZone);
  return {
    "/event": { GET: () => json(catalog.event) },
    "/tracks": { GET: () => json(catalog.tracks()) },
    "/sessions": {
      GET: (req: BunRequest<"/sessions">) => {
        const trackSlug = new URL(req.url).searchParams.get("track");
        if (trackSlug === null) return json(catalog.sessions().map(view));
        if (catalog.track(trackSlug) === undefined) return notFound(`track ${trackSlug}`);
        return json(catalog.sessions({ trackSlug }).map(view));
      },
    },
    "/sessions/:id": {
      GET: (req: BunRequest<"/sessions/:id">) => {
        const session = catalog.session(req.params.id);
        return session === undefined ? notFound(`session ${req.params.id}`) : json(view(session));
      },
    },
  };
}
