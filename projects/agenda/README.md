# Agenda API

A small conference agenda service in TypeScript on [Bun](https://bun.sh). It serves one
conference's sessions, tracks and speakers, and keeps a personal schedule per attendee with
warnings for sessions that clash. Times are stored as UTC instants and shown in the event's
time zone.

## Run it

```sh
mise install          # or install the Bun version in mise.toml
bun install
bun run start         # http://localhost:3000 (PORT overrides)
bun run check         # lint (Biome), typecheck (tsc) and tests (bun test)
```

## Endpoints

| Method | Path | What |
| --- | --- | --- |
| GET | `/health` | `{ "ok": true }` |
| GET | `/event` | the conference: name, dates and time zone |
| GET | `/tracks` | all tracks |
| GET | `/sessions?track=<slug>` | sessions, optionally of one track |
| GET | `/sessions/:id` | one session |
| GET | `/speakers` | all speakers |
| GET, POST | `/attendees/:id/schedule` | an attendee's schedule and its clashing pairs; POST adds a session |

Endpoints that are planned but not built yet answer `501` with `{ "error": "not_implemented",
"feature": ... }`: the day view (`/agenda`), speaker profiles (`/speakers/:id`), removing a
session from a schedule and the calendar export (`/attendees/:id/schedule.ics`).

## Layout

- `src/`: the service (`app.ts` builds the route table, `server.ts` starts it).
- `test/`: `bun test` suites, one per route and module.

The data is an in-memory sample conference (`src/data/conference.ts`); nothing is persisted.
