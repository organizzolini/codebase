import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarGroupBy } from "./calendar-group-by";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
      {
        count: 1,
        depth: 2,
        id: "major",
        name: "Major Aspect",
        path: "Aspect / Major Aspect",
      },
    ],
  },
];

describe(CalendarGroupBy, () => {
  it("applies its class name", () => {
    render(
      <CalendarGroupBy
        className="calendar-group-by"
        facets={FACETS}
        grouping={[]}
        onGroupingChange={() => {}}
      />,
    );

    expect(screen.getByTestId("calendar-group-by").className).toBe(
      "calendar-group-by",
    );
  });

  it("adds a first group by the first field", () => {
    const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[]}
        onGroupingChange={onGroupingChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add group" }));

    expect(onGroupingChange).toHaveBeenCalledWith([
      { depth: 1, field: "tag:type" },
    ]);
  });

  it("changes one level of the grouping and keeps the others", () => {
    const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[{ field: "tag:type" }, { field: "month" }]}
        onGroupingChange={onGroupingChange}
      />,
    );

    const depth = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Group 1 depth",
    });

    expect(depth.value).toBe("1");

    fireEvent.change(depth, { target: { value: "2" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Group 2 by" }), {
      target: { value: "year" },
    });

    expect(onGroupingChange).toHaveBeenNthCalledWith(1, [
      { depth: 2, field: "tag:type" },
      { field: "month" },
    ]);
    expect(onGroupingChange).toHaveBeenNthCalledWith(2, [
      { field: "tag:type" },
      { field: "year" },
    ]);
  });
});
