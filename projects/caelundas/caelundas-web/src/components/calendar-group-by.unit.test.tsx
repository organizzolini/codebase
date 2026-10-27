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
      { count: 1, depth: 1, id: "ingress", name: "Ingress", path: "Ingress" },
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

  it("changes the field of one level and keeps the others", async () => {
    const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[{ field: "tag:type" }, { field: "month" }]}
        onGroupingChange={onGroupingChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Group 2 by" }));
    fireEvent.click(await screen.findByRole("option", { name: /^Year/u }));

    expect(onGroupingChange).toHaveBeenCalledWith([
      { field: "tag:type" },
      { field: "year" },
    ]);
  });

  it("names what a level groups by", () => {
    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[{ field: "tag:type", tags: ["aspect", "major"] }]}
        onGroupingChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Group 1 tags" }).textContent,
    ).toBe("Aspect, Major Aspect");
  });

  it("picks the tags to group by from the tree, beside the field", async () => {
    const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[{ depth: 1, field: "tag:type" }]}
        onGroupingChange={onGroupingChange}
      />,
    );

    const tags = screen.getByRole("button", { name: "Group 1 tags" });

    expect(tags.textContent).toBe("First level");

    fireEvent.click(tags);
    fireEvent.click(await screen.findByRole("option", { name: /Aspect/u }));

    expect(onGroupingChange).toHaveBeenCalledWith([
      { field: "tag:type", tags: ["aspect"] },
    ]);
  });

  it("says which level of the tree an older link groups by", () => {
    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[{ depth: 2, field: "tag:type" }]}
        onGroupingChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Group 1 tags" }).textContent,
    ).toBe("Level 2");
  });

  it("offers no tags for a derived field", () => {
    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[{ field: "month" }]}
        onGroupingChange={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Group 1 tags" })).toBeNull();
  });

  it("counts the tags beyond the first two and skips any the data lacks", () => {
    render(
      <CalendarGroupBy
        facets={FACETS}
        grouping={[
          {
            field: "tag:type",
            tags: ["gone", "aspect", "major", "ingress"],
          },
        ]}
        onGroupingChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Group 1 tags" }).textContent,
    ).toBe("Aspect, Major Aspect +1");
  });
});
