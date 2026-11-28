import { describe, expect, it } from "vitest";

import { CLUSTER_ID_PREFIX } from "./calendar-clusters.constants";
import { clusterEvents } from "./calendar-clusters.utilities";

import type { CalendarEventRecord } from "../../../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

const ZONE = "UTC";
// Events group by the first name of their tag's path.
const OPTIONS = {
  enabled: true,
  firstDay: "2026-03-02",
  gapMinutes: 30,
  groupOf: (candidate: CalendarEventRecord) => {
    const root = candidate.tags[0]?.path.split(" / ")[0] ?? "none";

    return { id: root, key: root, label: root };
  },
  lastDay: "2026-03-08",
  minimum: 2,
  timeZone: ZONE,
};
const ASPECT = "Aspect / Simple / Major / Square";
const SIGN = "Sign / Ingress / Sign Ingress";

function at(
  id: string,
  time: string,
  path: string = ASPECT,
): CalendarEventRecord {
  return event(id, `2026-03-03T${time}:00Z`, `2026-03-03T${time}:00Z`, path);
}

function event(
  id: string,
  start: string,
  end: string,
  path: string = ASPECT,
): CalendarEventRecord {
  const from = new Date(start);
  const to = new Date(end);

  return {
    color: "#f43f5e",
    durationMinutes: Math.round((to.getTime() - from.getTime()) / 60_000),
    end: to,
    groups: [],
    id,
    name: id,
    note: id,
    start: from,
    tags: [{ depth: 4, id: `tag-${id}`, name: "Square", path }],
    timezone: ZONE,
  };
}

describe(clusterEvents, () => {
  it("leaves every event as it is when merging is off", () => {
    const events = [at("a", "10:00"), at("b", "10:10")];
    const clustered = clusterEvents(events, { ...OPTIONS, enabled: false });

    expect(clustered.events).toStrictEqual(events);
    expect(clustered.members.size).toBe(0);
    expect(clustered.groups.size).toBe(0);
  });

  it("merges events of one group that start close together in a day", () => {
    const clustered = clusterEvents(
      [at("a", "10:00"), at("b", "10:10"), at("c", "10:25")],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(1);
    expect(clustered.events[0]).toMatchObject({
      color: "#f43f5e",
      id: `${CLUSTER_ID_PREFIX}a`,
      name: "3 Aspect",
    });
    expect(
      clustered.members
        .get(`${CLUSTER_ID_PREFIX}a`)
        ?.map((member) => member.id),
    ).toStrictEqual(["a", "b", "c"]);
    expect(clustered.groups.get(`${CLUSTER_ID_PREFIX}a`)).toStrictEqual({
      id: "Aspect",
      key: "Aspect",
      label: "Aspect",
    });
  });

  it("colors a cluster by its group's color when given, and merges events with no group key", () => {
    const colored = clusterEvents([at("a", "10:00"), at("b", "10:10")], {
      ...OPTIONS,
      colors: new Map([["Aspect", "#112233"]]),
    });
    const keyless = clusterEvents([at("a", "10:00"), at("b", "10:10")], {
      ...OPTIONS,
      colors: new Map(),
      groupOf: () => ({ id: "none", key: null, label: "Other" }),
    });

    expect(colored.events[0]?.color).toBe("#112233");
    expect(keyless.events).toHaveLength(1);
  });

  it("draws a cluster as a short chip at the time its first event starts", () => {
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

  it("keeps events apart that start further apart than the gap", () => {
    const clustered = clusterEvents(
      [at("a", "08:00"), at("b", "14:00")],
      OPTIONS,
    );

    expect(clustered.events.map((merged) => merged.id)).toStrictEqual([
      "a",
      "b",
    ]);
    expect(clustered.members.size).toBe(0);
  });

  it("never merges events of different groups", () => {
    const clustered = clusterEvents(
      [at("a", "10:00"), at("b", "10:05", SIGN)],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(2);
  });

  it("merges the events of any group, not only some kinds", () => {
    const clustered = clusterEvents(
      [
        at("a", "10:00", "Daily / Twilight / Civil Dawn"),
        at("b", "10:05", "Daily / Twilight / Civil Dawn"),
      ],
      OPTIONS,
    );

    expect(clustered.events).toHaveLength(1);
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

  it("leaves events that run past a day alone", () => {
    const events = [
      event("a", "2026-03-02T06:00:00Z", "2026-03-04T06:00:00Z"),
      event("b", "2026-03-03T12:00:00Z", "2026-03-06T00:00:00Z"),
    ];

    expect(clusterEvents(events, OPTIONS).events).toStrictEqual(events);
  });

  it("leaves an event with a date that is no time as it is, rather than throwing", () => {
    const broken = {
      ...at("a", "10:00"),
      end: new Date(Number.NaN),
      start: new Date(Number.NaN),
    };

    expect(clusterEvents([broken], OPTIONS).events).toStrictEqual([broken]);
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

  it("leaves a run alone that is under the least that makes a cluster", () => {
    const events = [at("a", "10:00"), at("b", "10:05"), at("c", "10:10")];

    expect(
      clusterEvents(events, { ...OPTIONS, minimum: 4 }).events,
    ).toHaveLength(3);
    expect(
      clusterEvents(events, { ...OPTIONS, minimum: 3 }).events,
    ).toHaveLength(1);
  });

  it("starts a new cluster when events start further apart than the gap", () => {
    const events = [at("a", "10:00"), at("b", "10:20")];

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
        event("b", "2026-03-05T10:00:00Z", "2026-03-05T10:00:00Z", SIGN),
        at("a", "10:00"),
      ],
      OPTIONS,
    ).events.map((merged) => merged.id);

    expect(starts).toStrictEqual(["a", "b"]);
  });

  it("never stretches a cluster across the day by events each close to the next", () => {
    // Each event starts ten minutes after the last, but the last is an hour
    // after the first: with a 25 minute gap that is two clusters, not one.
    const events = ["00", "10", "20", "30", "40", "50"].map((minute) =>
      at(`m${minute}`, `10:${minute}`),
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
});
