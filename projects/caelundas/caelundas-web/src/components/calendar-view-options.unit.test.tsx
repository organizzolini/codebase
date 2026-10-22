import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@codebase/presentation";

import { CalendarViewOptions } from "./calendar-view-options";

import type {
  CalendarViewName,
  TimelineScale,
} from "../lib/calendar/calendar-views";
import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";
import type { ReactNode } from "react";

const FACETS = [
  {
    id: "type",
    name: "Type",
    values: [
      { count: 1, depth: 1, id: "aspect", name: "Aspect", path: "Aspect" },
    ],
  },
];

// The options belong inside a dropdown menu, so each is drawn in one held open.
function OpenMenu(properties: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <DropdownMenu open>
      <DropdownMenuContent>{properties.children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function renderOptions(
  view: CalendarViewName,
  grouping: EventGroupLevel[] = [],
): {
  onGroupingChange: ReturnType<
    typeof vi.fn<(grouping: EventGroupLevel[]) => void>
  >;
  onScaleChange: ReturnType<typeof vi.fn<(scale: TimelineScale) => void>>;
} {
  const onGroupingChange = vi.fn<(grouping: EventGroupLevel[]) => void>();
  const onScaleChange = vi.fn<(scale: TimelineScale) => void>();

  render(
    <CalendarViewOptions
      facets={FACETS}
      grouping={grouping}
      onGroupingChange={onGroupingChange}
      onScaleChange={onScaleChange}
      scale="month"
      view={view}
    />,
    { wrapper: OpenMenu },
  );

  return { onGroupingChange, onScaleChange };
}

describe(CalendarViewOptions, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewOptions
        className="calendar-view-options"
        facets={FACETS}
        grouping={[]}
        onGroupingChange={() => {}}
        onScaleChange={() => {}}
        scale="month"
        view="agenda"
      />,
      { wrapper: OpenMenu },
    );

    expect(screen.getByTestId("calendar-view-options").className).toBe(
      "calendar-view-options",
    );
  });

  it.each(["month", "week", "three-day", "day"] as const)(
    "has nothing to arrange in the %s view",
    (view) => {
      renderOptions(view);

      expect(screen.queryByTestId("calendar-view-options")).toBeNull();
      expect(screen.queryByText(/^Group by/u)).toBeNull();
      expect(screen.queryByText("Scale")).toBeNull();
    },
  );

  it("offers grouping, but no scale, in the agenda", () => {
    renderOptions("agenda");

    expect(screen.getByText("Group by: none")).toBeDefined();
    expect(screen.queryByText("Scale")).toBeNull();
  });

  it("names the grouping on its submenu", () => {
    renderOptions("agenda", [{ depth: 1, field: "tag:type" }]);

    expect(screen.getByText("Group by: Type")).toBeDefined();
  });

  it("offers grouping and a scale in the timeline", () => {
    renderOptions("timeline");

    expect(screen.getByText("Group by: none")).toBeDefined();
    expect(screen.getByText("Scale")).toBeDefined();
  });

  it("edits the grouping from its submenu", async () => {
    const { onGroupingChange } = renderOptions("agenda");

    fireEvent.click(screen.getByText("Group by: none"));
    fireEvent.click(await screen.findByRole("button", { name: "Add group" }));

    expect(onGroupingChange).toHaveBeenCalledWith([
      { depth: 1, field: "tag:type" },
    ]);
  });

  it("picks the scale from its submenu", async () => {
    const { onScaleChange } = renderOptions("timeline");

    fireEvent.click(screen.getByText("Scale"));
    fireEvent.click(await screen.findByRole("button", { name: "Week" }));

    expect(onScaleChange).toHaveBeenCalledWith("week");
  });
});
