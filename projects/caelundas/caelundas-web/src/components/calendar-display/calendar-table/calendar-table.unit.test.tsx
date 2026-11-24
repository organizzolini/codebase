import { act, fireEvent, render, screen } from "@testing-library/react";
import { use } from "react";
import { describe, expect, it, vi } from "vitest";

import { CalendarTable } from "./calendar-table";
import { TableGroupsProvider } from "./components/table-groups-provider/table-groups-provider";
import { TableGroupsContext } from "./components/table-groups-provider/table-groups-provider.constants";

import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";
import type { TableGroupsValue } from "./components/table-groups-provider/table-groups-provider.types";
import type { ReactNode } from "react";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 2, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
    ],
  },
];

function event(
  id: string,
  tag: Readonly<{ id: string; name: string }>,
): CalendarEventRecord {
  const at = new Date("2026-03-04T10:00:00.000Z");

  return {
    color: null,
    description: "",
    durationMinutes: 0,
    end: at,
    groups: [[{ key: tag.id, label: tag.name, path: tag.name }]],
    id,
    location: null,
    start: at,
    summary: `Event ${id}`,
    tags: [{ depth: 1, id: tag.id, name: tag.name, path: tag.name }],
    timezone: "UTC",
  };
}

const EVENTS = [
  event("a", { id: "aspect", name: "Aspect" }),
  event("b", { id: "aspect", name: "Aspect" }),
  event("c", { id: "ingress", name: "Ingress" }),
];

function renderTable(
  properties: Partial<Parameters<typeof CalendarTable>[0]> = {},
): void {
  render(
    <CalendarTable
      anchor={new Date("2026-03-01T12:00:00.000Z")}
      events={EVENTS}
      facets={FACETS}
      grouping={[]}
      onDateChange={() => {}}
      onNavigationChange={() => {}}
      timeZone="UTC"
      {...properties}
    />,
  );
}

describe(CalendarTable, () => {
  it("applies its class name", () => {
    render(
      <CalendarTable
        anchor={new Date("2026-03-01T12:00:00.000Z")}
        className="calendar-table"
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        onNavigationChange={() => {}}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("calendar-table").className).toBe(
      "calendar-table",
    );
  });

  it("heads the default columns and lists a row for each event", () => {
    renderTable();

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toStrictEqual(["Name", "Start", "End"]);
    expect(screen.getAllByTestId("table-event-row")).toHaveLength(3);
    expect(screen.queryByTestId("table-group-row")).toBeNull();
  });

  it("heads the columns the link names, in its order", () => {
    renderTable({ columns: ["end", "name"] });

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toStrictEqual(["End", "Name"]);
  });

  it("opens only the first group, and shows just the header of the rest", () => {
    renderTable({ grouping: [{ field: "tag:type" }] });

    expect(screen.getAllByTestId("table-group-row")).toHaveLength(2);
    expect(screen.getAllByTestId("table-event-row")).toHaveLength(2);
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toStrictEqual(["Group", "Name", "Start", "End"]);
    expect(
      screen
        .getByRole("button", { name: /Aspect/u })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: /Ingress/u })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("opens and closes a group when its header is pressed", () => {
    renderTable({ grouping: [{ field: "tag:type" }] });

    fireEvent.click(screen.getByRole("button", { name: /Ingress/u }));

    expect(screen.getAllByTestId("table-event-row")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: /Aspect/u }));

    expect(screen.getAllByTestId("table-event-row")).toHaveLength(1);
  });

  it("titles the days it lists to the toolbar", () => {
    const onNavigationChange = vi.fn();

    renderTable({ onNavigationChange });

    expect(onNavigationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "2026-03-01 – 2026-03-30" }),
    );
  });

  it("offers Show later only when it is given a way to", () => {
    const onShowLater = vi.fn();

    renderTable();

    expect(screen.queryByRole("button", { name: "Show later" })).toBeNull();

    renderTable({ onShowLater });
    fireEvent.click(screen.getByRole("button", { name: "Show later" }));

    expect(onShowLater).toHaveBeenCalledTimes(1);
  });

  describe("paging with the toolbar's shared state", () => {
    const many = Array.from({ length: 60 }, (_value, index) =>
      event(`m${String(index)}`, { id: "aspect", name: "Aspect" }),
    );
    const shared: { current: TableGroupsValue | undefined } = {
      current: undefined,
    };

    function Reader(): null {
      shared.current = use(TableGroupsContext);

      return null;
    }

    function tree(events: readonly CalendarEventRecord[]): ReactNode {
      return (
        <TableGroupsProvider>
          <Reader />
          <CalendarTable
            anchor={new Date("2026-03-01T12:00:00.000Z")}
            events={events}
            facets={FACETS}
            grouping={[]}
            onDateChange={() => {}}
            onNavigationChange={() => {}}
            timeZone="UTC"
          />
        </TableGroupsProvider>
      );
    }

    it("renders more rows when pages are loaded, a page of each list's events at a time", () => {
      render(tree(many));

      expect(screen.getAllByTestId("table-event-row")).toHaveLength(25);

      act(() => {
        shared.current?.dispatch({ pages: 2, type: "set-pages" });
      });

      expect(screen.getAllByTestId("table-event-row")).toHaveLength(50);

      act(() => {
        shared.current?.dispatch({ pages: 3, type: "set-pages" });
      });

      expect(screen.getAllByTestId("table-event-row")).toHaveLength(60);
    });

    it("keeps the pages loaded when it draws again with the same data made anew", () => {
      const { rerender } = render(tree(many));

      act(() => {
        shared.current?.dispatch({ pages: 2, type: "set-pages" });
      });
      rerender(tree([...many]));
      rerender(tree(many.map((record) => ({ ...record }))));

      expect(shared.current?.state.pages).toBe(2);
      expect(screen.getAllByTestId("table-event-row")).toHaveLength(50);
    });

    it("starts over at the first page when the events really change", () => {
      const { rerender } = render(tree(many));

      act(() => {
        shared.current?.dispatch({ pages: 2, type: "set-pages" });
      });
      rerender(tree(many.slice(0, 40)));

      expect(shared.current?.state.pages).toBe(1);
      expect(screen.getAllByTestId("table-event-row")).toHaveLength(25);
    });

    it("tells the toolbar how big the lists are and how much shows", () => {
      render(tree(many));

      expect(shared.current?.state.stats).toStrictEqual({
        longest: 60,
        shown: 25,
        total: 60,
      });
    });
  });
});
