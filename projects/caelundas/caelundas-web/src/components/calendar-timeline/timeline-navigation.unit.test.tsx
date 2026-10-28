import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Gantt } from "@codebase/presentation";

import { TimelineNavigation } from "./timeline-navigation";

import type { CalendarNavigation } from "../calendar-navigation-group/calendar-navigation-group.types";
import type { ReactNode } from "react";

/**
 * The Gantt the navigation reads its own from.
 */
function GanttWrapper(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  return (
    <Gantt
      date={new Date("2026-03-01T12:00:00.000Z")}
      events={[]}
      resources={[]}
    >
      {properties.children}
    </Gantt>
  );
}

function renderNavigation(
  onNavigationChange: (navigation: CalendarNavigation) => void,
): void {
  render(
    <Gantt
      date={new Date("2026-03-01T12:00:00.000Z")}
      events={[]}
      resources={[]}
    >
      <TimelineNavigation
        className="timeline-navigation"
        onNavigationChange={onNavigationChange}
      />
    </Gantt>,
  );
}

describe(TimelineNavigation, () => {
  it("applies its class name", () => {
    render(
      <TimelineNavigation
        className="timeline-navigation"
        onNavigationChange={vi.fn<(navigation: CalendarNavigation) => void>()}
      />,
      { wrapper: GanttWrapper },
    );

    expect(screen.getByTestId("timeline-navigation").className).toBe(
      "timeline-navigation",
    );
  });

  it("reports the Gantt's navigation to the toolbar", () => {
    const onNavigationChange =
      vi.fn<(navigation: CalendarNavigation) => void>();

    renderNavigation(onNavigationChange);

    expect(onNavigationChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.any(String) }),
    );
  });
});
