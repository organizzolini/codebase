import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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

  it("draws Page after Select, in the table only", () => {
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

    const names = screen
      .getAllByRole("group")
      .map((group) => group.getAttribute("aria-label"));

    expect(names.indexOf("Page")).toBe(names.indexOf("Select") + 1);
    expect(names.indexOf("Select")).toBeLessThan(names.indexOf("Group"));
  });
});
