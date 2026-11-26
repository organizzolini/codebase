import { describe, expect, it, vi } from "vitest";

import { ALL_MENUS } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.constants";

import {
  createTableNavigation,
  getCellText,
  getColumnWidth,
  getTableWidth,
  getTagCellEntries,
  listTableEvents,
  resolveColumns,
  toggleExpanded,
  toTableRows,
} from "./calendar-table.utilities";
import {
  countGroupValues,
  getGroupCounts,
  listFirstPath,
  listGroupIds,
  listGroupLevels,
  toListStats,
  toResetKey,
} from "./table-groups.utilities";

import type {
  EventGroupField,
  EventGroupNode,
} from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";
import type { TableColumn } from "./calendar-table.types";

function group(
  id: string,
  options: Readonly<{
    children?: EventGroupNode[];
    events?: CalendarEventRecord[];
  }>,
): EventGroupNode {
  const events = options.events ?? [];

  return {
    children: options.children ?? [],
    count: events.length,
    events,
    id,
    key: id,
    label: id,
    level: 0,
    path: [id],
  };
}

function record(id: string, start: string): CalendarEventRecord {
  const at = new Date(start);

  return {
    color: null,
    durationMinutes: 0,
    end: new Date(at.getTime() + 3_600_000),
    groups: [],
    id,
    name: `Event ${id}`,
    note: "",
    start: at,
    tags: [
      { depth: 0, id: "aspect", name: "Aspect", path: "Aspect" },
      { depth: 1, id: "simple", name: "Simple", path: "Aspect / Simple" },
      {
        depth: 2,
        id: "major",
        name: "Major",
        path: "Aspect / Simple / Major",
      },
    ],
    timezone: "UTC",
  };
}

const FIELDS: EventGroupField[] = [
  {
    description: "",
    id: "tag:aspect",
    label: "Aspect",
    levels: [],
    menus: ALL_MENUS,
    nodes: [
      {
        count: 1,
        depth: 1,
        id: "simple",
        name: "Simple",
        parentId: null,
        path: "Simple",
      },
    ],
    options: [],
    values: [],
  },
];
const TAG_COLUMN: TableColumn = {
  id: "tag:aspect",
  kind: "tag",
  label: "Aspect",
  prefix: "Aspect",
};

