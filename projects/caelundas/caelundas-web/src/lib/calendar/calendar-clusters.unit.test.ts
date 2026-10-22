import { describe, expect, it } from "vitest";

import { CLUSTER_ID_PREFIX, clusterEvents } from "./calendar-clusters";

import type { CalendarEventRecord } from "../events-database/events-database.types";

const ZONE = "UTC";
const OPTIONS = {
  enabled: true,
  firstDay: "2026-03-02",
  gapMinutes: 30,
  lastDay: "2026-03-08",
  minimum: 2,
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
        event("b", "2026-03-03T10:10:00Z", "2026-03-03T10:10:00Z"),
        event("c", "2026-03-03T10:25:00Z", "2026-03-03T10:25:00Z"),
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

  it.each([
    ["twilights", "Type / Twilight / Civil Dawn"],
    ["a station", "Type / Station / Retrograde"],
    ["a daily cycle", "Type / Cycle / Daily Solar Cycle / Sunrise"],
    ["an ingress", "Type / Ingress / Sign Ingress"],
    ["an event of no kind", "Planet / Mars"],
  ])("never merges %s, however close they start", (_name, path) => {
    const events = [
      event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z", path),
      event("b", "2026-03-03T10:05:00Z", "2026-03-03T10:05:00Z", path),
      event("c", "2026-03-03T10:10:00Z", "2026-03-03T10:10:00Z", path),
    ];
    const clustered = clusterEvents(events, OPTIONS);

    expect(clustered.events.map((merged) => merged.id)).toStrictEqual([
      "a",
      "b",
      "c",
    ]);
    expect(clustered.members.size).toBe(0);
  });

  it("merges every kind of aspect", () => {
    for (const path of [
      "Type / Aspect / Simple Aspect / Major Aspect / Square",
      "Type / Aspect / Simple Aspect / Minor Aspect / Quincunx",
      "Type / Aspect / Simple Aspect / Specialty Aspect / Novile",
      "Type / Aspect / Compound Aspect / Triple Aspect / Yod",
    ]) {
      const clustered = clusterEvents(
        [
          event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z", path),
          event("b", "2026-03-03T10:05:00Z", "2026-03-03T10:05:00Z", path),
        ],
        OPTIONS,
      );

      expect(clustered.events).toHaveLength(1);
    }
  });

  it("leaves a run alone that is under the least that makes a cluster", () => {
    const events = [
      event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
      event("b", "2026-03-03T10:05:00Z", "2026-03-03T10:05:00Z"),
      event("c", "2026-03-03T10:10:00Z", "2026-03-03T10:10:00Z"),
    ];

    expect(
      clusterEvents(events, { ...OPTIONS, minimum: 4 }).events,
    ).toHaveLength(3);
    expect(
      clusterEvents(events, { ...OPTIONS, minimum: 3 }).events,
    ).toHaveLength(1);
  });

  it("keeps a long run apart when the view wants fewer clusters", () => {
    const events = [
      event("a", "2026-03-02T06:00:00Z", "2026-03-04T06:00:00Z"),
      event("b", "2026-03-03T12:00:00Z", "2026-03-06T00:00:00Z"),
    ];

    expect(
      clusterEvents(events, { ...OPTIONS, minimum: 3 }).events,
    ).toHaveLength(2);
  });

  it("starts a new cluster when events start further apart than the gap", () => {
    const events = [
      event("a", "2026-03-03T10:00:00Z", "2026-03-03T10:00:00Z"),
      event("b", "2026-03-03T10:20:00Z", "2026-03-03T10:20:00Z"),
    ];

    expect(
      clusterEvents(events, { ...OPTIONS, gapMinutes: 30 }).events,
    ).toHaveLength(1);
    expect(
      clusterEvents(events, { ...OPTIONS, gapMinutes: 10 }).events,
    ).toHaveLength(2);
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

  it("never stretches a cluster across the day by events each close to the next", () => {
    // Each event starts ten minutes after the last, but the last is an hour
    // after the first: with a half-hour gap that is two clusters, not one.
    const events = ["00", "10", "20", "30", "40", "50"].map((minute) =>
      event(
        `m${minute}`,
        `2026-03-03T10:${minute}:00Z`,
        `2026-03-03T10:${minute}:00Z`,
      ),
    );
    const clustered = clusterEvents(events, { ...OPTIONS, gapMinutes: 25 });

    expect(
      [...clustered.members.values()].map((members) =>
        members.map((member) => member.id),
      ),
    ).toStrictEqual([
      ["m00", "m10", "m20"],
      ["m30", "m40", "m50"],
    ]);
  });

  it("draws a cluster inside a day as a short chip, however long its events run", () => {
    const [standIn] = clusterEvents(
      [
        event("a", "2026-03-03T10:00:00Z", "2026-03-03T22:00:00Z"),
        event("b", "2026-03-03T10:05:00Z", "2026-03-03T18:00:00Z"),
      ],
      OPTIONS,
    ).events;

    expect(standIn?.durationMinutes).toBe(30);
    expect(standIn?.start).toStrictEqual(new Date("2026-03-03T10:00:00Z"));
  });

  it("draws a cluster of events that run past a day over all the days they cover", () => {
    const [standIn] = clusterEvents(
      [
        event("a", "2026-03-02T06:00:00Z", "2026-03-04T06:00:00Z"),
        event("b", "2026-03-03T12:00:00Z", "2026-03-06T00:00:00Z"),
      ],
      OPTIONS,
    ).events;

    expect(standIn?.end).toStrictEqual(new Date("2026-03-06T00:00:00Z"));
  });
});
