import { describe, expect, it } from "vitest";

import {
  createTagRanks,
  measureGroup,
  sortGroupEvents,
} from "./event-group-sort.utilities";

import type {
  CalendarEventRecord,
  EventFacet,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupNode } from "../event-group-model/event-groups.types";

function record(
  id: string,
  options: Partial<Omit<CalendarEventRecord, "start">> & {
    hours?: number;
    start?: string;
  },
): CalendarEventRecord {
  const { hours = 0, start: startText, ...rest } = options;
  const start = new Date(startText ?? "2026-03-01T10:00:00.000Z");

  return {
    color: null,
    durationMinutes: hours * 60,
    end: new Date(start.getTime() + hours * 3_600_000),
    groups: [],
    id,
    name: id,
    note: "",
    start,
    tags: [],
    timezone: "UTC",
    ...rest,
  };
}

const FACETS: EventFacet[] = [
  {
    id: "aspect",
    name: "Aspect",
    values: [
      { count: 1, depth: 1, id: "square", name: "Square", path: "Square" },
      { count: 1, depth: 1, id: "trine", name: "Trine", path: "Trine" },
    ],
  },
];
const RANKS = createTagRanks(FACETS);
const SHORT = record("b-short", {
  hours: 1,
  start: "2026-03-03T10:00:00.000Z",
});
const LONG = record("a-long", { hours: 5, start: "2026-03-02T10:00:00.000Z" });
const INSTANT = record("c-instant", { start: "2026-03-01T10:00:00.000Z" });

function ids(events: readonly CalendarEventRecord[]): string[] {
  return events.map((event) => event.id);
}

describe("event group sort utilities", () => {
  describe(sortGroupEvents, () => {
    const events = [SHORT, LONG, INSTANT];

    it("keeps the events as given when no sort orders events", () => {
      expect(ids(sortGroupEvents(events, undefined, RANKS))).toStrictEqual([
        "b-short",
        "a-long",
        "c-instant",
      ]);
      expect(
        ids(
          sortGroupEvents(events, [{ direction: "desc", key: "count" }], RANKS),
        ),
      ).toStrictEqual(["b-short", "a-long", "c-instant"]);
    });

    it("orders by name, alphabetically", () => {
      expect(
        ids(
          sortGroupEvents(events, [{ direction: "asc", key: "name" }], RANKS),
        ),
      ).toStrictEqual(["a-long", "b-short", "c-instant"]);
    });

    it("orders by start, and reverses", () => {
      expect(
        ids(
          sortGroupEvents(events, [{ direction: "asc", key: "start" }], RANKS),
        ),
      ).toStrictEqual(["c-instant", "a-long", "b-short"]);
      expect(
        ids(
          sortGroupEvents(events, [{ direction: "desc", key: "start" }], RANKS),
        ),
      ).toStrictEqual(["b-short", "a-long", "c-instant"]);
    });

    it("orders by end", () => {
      expect(
        ids(sortGroupEvents(events, [{ direction: "asc", key: "end" }], RANKS)),
      ).toStrictEqual(["c-instant", "a-long", "b-short"]);
    });

    it("orders by duration, an instant being shortest, and breaks ties with the next sort", () => {
      expect(
        ids(
          sortGroupEvents(
            events,
            [{ direction: "desc", key: "duration" }],
            RANKS,
          ),
        ),
      ).toStrictEqual(["a-long", "b-short", "c-instant"]);
      expect(
        ids(
          sortGroupEvents(
            [LONG, record("same", { hours: 5 }), SHORT],
            [
              { direction: "desc", key: "duration" },
              { direction: "asc", key: "name" },
            ],
            RANKS,
          ),
        ),
      ).toStrictEqual(["a-long", "same", "b-short"]);
    });

    it("orders by the tag rank of the tags an event carries beneath a tag, those with none last", () => {
      const trine = record("trine", {
        tags: [
          { depth: 1, id: "trine", name: "Trine", path: "Aspect / Trine" },
        ],
      });
      const square = record("square", {
        tags: [
          { depth: 1, id: "square", name: "Square", path: "Aspect / Square" },
        ],
      });
      const none = record("none", {});

      expect(
        ids(
          sortGroupEvents(
            [none, trine, square],
            [{ direction: "asc", key: "tag", tag: "tag:aspect" }],
            RANKS,
          ),
        ),
      ).toStrictEqual(["square", "trine", "none"]);
      expect(
        ids(
          sortGroupEvents(
            [none, trine, square],
            [{ direction: "asc", key: "tag", tag: "gone" }],
            RANKS,
          ),
        ),
      ).toStrictEqual(["none", "trine", "square"]);
    });
  });

  describe(measureGroup, () => {
    const node = {
      children: [],
      count: 3,
      events: [INSTANT, LONG, SHORT],
      id: "g",
      key: "g",
      label: "G",
      level: 0,
      path: ["G"],
    } satisfies EventGroupNode;

    it("measures a group by count, first start, first end and total duration", () => {
      expect(measureGroup("count", node)).toBe(3);
      expect(measureGroup("first", node)).toBe(INSTANT.start.getTime());
      expect(measureGroup("start", node)).toBe(INSTANT.start.getTime());
      expect(measureGroup("end", node)).toBe(INSTANT.end.getTime());
      expect(measureGroup("duration", node)).toBe(360);
    });

    it("measures nothing for a key that does not measure", () => {
      expect(measureGroup("name", node)).toBe(0);
      expect(measureGroup("end", { ...node, events: [] })).toBe(0);
    });
  });
});
