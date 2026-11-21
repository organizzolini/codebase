import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@codebase/presentation";

import { CalendarViewOptions } from "./calendar-view-options";

import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// The options belong inside a dropdown menu, so each is drawn in one held open.
function OpenMenu(properties: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <DropdownMenu open>
      <DropdownMenuContent>{properties.children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function renderOptions(view: CalendarViewName): {
  onScaleChange: ReturnType<typeof vi.fn<(scale: TimelineScale) => void>>;
} {
  const onScaleChange = vi.fn<(scale: TimelineScale) => void>();

  render(
    <CalendarViewOptions
      onScaleChange={onScaleChange}
      scale="month"
      view={view}
    />,
    { wrapper: OpenMenu },
  );

  return { onScaleChange };
}

describe(CalendarViewOptions, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewOptions
        className="calendar-view-options"
        onScaleChange={() => {}}
        scale="month"
        view="timeline"
      />,
      { wrapper: OpenMenu },
    );

    expect(screen.getByTestId("calendar-view-options").className).toBe(
      "calendar-view-options",
    );
  });

  it.each(["agenda", "month", "week", "three-day", "day"] as const)(
    "has nothing to arrange in the %s view",
    (view) => {
      renderOptions(view);

      expect(screen.queryByTestId("calendar-view-options")).toBeNull();
      expect(screen.queryByText("Scale")).toBeNull();
    },
  );

  it("offers a scale in the timeline", () => {
    renderOptions("timeline");

    expect(screen.getByText("Scale")).toBeDefined();
  });

  it("picks the scale from its submenu", async () => {
    const { onScaleChange } = renderOptions("timeline");

    fireEvent.click(screen.getByText("Scale"));
    fireEvent.click(await screen.findByRole("button", { name: "Week" }));

    expect(onScaleChange).toHaveBeenCalledWith("week");
  });
});
