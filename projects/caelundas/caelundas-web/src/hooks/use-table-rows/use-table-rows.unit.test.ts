import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
  UNPROVIDED_TABLE_GROUPS,
} from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { buildEventGroups } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.utilities";

import { useTableRows } from "./use-table-rows";

import type { TableGroupsAction } from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { CalendarEventRecord } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupNode } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { UseTableRowsOptions } from "./use-table-rows.types";
import type { ReactNode } from "react";

// Events can only build groups that hold some, so a group with none is handed the table by the tree builder.
vi.mock(
  import("../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.utilities"),
  async (importOriginal) => {
    const original = await importOriginal();

    return { ...original, buildEventGroups: vi.fn(original.buildEventGroups) };
  },
);

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

function record(index: number): CalendarEventRecord {
  const at = new Date(Date.UTC(2026, 2, 4, 0, index));

  return {
    color: null,
    durationMinutes: 0,
    end: at,
    groups: [],
    id: `event-${String(index)}`,
    name: `Event ${String(index)}`,
    note: "",
    start: at,
    tags: [],
    timezone: "UTC",
  };
}

const EVENTS = Array.from({ length: 250 }, (_value, index) => record(index));
const OPTIONS: UseTableRowsOptions = {
  anchor: new Date("2026-03-01T12:00:00.000Z"),
  dayCount: 30,
  events: EVENTS,
  facets: [],
  fields: [],
  grouping: [],
  sort: undefined,
  timeZone: "UTC",
};

describe(useTableRows, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useTableRows(OPTIONS));

    expect(result.current).toStrictEqual({
      levelIcons: expect.any(Array) as unknown[],
      more: expect.any(Function) as () => void,
      rows: expect.any(Array) as unknown[],
      toggle: expect.any(Function) as () => void,
    });
  });

  it("shows a page of events and a row to show the rest", () => {
    const { result } = renderHook(() => useTableRows(OPTIONS));

    expect(result.current.rows).toHaveLength(101);
    expect(result.current.rows.at(-1)).toStrictEqual({
      depth: 0,
      groupId: "flat",
      id: "flat|more",
      kind: "more",
      next: 100,
      remaining: 150,
      shown: 100,
      total: 250,
    });
  });

  it("shows another page when more is asked of the list", () => {
    const { result } = renderHook(() => useTableRows(OPTIONS));

    act(() => {
      result.current.more("flat", 100);
    });

    expect(result.current.rows).toHaveLength(201);
  });

  it("starts the pages over when the events change", () => {
    const { rerender, result } = renderHook(
      (options: UseTableRowsOptions) => useTableRows(options),
      { initialProps: OPTIONS },
    );

    act(() => {
      result.current.more("flat", 100);
    });
    rerender({ ...OPTIONS, events: EVENTS.slice(0, 150) });

    expect(result.current.rows).toHaveLength(101);
  });

  it("leaves the state to a provider, and tells it the groups and what shows", () => {
    const dispatch = vi.fn<(action: TableGroupsAction) => void>();
    const { result } = renderHook(() => useTableRows(OPTIONS), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(
          TableGroupsContext,
          {
            value: { ...UNPROVIDED_TABLE_GROUPS, dispatch, provided: true },
          },
          children,
        ),
    });

    act(() => {
      result.current.toggle("a");
    });

    expect(dispatch).toHaveBeenCalledWith({ id: "a", type: "toggle" });
    // The first groups are registered, so groups opened on the same ids elsewhere stay open.
    expect(dispatch).toHaveBeenCalledWith({
      firstPath: [],
      groupIds: [],
      groupLevels: [],
      type: "register",
    });
    expect(dispatch).toHaveBeenCalledWith({
      stats: { longest: 250, shown: 100, total: 250 },
      type: "set-stats",
    });
  });

  it("starts over the groups for new data, and registers the same data again", () => {
    const dispatch = vi.fn<(action: TableGroupsAction) => void>();
    const { rerender } = renderHook(
      (options: UseTableRowsOptions) => useTableRows(options),
      {
        initialProps: OPTIONS,
        wrapper: ({ children }: { children: ReactNode }) =>
          createElement(
            TableGroupsContext,
            {
              value: { ...UNPROVIDED_TABLE_GROUPS, dispatch, provided: true },
            },
            children,
          ),
      },
    );

    rerender({ ...OPTIONS, dayCount: 29 });

    const types = dispatch.mock.calls
      .map(([action]) => action.type)
      .filter((type) => type === "register" || type === "reset");

    expect(types).toStrictEqual(["register", "reset"]);
  });

  it("shows the pages and the page size a provider holds", () => {
    const { result } = renderHook(() => useTableRows(OPTIONS), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(
          TableGroupsContext,
          {
            value: {
              ...UNPROVIDED_TABLE_GROUPS,
              provided: true,
              state: { ...INITIAL_TABLE_GROUPS, limit: 10, pages: 2 },
            },
          },
          children,
        ),
    });

    expect(
      result.current.rows.filter((row) => row.kind === "event"),
    ).toHaveLength(20);
  });

  describe("hiding empty groups", () => {
    const grouped: UseTableRowsOptions = {
      ...OPTIONS,
      grouping: [{ field: "year" }],
    };

    /**
     * The ids of the group rows, in order.
     */
    function listGroupRows(options: UseTableRowsOptions): string[] {
      vi.mocked(buildEventGroups).mockReturnValueOnce([
        node("full", [record(0), record(1)]),
        node("empty", []),
        node("hollow", [], [node("hollow-a", []), node("hollow-b", [])]),
      ]);

      const { result } = renderHook(() => useTableRows(options));

      return result.current.rows.flatMap((row) =>
        row.kind === "group" ? [row.id] : [],
      );
    }

    it("shows every group, empty ones too, until asked", () => {
      expect(listGroupRows(grouped)).toStrictEqual(["full", "empty", "hollow"]);
    });

    it("leaves out the groups with no events, and those with only empty subgroups", () => {
      expect(listGroupRows({ ...grouped, hideEmpty: true })).toStrictEqual([
        "full",
      ]);
    });
  });
});
