import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../testing/calendar/calendar-records";
import { createTagRanks } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-sort.utilities";

import { groupCalendarEvents } from "./calendar-groups.utilities";

import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

const GROUPING = [{ field: "tag:*", tags: ["a"] }];
const EVENTS: CalendarEventRecord[] = [
  createRecord("a1", "2026-03-03T09:00:00Z", "2026-03-03T10:00:00Z", [
    "Aspect",
  ]),
  createRecord("a2", "2026-03-03T08:00:00Z", "2026-03-03T08:30:00Z", [
    "Aspect",
  ]),
  createRecord("a3", "2026-03-03T12:00:00Z", "2026-03-03T12:00:00Z", [
    "Aspect",
  ]),
  createRecord("s1", "2026-03-03T07:00:00Z", "2026-03-03T19:00:00Z", ["Sign"]),
  createRecord("l1", "2026-03-03T15:00:00Z", "2026-03-03T15:10:00Z", ["Lunar"]),
];

function order(sorts: readonly GroupSort[] | undefined): string[] {
  return groupCalendarEvents(EVENTS, {
    grouping: GROUPING,
    ranks: createTagRanks([]),
    sorts,
  }).map((group) => group.label);
}

describe("sorting a cell's groups", () => {
  it("keeps the tags' order when nothing is sorted, or only a metric", () => {
    expect(order(undefined)).toStrictEqual(["Aspect", "Lunar", "Sign"]);
    expect(
      order([{ direction: "asc", key: "metric", metric: "events" }]),
    ).toStrictEqual(["Aspect", "Lunar", "Sign"]);
  });

  it("orders by event count, either way", () => {
    expect(order([{ direction: "desc", key: "count" }])).toStrictEqual([
      "Aspect",
      "Lunar",
      "Sign",
    ]);
    expect(order([{ direction: "asc", key: "count" }])[2]).toBe("Aspect");
  });

  it("orders by name, first event, end and duration", () => {
    expect(order([{ direction: "desc", key: "name" }])).toStrictEqual([
      "Sign",
      "Lunar",
      "Aspect",
    ]);
    expect(order([{ direction: "asc", key: "first" }])[0]).toBe("Sign");
    expect(order([{ direction: "asc", key: "end" }])[0]).toBe("Aspect");
    expect(order([{ direction: "desc", key: "duration" }])[0]).toBe("Sign");
  });

  it("breaks a tie with the next sort and orders the events inside a group", () => {
    const groups = groupCalendarEvents(EVENTS, {
      grouping: GROUPING,
      sorts: [
        { direction: "asc", key: "start" },
        { direction: "asc", key: "name" },
      ],
    });

    expect(groups[0]?.label).toBe("Sign");
    expect(
      groups
        .find((group) => group.label === "Aspect")
        ?.events.map((event) => event.id),
    ).toStrictEqual(["a2", "a1", "a3"]);
  });

  it("orders by the tags' order, keeps a group it cannot measure, and orders events by end and duration", () => {
    expect(order([{ direction: "desc", key: "order" }])[0]).toBe("Sign");
    expect(order([{ direction: "asc", key: "tag", tag: "none" }])).toHaveLength(
      3,
    );

    const groups = groupCalendarEvents(EVENTS, {
      grouping: GROUPING,
      sorts: [
        { direction: "desc", key: "end" },
        { direction: "asc", key: "duration" },
      ],
    });

    expect(
      groups
        .find((group) => group.label === "Aspect")
        ?.events.map((event) => event.id),
    ).toStrictEqual(["a3", "a1", "a2"]);
  });

  it("places a tag with no rank last, and a tag sort naming no tag first", () => {
    const tagged = EVENTS.map((event) => ({
      ...event,
      tags: [{ depth: 1, id: "t-x", name: "X", path: "Sign / X" }],
    }));
    const ranks = {
      prefixes: new Map([["tag-sign", "Sign / "]]),
      ranks: new Map<string, number>(),
    };

    for (const sort of [
      { direction: "asc", key: "tag", tag: "tag-sign" },
      { direction: "asc", key: "tag" },
    ] as const) {
      expect(
        groupCalendarEvents(tagged, {
          grouping: GROUPING,
          ranks,
          sorts: [sort],
        }),
      ).toHaveLength(3);
    }
  });

  it("orders by the place of the tags a group's events carry", () => {
    const tagged = EVENTS.map((event) => ({
      ...event,
      tags:
        event.id === "s1"
          ? [{ depth: 1, id: "t-first", name: "First", path: "Sign / First" }]
          : [{ depth: 1, id: "t-last", name: "Last", path: "Sign / Last" }],
    }));
    const ranks = {
      prefixes: new Map([["tag-sign", "Sign / "]]),
      ranks: new Map([
        ["t-first", 0],
        ["t-last", 1],
      ]),
    };
    const groups = groupCalendarEvents(tagged, {
      grouping: GROUPING,
      ranks,
      sorts: [{ direction: "asc", key: "tag", tag: "tag-sign" }],
    });

    expect(groups[0]?.label).toBe("Sign");
  });
});
