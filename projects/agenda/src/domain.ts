/** Core agenda model. All instants are UTC ISO 8601 strings ending in `Z`. */

export interface EventInfo {
  readonly name: string;
  /** IANA time zone the event takes place in; every local rendering uses it. */
  readonly timeZone: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

export interface Track {
  readonly slug: string;
  readonly name: string;
}

export interface Speaker {
  readonly id: string;
  readonly name: string;
  readonly company: string;
  readonly bio: string;
}

export interface Session {
  readonly id: string;
  readonly title: string;
  readonly trackSlug: string;
  readonly speakerIds: readonly string[];
  readonly room: string;
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface Conference {
  readonly event: EventInfo;
  readonly tracks: readonly Track[];
  readonly speakers: readonly Speaker[];
  readonly sessions: readonly Session[];
}
