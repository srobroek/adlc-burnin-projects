/**
 * Instants are stored in UTC (ISO 8601 with a trailing `Z`) and rendered as wall-clock
 * time in the event's IANA time zone.
 */

const UTC_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?Z$/;

export class TimeError extends Error {
  override name = "TimeError";
}

/** Parses a UTC ISO 8601 instant; rejects offsets and local times. */
export function parseInstant(value: string): Date {
  if (!UTC_ISO.test(value)) {
    throw new TimeError(`not a UTC ISO 8601 instant: ${value}`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TimeError(`invalid instant: ${value}`);
  }
  return date;
}

export interface LocalParts {
  /** Local calendar date, `YYYY-MM-DD`. */
  readonly date: string;
  /** Local wall-clock time, `HH:MM` (24-hour). */
  readonly time: string;
  readonly minutesOfDay: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Wall-clock date and time of a UTC instant in `timeZone`. */
export function localParts(instant: string, timeZone: string): LocalParts {
  const parts = formatterFor(timeZone).formatToParts(parseInstant(instant));
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(part("hour"));
  const minute = Number(part("minute"));
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
    minutesOfDay: hour * 60 + minute,
  };
}

export interface LocalSlot {
  /** Local date the slot starts on. */
  readonly date: string;
  readonly start: string;
  readonly end: string;
  readonly durationMinutes: number;
}

/** Renders a UTC interval as a local slot in the event time zone. */
export function toLocalSlot(startsAt: string, endsAt: string, timeZone: string): LocalSlot {
  const start = localParts(startsAt, timeZone);
  const end = localParts(endsAt, timeZone);
  return {
    date: start.date,
    start: start.time,
    end: end.time,
    durationMinutes: end.minutesOfDay - start.minutesOfDay,
  };
}
