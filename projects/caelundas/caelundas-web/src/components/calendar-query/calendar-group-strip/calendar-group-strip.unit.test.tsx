import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarGroupStrip } from "./calendar-group-strip";

import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
];

const TYPE: EventGroupLevel = { depth: 1, field: "tag:type" };

function renderStrip(grouping: EventGroupLevel[] = []): {
  onGroupingChange: ReturnType<
    typeof vi.fn<(grouping: EventGroupLevel[]) => void>
  >;
} {
  const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();

  render(
    <CalendarGroupStrip
      facets={FACETS}
      grouping={grouping}
      onGroupingChange={onGroupingChange}
      view="timeline"
    />,
  );

  return { onGroupingChange };
}

describe(CalendarGroupStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarGroupStrip
        className="calendar-group-strip"
        facets={FACETS}
        grouping={[]}
        onGroupingChange={() => {}}
        view="timeline"
      />,
    );

    expect(screen.getByTestId("calendar-group-strip").className).toBe(
      "calendar-group-strip",
    );
  });

  it("draws one chip per level, in order, joined to the Group button", () => {
    renderStrip([TYPE]);

    const group = screen.getByRole("group", { name: "Group" });

    expect(group.textContent).toBe("GroupType");
  });

  it("takes a level out with its chip", () => {
    const { onGroupingChange } = renderStrip([TYPE]);

    fireEvent.click(
      screen.getByRole("button", { name: "Stop grouping by Type" }),
    );

    expect(onGroupingChange).toHaveBeenCalledWith([]);
  });

  it("adds a level from the searchable list", async () => {
    const { onGroupingChange } = renderStrip();

    fireEvent.click(screen.getByRole("button", { name: "Group" }));
    fireEvent.click(await screen.findByText("Type"));

    expect(onGroupingChange).toHaveBeenCalledWith([TYPE]);
  });

  it.each(["month", "week", "three-day", "day"] as const)(
    "draws nothing in the %s view, which has no groups",
    (view) => {
      render(
        <CalendarGroupStrip
          facets={FACETS}
          grouping={[]}
          onGroupingChange={() => {}}
          view={view}
        />,
      );

      expect(screen.queryByTestId("calendar-group-strip")).toBeNull();
    },
  );
});
