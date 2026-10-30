import { describe, expect, test } from "bun:test";
import { createScheduleStore } from "../../src/schedule/store.ts";

describe("ScheduleStore", () => {
  test("starts empty", () => {
    expect(createScheduleStore().sessionIds("alice")).toEqual([]);
  });

  test("keeps sessions per attendee in insertion order", () => {
    const store = createScheduleStore();
    store.add("alice", "graphs");
    store.add("alice", "keynote");
    store.add("bob", "evals");
    expect(store.sessionIds("alice")).toEqual(["graphs", "keynote"]);
    expect(store.sessionIds("bob")).toEqual(["evals"]);
  });

  test("removes a session and reports whether it was there", () => {
    const store = createScheduleStore();
    store.add("alice", "graphs");
    expect(store.remove("alice", "graphs")).toBe(true);
    expect(store.remove("alice", "graphs")).toBe(false);
    expect(store.sessionIds("alice")).toEqual([]);
  });
});
