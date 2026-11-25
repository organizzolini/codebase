import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarQueryControls } from "./calendar-query-controls";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
];

describe(CalendarQueryControls, () => {
  it("applies its class name", () => {
    render(
      <CalendarQueryControls
        className="calendar-query-controls"
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="timeline"
      />,
    );

    expect(screen.getByTestId("calendar-query-controls").className).toBe(
      "calendar-query-controls",
    );
  });

  it("draws View, Group, Sort, then Filter in the timeline", () => {
    render(
      <CalendarQueryControls
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="timeline"
      />,
    );

    const names = screen
      .getAllByRole("group")
      .map((group) => group.getAttribute("aria-label"));

    expect(names).toStrictEqual(["Saved view", "Group", "Sort", "Filter"]);
  });

  it("draws Group in every view, the month's only coloring events", () => {
    render(
      <CalendarQueryControls
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="week"
      />,
    );

    expect(screen.queryByRole("group", { name: "Group" })).not.toBeNull();
  });

  it("draws Select, for the table's columns, in the table only", () => {
    render(
      <CalendarQueryControls
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="table"
      />,
    );

    expect(screen.getByRole("group", { name: "Select" })).toBeDefined();
  });

  it("draws Select, Group, Sort and Filter, but no Page, in the Charts and Totals", () => {
    for (const view of ["charts", "totals"] as const) {
      const { unmount } = render(
        <CalendarQueryControls
          facets={FACETS}
          filter={undefined}
          grouping={[]}
          metrics={["EVENTS", "SPANS"]}
          onColumnsChange={() => {}}
          onFilterChange={() => {}}
          onGroupingChange={() => {}}
          onSortChange={() => {}}
          presets={[]}
          sort={undefined}
          view={view}
        />,
      );

      const names = screen
        .getAllByRole("group")
        .map((group) => group.getAttribute("aria-label"));

      expect(names).toStrictEqual([
        "Saved view",
        "Select",
        "Group",
        "Sort",
        "Filter",
      ]);
      expect(screen.getByRole("button", { name: "Spans" })).toBeDefined();

      unmount();
    }
  });

  it("writes a change of the metrics through its handler", async () => {
    const onMetricsChange =
      vi.fn<(metrics: readonly string[] | undefined) => void>();

    render(
      <CalendarQueryControls
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        metrics={["EVENTS", "SPANS"]}
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onMetricsChange={onMetricsChange}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="charts"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Spans options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onMetricsChange).toHaveBeenCalledWith(["EVENTS"]);
  });

  it("draws Layout, Display, View, then the rest, in that order", () => {
    render(
      <CalendarQueryControls
        display={
          <div
            aria-label="Display"
            role="group"
          />
        }
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        layout={
          <div
            aria-label="Layout"
            role="group"
          />
        }
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="table"
      />,
    );

    const names = screen
      .getAllByRole("group")
      .map((group) => group.getAttribute("aria-label"));

    expect(names.slice(0, 3)).toStrictEqual([
      "Layout",
      "Display",
      "Saved view",
    ]);
    expect(names.indexOf("Page")).toBe(3);
  });

  it("draws Page after View and before Select, in the table only", () => {
    render(
      <CalendarQueryControls
        display={
          <div
            aria-label="Display"
            role="group"
          />
        }
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        onColumnsChange={() => {}}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="table"
      />,
    );

    const names = screen
      .getAllByRole("group")
      .map((group) => group.getAttribute("aria-label"));

    expect(names.indexOf("Page")).toBe(names.indexOf("Saved view") + 1);
    expect(names.indexOf("Select")).toBe(names.indexOf("Page") + 1);
    expect(names.indexOf("Select")).toBeLessThan(names.indexOf("Group"));
  });
});
