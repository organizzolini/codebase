import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EventCalendar } from "@codebase/presentation";

import { CalendarGridNavigation } from "./calendar-grid-navigation";

import type { CalendarNavigation } from "./calendar-navigation-group.types";
import type { ReactNode } from "react";

/**
 * The event calendar the navigation reads its own from.
 */
function EventCalendarWrapper(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  return (
    <EventCalendar
      date={new Date("2026-03-01T12:00:00.000Z")}
      events={[]}
      timeZone="America/New_York"
      view="month"
      views={["month"]}
    >
      {properties.children}
    </EventCalendar>
  );
}

function renderNavigation(
  onNavigationChange: (navigation: CalendarNavigation) => void,
): void {
  render(
    <EventCalendar
      date={new Date("2026-03-01T12:00:00.000Z")}
      events={[]}
      timeZone="America/New_York"
      view="month"
      views={["month"]}
    >
      <CalendarGridNavigation
        className="calendar-grid-navigation"
        onNavigationChange={onNavigationChange}
      />
    </EventCalendar>,
  );
}

describe(CalendarGridNavigation, () => {
  it("applies its class name", () => {
    render(
      <CalendarGridNavigation
        className="calendar-grid-navigation"
        onNavigationChange={vi.fn<(navigation: CalendarNavigation) => void>()}
      />,
      { wrapper: EventCalendarWrapper },
    );

    expect(screen.getByTestId("calendar-grid-navigation").className).toBe(
      "calendar-grid-navigation",
    );
  });

  it("reports the event calendar's navigation to the toolbar", () => {
    const onNavigationChange =
      vi.fn<(navigation: CalendarNavigation) => void>();

    renderNavigation(onNavigationChange);

    expect(onNavigationChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "March 2026" }),
    );
  });
});
