/** In-memory personal schedules: the session ids each attendee picked, in insertion order. */
export interface ScheduleStore {
  sessionIds(attendeeId: string): readonly string[];
  add(attendeeId: string, sessionId: string): void;
  /** Returns whether the session was in the schedule. */
  remove(attendeeId: string, sessionId: string): boolean;
}

export function createScheduleStore(): ScheduleStore {
  const schedules = new Map<string, string[]>();
  return {
    sessionIds: (attendeeId) => schedules.get(attendeeId) ?? [],
    add(attendeeId, sessionId) {
      const ids = schedules.get(attendeeId) ?? [];
      ids.push(sessionId);
      schedules.set(attendeeId, ids);
    },
    remove(attendeeId, sessionId) {
      const ids = schedules.get(attendeeId) ?? [];
      const index = ids.indexOf(sessionId);
      if (index === -1) return false;
      ids.splice(index, 1);
      return true;
    },
  };
}
