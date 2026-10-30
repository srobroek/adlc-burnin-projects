import type { Conference, EventInfo, Session, Speaker, Track } from "../domain.ts";

/** Read-only lookups over one conference's tracks, speakers and sessions. */
export interface Catalog {
  readonly event: EventInfo;
  tracks(): readonly Track[];
  track(slug: string): Track | undefined;
  /** Sessions in start order, optionally limited to one track. */
  sessions(filter?: { readonly trackSlug?: string }): readonly Session[];
  session(id: string): Session | undefined;
  speakers(): readonly Speaker[];
  speaker(id: string): Speaker | undefined;
}

export function createCatalog(conference: Conference): Catalog {
  const byStart = [...conference.sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return {
    event: conference.event,
    tracks: () => conference.tracks,
    track: (slug) => conference.tracks.find((t) => t.slug === slug),
    sessions: (filter = {}) =>
      filter.trackSlug === undefined
        ? byStart
        : byStart.filter((s) => s.trackSlug === filter.trackSlug),
    session: (id) => conference.sessions.find((s) => s.id === id),
    speakers: () => conference.speakers,
    speaker: (id) => conference.speakers.find((s) => s.id === id),
  };
}
