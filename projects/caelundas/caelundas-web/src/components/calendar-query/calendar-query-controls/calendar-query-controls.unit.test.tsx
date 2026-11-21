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

  it("draws Group, Sort, then Filter in the timeline", () => {
    render(
      <CalendarQueryControls
        facets={FACETS}
        filter={undefined}
        grouping={[]}
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

    expect(names).toStrictEqual(["Group", "Sort", "Filter"]);
  });

  it("leaves Group out of a view that has no groups", () => {
    render(
      <CalendarQueryControls
        facets={FACETS}
        filter={undefined}
        grouping={[]}
        onFilterChange={() => {}}
        onGroupingChange={() => {}}
        onSortChange={() => {}}
        presets={[]}
        sort={undefined}
        view="week"
      />,
    );

    expect(screen.queryByRole("group", { name: "Group" })).toBeNull();
  });
});
