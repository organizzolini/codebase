import { describe, expect, it, vi } from "vitest";

import { buildEventGroups } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.utilities";

import { toTimelineRows } from "./calendar-timeline.utilities";

import type { EventGroupNode } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";

// Events can only build groups that hold some, so a group with none is handed the timeline by the tree builder.
vi.mock(
  import("../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.utilities"),
  async (importOriginal) => {
    const original = await importOriginal();

    return { ...original, buildEventGroups: vi.fn(original.buildEventGroups) };
  },
);

/**
 * The timeline's rows for a tree with empty groups among it, as the titles of the rows read.
 */
function listRowTitles(hideEmpty: boolean): {
  bars: number;
  counts: number[];
  titles: string[];
} {
  vi.mocked(buildEventGroups).mockReturnValueOnce([
    node("full", [record(0), record(1)]),
    node("empty", []),
    node("hollow", [], [node("hollow-a", []), node("hollow-b", [])]),
  ]);

  const rows = toTimelineRows([record(0), record(1)], [{ field: "year" }], {
    fields: [],
    hideEmpty,
  });
  const titles: string[] = [];

  for (const resource of rows.resources) {
    titles.push(resource.title);
  }

  return {
    bars: rows.events.length,
    counts: [...rows.counts.values()],
    titles,
  };
}

/**
 * A group of the tree, with the events it holds and its subgroups.
 */
function node(
  id: string,
  events: CalendarEventRecord[],
  children: EventGroupNode[] = [],
): EventGroupNode {
  return {
    children,
    count: events.length,
    events,
    id,
    key: id,
    label: id,
    level: 0,
    path: [id],
  };
}

/**
 * An event at a minute of an hour.
 */
function record(minute: number): CalendarEventRecord {
  const at = new Date(Date.UTC(2026, 2, 4, 0, minute));

  return {
    color: null,
    durationMinutes: 0,
    end: at,
    groups: [],
    id: `event-${String(minute)}`,
    name: `Event ${String(minute)}`,
    note: "",
    start: at,
    tags: [],
    timezone: "UTC",
  };
}

describe(toTimelineRows, () => {
  it("makes a row for every group, empty ones too, until asked", () => {
    const { titles } = listRowTitles(false);

    expect(titles).toStrictEqual(["full", "empty", "hollow"]);
  });

  it("leaves out the rows of groups with no events, so the rest pack", () => {
    const { bars, counts, titles } = listRowTitles(true);

    expect(titles).toStrictEqual(["full"]);
    expect(counts).toStrictEqual([2]);
    expect(bars).toBe(2);
  });

  it("colors the groups that stay as if the empty ones were there", () => {
    vi.mocked(buildEventGroups).mockReturnValueOnce([
      node("empty", []),
      node("full", [record(0)]),
    ]);

    const rows = toTimelineRows([record(0)], [{ field: "year" }], {
      fields: [],
      hideEmpty: true,
      tagColors: new Map([["full", "red"]]),
    });

    expect(rows.groups.get("/0:full")?.color).toBe("red");
    expect(rows.groups.has("/0:empty")).toBe(false);
  });

  it("lists every event on one row when ungrouped, hiding or not", () => {
    const rows = toTimelineRows([record(0)], [], {
      fields: [],
      hideEmpty: true,
    });

    expect(rows.resources).toHaveLength(1);
    expect(rows.events).toHaveLength(1);
  });
});