describe("calendar-table utilities", () => {
  describe(getCellText, () => {
    const event = record("a", "2026-03-04T10:00:00.000Z");

    it("shows an event's name", () => {
      expect(
        getCellText(event, { id: "name", kind: "name", label: "Name" }, "UTC"),
      ).toBe("Event a");
    });

    it("writes the duration in its largest units, or Instant when it lasts no time", () => {
      const duration = {
        id: "duration",
        kind: "duration",
        label: "Duration",
      } as const;

      expect(
        getCellText({ ...event, durationMinutes: 60 }, duration, "UTC"),
      ).toBe("1 h");
      expect(
        getCellText({ ...event, durationMinutes: 200 }, duration, "UTC"),
      ).toBe("3 h 20 min");
      expect(
        getCellText({ ...event, durationMinutes: 0 }, duration, "UTC"),
      ).toBe("Instant");
    });

    it("writes the start and end in the data's zone", () => {
      const start = getCellText(
        event,
        { id: "start", kind: "start", label: "Start" },
        "UTC",
      );
      const end = getCellText(
        event,
        { id: "end", kind: "end", label: "End" },
        "UTC",
      );
      const eastern = getCellText(
        event,
        { id: "start", kind: "start", label: "Start" },
        "America/New_York",
      );

      expect(start).toBe("Mar 4, 2026, 10:00 AM");
      expect(end).toBe("Mar 4, 2026, 11:00 AM");
      expect(eastern).toBe("Mar 4, 2026, 5:00 AM");
    });

    it("names the tags beneath a tag column's path, by their path past it", () => {
      expect(getCellText(event, TAG_COLUMN, "UTC")).toBe(
        "Simple, Simple / Major",
      );
      expect(
        getCellText(event, { ...TAG_COLUMN, prefix: "Aspect / Simple" }, "UTC"),
      ).toBe("Major");
    });

    it("shows nothing when the event has no tag there", () => {
      expect(getCellText(event, { ...TAG_COLUMN, prefix: "Body" }, "UTC")).toBe(
        "",
      );
    });
  });

  describe(resolveColumns, () => {
    it("is the name and times when no ids are given", () => {
      expect(
        resolveColumns(undefined, FIELDS).map((column) => column.id),
      ).toStrictEqual(["name", "start", "end"]);
      expect(
        resolveColumns([], FIELDS).map((column) => column.id),
      ).toStrictEqual(["name", "start", "end"]);
    });

    it("keeps the order of the ids and names a tag root or a tag", () => {
      expect(
        resolveColumns(["simple", "tag:aspect", "end"], FIELDS),
      ).toStrictEqual([
        {
          id: "simple",
          kind: "tag",
          label: "Aspect › Simple",
          name: "Simple",
          prefix: "Aspect / Simple",
        },
        TAG_COLUMN,
        {
          icon: "calendar-arrow-up",
          id: "end",
          kind: "end",
          label: "End",
        },
      ]);
    });

    it("leaves out an id the data does not have", () => {
      expect(
        resolveColumns(["gone", "name"], FIELDS).map((column) => column.id),
      ).toStrictEqual(["name"]);
    });
  });

  describe(toTableRows, () => {
    const early = record("early", "2026-03-01T10:00:00.000Z");
    const late = record("late", "2026-03-09T10:00:00.000Z");

    it("lists the events by start when there are no groups", () => {
      const rows = toTableRows([], [late, early], { expanded: new Set() });

      expect(rows.map((row) => row.id)).toStrictEqual(["early", "late"]);
      expect(rows.every((row) => row.kind === "event" && row.depth === 0)).toBe(
        true,
      );
    });

    it("lists each group, then its events one deeper", () => {
      const rows = toTableRows(
        [group("a", { events: [early] }), group("b", { events: [late] })],
        [early, late],
        { expanded: new Set(["a", "b"]) },
      );

      expect(rows.map((row) => [row.kind, row.depth, row.id])).toStrictEqual([
        ["group", 0, "a"],
        ["event", 1, "a|early"],
        ["group", 0, "b"],
        ["event", 1, "b|late"],
      ]);
    });

    it("lists the sub-groups of a group, depth first, in order", () => {
      const rows = toTableRows(
        [
          group("a", {
            children: [
              group("a1", { events: [early] }),
              group("a2", { events: [late] }),
            ],
          }),
        ],
        [early, late],
        { expanded: new Set(["a", "a1", "a2"]) },
      );

      expect(rows.map((row) => row.id)).toStrictEqual([
        "a",
        "a1",
        "a1|early",
        "a2",
        "a2|late",
      ]);
      expect(rows.map((row) => row.depth)).toStrictEqual([0, 1, 2, 1, 2]);
    });

    it("adds only the header of a group that is not open, and no row beneath it", () => {
      const rows = toTableRows(
        [group("a", { events: [early] }), group("b", { events: [late] })],
        [early, late],
        { expanded: new Set(["b"]) },
      );

      expect(rows.map((row) => row.id)).toStrictEqual(["a", "b", "b|late"]);
      expect(rows[0]).toMatchObject({ expanded: false, kind: "group" });
    });
  });

  describe(createTableNavigation, () => {
    const navigation = {
      anchor: new Date("2026-03-01T12:00:00.000Z"),
      dayCount: 30,
      timeZone: "UTC",
    };

    it("titles the days listed, the last one included", () => {
      expect(
        createTableNavigation({ ...navigation, onDateChange: () => {} }).title,
      ).toBe("2026-03-01 – 2026-03-30");
    });

    it("steps a period forward and back from the first day", () => {
      const onDateChange = vi.fn<(date: Date) => void>();
      const stepped = createTableNavigation({ ...navigation, onDateChange });

      stepped.next();
      stepped.prev();

      expect(
        onDateChange.mock.calls.map(([date]) => date.toISOString()),
      ).toStrictEqual(["2026-03-31T12:00:00.000Z", "2026-01-30T12:00:00.000Z"]);
    });

    it("goes to today", () => {
      const onDateChange = vi.fn<(date: Date) => void>();

      createTableNavigation({ ...navigation, onDateChange }).today();

      expect(onDateChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("paging", () => {
    const many = Array.from({ length: 60 }, (_value, index) =>
      record(
        `e${String(index)}`,
        `2026-03-04T10:${String(index).padStart(2, "0")}:00.000Z`,
      ),
    );

    it("shows a page of an ungrouped list, then a row for the rest", () => {
      const rows = toTableRows([], many, {
        expanded: new Set(),
        limit: 25,
      });

      expect(rows).toHaveLength(26);
      expect(rows.at(-1)).toStrictEqual({
        depth: 0,
        groupId: "flat",
        id: "flat|more",
        kind: "more",
        next: 25,
        remaining: 35,
        shown: 25,
        total: 60,
      });
    });

    it("numbers each event by its place in its list, from 1", () => {
      const rows = toTableRows(
        [
          group("a", { events: many.slice(0, 3) }),
          group("b", { events: many.slice(3, 5) }),
        ],
        many,
        { expanded: new Set(["a", "b"]) },
      );

      expect(
        rows.flatMap((row) => (row.kind === "event" ? [row.position] : [])),
      ).toStrictEqual([1, 2, 3, 1, 2]);
    });

    it("continues the numbers across the pages loaded", () => {
      const rows = toTableRows([], many, {
        expanded: new Set(),
        limit: 10,
        pages: 2,
      });

      expect(
        rows.flatMap((row) => (row.kind === "event" ? [row.position] : [])),
      ).toStrictEqual(Array.from({ length: 20 }, (_value, index) => index + 1));
    });

    it("shows what a list's limit allows, and no row when all show", () => {
      const rows = toTableRows([], many, {
        expanded: new Set(),
        limits: new Map([["flat", 60]]),
      });

      expect(rows).toHaveLength(60);
      expect(rows.every((row) => row.kind === "event")).toBe(true);
    });

    it("pages each leaf group by itself, the row at the depth of its events", () => {
      const rows = toTableRows(
        [
          group("a", { events: many.slice(0, 30) }),
          group("b", { events: many.slice(30, 60) }),
        ],
        many,
        { expanded: new Set(["a", "b"]), limit: 25 },
      );
      const more = rows.filter((row) => row.kind === "more");

      expect(more).toStrictEqual([
        {
          depth: 1,
          groupId: "a",
          id: "a|more",
          kind: "more",
          next: 5,
          remaining: 5,
          shown: 25,
          total: 30,
        },
        {
          depth: 1,
          groupId: "b",
          id: "b|more",
          kind: "more",
          next: 5,
          remaining: 5,
          shown: 25,
          total: 30,
        },
      ]);
      expect(rows.filter((row) => row.kind === "event")).toHaveLength(50);
    });

    it("pages the leaves of nested groups, not the groups holding them", () => {
      const rows = toTableRows(
        [group("a", { children: [group("a1", { events: many })] })],
        many,
        { expanded: new Set(["a", "a1"]), limit: 25 },
      );

      expect(
        rows.map((row) => row.kind).filter((kind) => kind !== "event"),
      ).toStrictEqual(["group", "group", "more"]);
      expect(rows.at(-1)).toMatchObject({
        depth: 2,
        groupId: "a1",
        remaining: 35,
      });
    });

    it("shows the pages loaded for every list, or what a list loaded itself, whichever is more", () => {
      const grouped = [
        group("a", { events: many.slice(0, 30) }),
        group("b", { events: many.slice(30, 60) }),
      ];
      const rows = toTableRows(grouped, many, {
        expanded: new Set(["a", "b"]),
        limit: 10,
        limits: new Map([["b", 20]]),
        pages: 2,
      });

      expect(rows.filter((row) => row.kind === "event")).toHaveLength(40);
      expect(rows.filter((row) => row.kind === "more")).toMatchObject([
        { groupId: "a", next: 10, remaining: 10, shown: 20 },
        { groupId: "b", next: 10, remaining: 10, shown: 20 },
      ]);
    });

    it("loads what is left when it is less than a page", () => {
      const rows = toTableRows([], many.slice(0, 30), {
        expanded: new Set(),
        limit: 25,
      });

      expect(rows.at(-1)).toMatchObject({ next: 5, remaining: 5 });
    });
  });

  describe(toggleExpanded, () => {
    it("opens a closed group and closes an open one, leaving the input as it was", () => {
      const none = new Set<string>();
      const open = toggleExpanded(none, "a");

      expect([...open]).toStrictEqual(["a"]);
      expect([...toggleExpanded(open, "a")]).toStrictEqual([]);
      expect(none.size).toBe(0);
    });
  });

  describe(listFirstPath, () => {
    it("is the first group at each level, down the first branch", () => {
      const path = listFirstPath([
        group("a", {
          children: [
            group("a1", { children: [group("a1x", {}), group("a1y", {})] }),
            group("a2", {}),
          ],
        }),
        group("b", { children: [group("b1", {})] }),
      ]);

      expect(path).toStrictEqual(["a", "a1", "a1x"]);
    });

    it("is empty when there are no groups", () => {
      expect(listFirstPath([])).toStrictEqual([]);
    });
  });

  describe(listTableEvents, () => {
    it("keeps only the events in the range, in the order given", () => {
      const listed = listTableEvents({
        anchor: new Date("2026-03-01T12:00:00.000Z"),
        dayCount: 30,
        events: [
          record("late", "2026-03-09T10:00:00.000Z"),
          record("early", "2026-03-01T10:00:00.000Z"),
          record("outside", "2027-01-01T10:00:00.000Z"),
        ],
        timeZone: "UTC",
      });

      expect(listed.map((event) => event.id)).toStrictEqual(["late", "early"]);
    });
  });

  describe(listGroupIds, () => {
    it("names every group at every level, so a group inside a closed one counts", () => {
      const ids = listGroupIds([
        group("b", {}),
        group("a", { children: [group("a1", {}), group("a2", {})] }),
      ]);

      expect(ids).toStrictEqual(["a", "a1", "a2", "b"]);
    });

    it("is empty when there are no groups", () => {
      expect(listGroupIds([])).toStrictEqual([]);
    });
  });

  describe(listGroupLevels, () => {
    it("gives each group's level in the order of the sorted ids", () => {
      const inner = { ...group("a1", {}), level: 1 };

      expect(
        listGroupLevels([group("b", {}), group("a", { children: [inner] })]),
      ).toStrictEqual([0, 1, 0]);
    });
  });

  describe(getTagCellEntries, () => {
    const event = record("a", "2026-03-04T10:00:00.000Z");

    it("lists the tags beneath a path, not the tag at it", () => {
      expect(getTagCellEntries(event, "Aspect / Simple")).toStrictEqual([
        { id: "major", label: "Major" },
      ]);
    });

    it("is empty when no tag lies beneath the path", () => {
      expect(getTagCellEntries(event, "Body")).toStrictEqual([]);
    });
  });

  describe(toListStats, () => {
    const many = Array.from({ length: 5 }, (_value, index) =>
      record(`e${String(index)}`, "2026-03-04T10:00:00.000Z"),
    );

    it("counts an ungrouped list as the whole table", () => {
      const rows = toTableRows([], many, { expanded: new Set(), limit: 2 });

      expect(toListStats([], many, rows)).toStrictEqual({
        longest: 5,
        shown: 2,
        total: 5,
      });
    });

    it("sums the leaf lists, and takes the longest of them", () => {
      const groups = [
        group("a", {
          children: [
            group("a1", { events: many.slice(0, 3) }),
            group("a2", { events: many.slice(3) }),
          ],
        }),
        group("b", { events: many.slice(0, 1) }),
      ];
      const rows = toTableRows(groups, many, {
        expanded: new Set(["a", "a1", "a2", "b"]),
      });

      expect(toListStats(groups, many, rows)).toStrictEqual({
        longest: 3,
        shown: 6,
        total: 6,
      });
    });

    it("shows no rows for a group that is not open", () => {
      const groups = [group("a", { events: many })];
      const rows = toTableRows(groups, many, { expanded: new Set() });

      expect(toListStats(groups, many, rows).shown).toBe(0);
    });
  });

  describe(toResetKey, () => {
    const data = {
      anchor: new Date("2026-03-01T12:00:00.000Z"),
      dayCount: 30,
      grouping: [{ field: "tag:type" }],
      idsKey: "a",
      listed: [record("a", "2026-03-04T10:00:00.000Z")],
      sort: undefined,
      timeZone: "UTC",
    };

    it("is the same for the same data made anew", () => {
      expect(
        toResetKey({
          ...data,
          anchor: new Date(data.anchor),
          grouping: [{ field: "tag:type" }],
          listed: [record("a", "2026-03-04T10:00:00.000Z")],
        }),
      ).toBe(toResetKey(data));
    });

    it("differs when the days, grouping, sort, zone, groups or events differ", () => {
      const key = toResetKey(data);

      expect(toResetKey({ ...data, dayCount: 7 })).not.toBe(key);
      expect(toResetKey({ ...data, grouping: [] })).not.toBe(key);
      expect(
        toResetKey({ ...data, sort: [{ direction: "asc", key: "name" }] }),
      ).not.toBe(key);
      expect(toResetKey({ ...data, timeZone: "America/New_York" })).not.toBe(
        key,
      );
      expect(toResetKey({ ...data, idsKey: "a|b" })).not.toBe(key);
      expect(toResetKey({ ...data, listed: [] })).not.toBe(key);
    });
  });

  describe(countGroupValues, () => {
    const node = group("g", {
      events: [
        record("a", "2026-03-04T10:00:00.000Z"),
        record("b", "2026-03-04T10:00:00.000Z"),
        record("c", "2026-03-05T10:00:00.000Z"),
      ],
    });

    it("is the group's own count for the name column, and none for the group column", () => {
      expect(
        countGroupValues(
          { ...node, count: 3 },
          { id: "name", kind: "name", label: "Name" },
          "UTC",
        ),
      ).toBe(3);
      expect(
        countGroupValues(
          node,
          { id: "group", kind: "group", label: "Group" },
          "UTC",
        ),
      ).toBe(0);
    });

    it("counts the distinct times of the events in the zone", () => {
      expect(
        countGroupValues(
          node,
          { id: "start", kind: "start", label: "Start" },
          "UTC",
        ),
      ).toBe(2);
    });

    it("counts the distinct tags beneath a tag column's path, none for a path with no tag", () => {
      expect(countGroupValues(node, TAG_COLUMN, "UTC")).toBe(2);
      expect(
        countGroupValues(node, { ...TAG_COLUMN, prefix: "Body" }, "UTC"),
      ).toBe(0);
    });
  });

  describe(getGroupCounts, () => {
    it("says a count for each column, in order", () => {
      const node = group("g", {
        events: [record("a", "2026-03-04T10:00:00.000Z")],
      });

      expect(
        getGroupCounts(
          { ...node, count: 1 },
          [
            { id: "group", kind: "group", label: "Group" },
            { id: "name", kind: "name", label: "Name" },
            { id: "start", kind: "start", label: "Start" },
          ],
          "UTC",
        ),
      ).toStrictEqual([0, 1, 1]);
    });
  });

  describe(getColumnWidth, () => {
    it("gives each kind of column its width in rem", () => {
      expect(
        getColumnWidth({
          icon: "hash",
          id: "number",
          kind: "number",
          label: "#",
        }),
      ).toBe("4rem");
    });
  });

  describe(getTableWidth, () => {
    it("fills the room, or adds the columns' widths up if more", () => {
      expect(
        getTableWidth([
          { icon: "hash", id: "number", kind: "number", label: "#" },
          { icon: "text", id: "name", kind: "name", label: "Name" },
        ]),
      ).toBe("max(100%, 24rem)");
    });
  });
});
