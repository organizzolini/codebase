import { describe, expect, it } from "vitest";

import { AGENDA_ROW_HEIGHTS } from "./calendar-agenda.constants";
import {
  getAgendaRange,
  getEventRowHeight,
  toAgendaRows,
  toGroupedAgendaRows,
} from "./calendar-agenda.utilities";

import type {
  CalendarEventRecord,
  CalendarEventTag,
} from "../events-calendar/components/calendar-loader/calendar-records.types";

function event(
  id: string,
  summary: string,
  options: Readonly<{ at?: string; end?: string; path?: string }> = {},
): CalendarEventRecord {
  const at = new Date(options.at ?? "2026-03-04T10:00:00.000Z");

  return {
    color: null,
    description: "",
    durationMinutes: 0,
    end: options.end === undefined ? at : new Date(options.end),
    groups: [],
    id,
    location: null,
    start: at,
    summary,
    tags:
      options.path === undefined
        ? []
        : [
            {
              depth: 3,
              id: "kind",
              name: "Major Aspect",
              path: options.path,
            },
          ],
    timezone: "UTC",
  };
}

describe(toAgendaRows, () => {
  it("orders events that begin together by name", () => {
    const rows = toAgendaRows(
      [event("b", "Venus"), event("a", "Mars")],
      getAgendaRange("2026-03-01", "UTC"),
    );

    expect(
      rows.flatMap((row) => (row.kind === "event" ? [row.record.id] : [])),
    ).toStrictEqual(["a", "b"]);
  });

  describe("clustering similar events", () => {
    const MAJOR = "Aspect / Simple / Major";
    const range = getAgendaRange("2026-03-01", "UTC");
    const events = (): CalendarEventRecord[] => [
      event("a", "One", { path: MAJOR }),
      event("b", "Two", { path: MAJOR }),
      event("c", "Three", { path: MAJOR }),
      event("d", "Lone", { path: "Eclipse" }),
    ];

    const clustered = (
      list: CalendarEventRecord[],
      expanded: ReadonlySet<string>,
    ): ReturnType<typeof toGroupedAgendaRows> =>
      toGroupedAgendaRows(list, range, {
        cluster: { expanded },
        fields: [],
        levels: [],
      });

    it("gathers enough events of one kind in a day under a closed row", () => {
      const rows = clustered(events(), new Set());
      const cluster = rows.find((row) => row.kind === "cluster");

      expect(cluster).toMatchObject({
        count: 3,
        expanded: false,
        label: "Major aspects",
        ongoing: false,
      });
      expect(
        rows.flatMap((row) => (row.kind === "event" ? [row.record.id] : [])),
      ).toStrictEqual(["d"]);
    });

    it("lists the events beneath a cluster that is open", () => {
      const closed = clustered(events(), new Set()).find(
        (row) => row.kind === "cluster",
      );
      const rows = clustered(
        events(),
        new Set(closed?.kind === "cluster" ? [closed.id] : []),
      );

      expect(
        rows.flatMap((row) => (row.kind === "event" ? [row.record.id] : [])),
      ).toStrictEqual(["d", "a", "c", "b"]);
      expect(rows.find((row) => row.kind === "cluster")).toMatchObject({
        expanded: true,
      });
    });

    it("keeps ongoing events apart from the day's own, and names them", () => {
      const ongoing = [1, 2, 3].map((index) =>
        event(`o${String(index)}`, "Long", {
          at: "2026-02-20T10:00:00.000Z",
          end: "2026-03-20T10:00:00.000Z",
          path: MAJOR,
        }),
      );
      const rows = clustered([...ongoing, ...events()], new Set());

      expect(
        rows.flatMap((row) => (row.kind === "cluster" ? [row.label] : [])),
      ).toStrictEqual(["Ongoing Major aspects", "Major aspects"]);
    });

    it("lists every event when it is not clustering", () => {
      expect(
        toAgendaRows(events(), range).filter((row) => row.kind === "cluster"),
      ).toHaveLength(0);
    });
  });

  describe(getEventRowHeight, () => {
    const tags: CalendarEventTag[] = Array.from({ length: 8 }, (_, index) => ({
      depth: 1,
      id: String(index),
      name: "Harmonic 4",
      path: "Type / Harmonic 4",
    }));

    it("is the usual height for an event with no tags", () => {
      expect(getEventRowHeight([], 800)).toBe(AGENDA_ROW_HEIGHTS.event);
    });

    it("adds a line for each line the tags wrap onto", () => {
      const wide = getEventRowHeight(tags, 1600);
      const narrow = getEventRowHeight(tags, 500);

      expect(wide).toBe(72);
      expect(narrow).toBeGreaterThan(wide);
    });
  });
});
