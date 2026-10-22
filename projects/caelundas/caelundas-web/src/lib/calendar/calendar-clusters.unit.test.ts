import { describe, expect, it } from "vitest";

import { CLUSTER_ID_PREFIX, clusterEvents } from "./calendar-clusters";

import type { CalendarEventRecord } from "../events-database/events-database.types";

const ZONE = "UTC";
const OPTIONS = {
  enabled: true,
  firstDay: "2026-03-02",
  lastDay: "2026-03-08",
  timeZone: ZONE,
};
const MAJOR = "Type / Aspect / Simple Aspect / Major Aspect / Square";
const MINOR = "Type / Aspect / Simple Aspect / Minor Aspect / Quincunx";

function event(
  id: string,
  start: string,
  end: string,
  path: string = MAJOR,
): CalendarEventRecord {
  const from = new Date(start);
  const to = new Date(end);

  return {
    color: "#f43f5e",
    description: id,
    durationMinutes: Math.round((to.getTime() - from.getTime()) / 60_000),
    end: to,
    groups: [],
    id,
    location: null,
    start: from,
    summary: id,
    tags: [{ depth: 4, id: `tag-${id}`, name: "Square", path }],
    timezone: ZONE,
  };
}

describe(clusterEvents, () => {
  it("leaves every event as it is when merging is off", () => {
    const events = [
      event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
      event("b", "2026-03-03T10:10:00Z", "2026-03-03T10:10:00Z"),
    ];
    const clustered = clusterEvents(events, { ...OPTIONS, enabled: false });

    expect(clustered.events).toStrictEqual(events);
    expect(clustered.members.size).toBe(0);
  });

  it("merges events of one kind that start close together in a day", () => {
    const clustered = clusterEvents(
      [
        event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
        event("b", "2026-03-03T10:20:00Z", "2026-03-03T10:20:00Z"),
        event("c", "2026-03-03T10:45:00Z", "2026-03-03T10:45:00Z"),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(1);
    expect(clustered.events[0]).toMatchObject({
      color: "#f43f5e",
      id: `${CLUSTER_ID_PREFIX}a`,
      summary: "3 major aspects",
    });
    expect(
      clustered.members
        .get(`${CLUSTER_ID_PREFIX}a`)
        ?.map((member) => member.id),
    ).toStrictEqual(["a", "b", "c"]);
  });

  it("gives a cluster of instants a body to read", () => {
    const [standIn] = clusterEvents(
      [
        event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
        event("b", "2026-03-03T10:05:00Z", "2026-03-03T10:05:00Z"),
      ],
      OPTIONS,
    ).events;

    expect(standIn?.durationMinutes).toBeGreaterThanOrEqual(30);
  });

  it("keeps events apart that start further apart than the gap", () => {
    const clustered = clusterEvents(
      [
        event("a", "2026-03-03T08:00:00Z", "2026-03-03T08:00:00Z"),
        event("b", "2026-03-03T14:00:00Z", "2026-03-03T14:00:00Z"),
      ],
      OPTIONS,
    );

    expect(clustered.events.map((merged) => merged.id)).toStrictEqual([
      "a",
      "b",
    ]);
    expect(clustered.members.size).toBe(0);
  });

  it("never merges events of different kinds", () => {
    const clustered = clusterEvents(
      [
        event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
        event("b", "2026-03-03T10:05:00Z", "2026-03-03T10:05:00Z", MINOR),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(2);
  });

  it("never merges events across days", () => {
    const clustered = clusterEvents(
      [
        event("a", "2026-03-03T23:50:00Z", "2026-03-03T23:50:00Z"),
        event("b", "2026-03-04T00:10:00Z", "2026-03-04T00:10:00Z"),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(2);
  });

  it("merges events that run past a day when they overlap", () => {
    const clustered = clusterEvents(
      [
        event("a", "2026-03-02T06:00:00Z", "2026-03-04T06:00:00Z"),
        event("b", "2026-03-03T12:00:00Z", "2026-03-06T00:00:00Z"),
        event("c", "2026-03-05T00:00:00Z", "2026-03-07T00:00:00Z"),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(1);
    expect(clustered.events[0]).toMatchObject({
      end: new Date("2026-03-07T00:00:00Z"),
      start: new Date("2026-03-02T06:00:00Z"),
      summary: "3 major aspects",
    });
  });

  it("keeps long events that do not overlap apart", () => {
    const clustered = clusterEvents(
      [
        event("a", "2026-03-02T06:00:00Z", "2026-03-03T06:00:00Z"),
        event("b", "2026-03-05T00:00:00Z", "2026-03-07T00:00:00Z"),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(2);
  });

  it("does not mix events that run past a day with those inside one", () => {
    const clustered = clusterEvents(
      [
        event("long", "2026-03-02T06:00:00Z", "2026-03-05T06:00:00Z"),
        event("short", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(2);
  });

  it("leaves events outside the days shown alone", () => {
    const outside = [
      event("a", "2026-03-20T10:00:00Z", "2026-03-20T10:00:00Z"),
      event("b", "2026-03-20T10:05:00Z", "2026-03-20T10:05:00Z"),
    ];

    expect(clusterEvents(outside, OPTIONS).events).toStrictEqual(outside);
  });

  it("reads days in the data's zone", () => {
    // 23:30 on 3 March in New York is 04:30 on 4 March UTC.
    const clustered = clusterEvents(
      [
        event("a", "2026-03-04T04:30:00Z", "2026-03-04T04:30:00Z"),
        event("b", "2026-03-04T04:40:00Z", "2026-03-04T04:40:00Z"),
      ],
      { ...OPTIONS, timeZone: "America/New_York" },
    );

    expect(clustered.events).toHaveLength(1);
  });

  it("names a cluster of events with no kind by their count", () => {
    const clustered = clusterEvents(
      [
        event(
          "a",
          "2026-03-03T10:00:00Z",
          "2026-03-03T10:00:00Z",
          "Planet / Mars",
        ),
        event(
          "b",
          "2026-03-03T10:05:00Z",
          "2026-03-03T10:05:00Z",
          "Planet / Mars",
        ),
      ],
      OPTIONS,
    );

    expect(clustered.events[0]?.summary).toBe("2 events");
  });

  it("returns the events in order of start", () => {
    const starts = clusterEvents(
      [
        event("b", "2026-03-05T10:00:00Z", "2026-03-05T10:00:00Z", MINOR),
        event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
      ],
      OPTIONS,
    ).events.map((merged) => merged.id);

    expect(starts).toStrictEqual(["a", "b"]);
  });
});
