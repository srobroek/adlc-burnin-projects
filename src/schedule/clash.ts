import type { Session } from "../domain.ts";
import { parseInstant } from "../time/zone.ts";

export interface Clash {
  readonly first: string;
  readonly second: string;
  readonly overlapMinutes: number;
}

const MINUTE_MS = 60_000;

/** Every pair of sessions whose time ranges touch or overlap, compared as UTC instants. */
export function findClashes(sessions: readonly Session[]): Clash[] {
  const ranges = sessions.map((s) => ({
    id: s.id,
    start: parseInstant(s.startsAt).getTime(),
    end: parseInstant(s.endsAt).getTime(),
  }));
  const clashes: Clash[] = [];
  ranges.forEach((a, i) => {
    for (const b of ranges.slice(i + 1)) {
      if (a.start <= b.end && b.start <= a.end) {
        const overlap = Math.min(a.end, b.end) - Math.max(a.start, b.start);
        clashes.push({ first: a.id, second: b.id, overlapMinutes: overlap / MINUTE_MS });
      }
    }
  });
  return clashes;
}
