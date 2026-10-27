import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarGrid } from "./calendar-grid";

import type { CalendarNavigation } from "./calendar-navigation-group.types";

function renderGrid(className = ""): {
  onNavigationChange: (navigation: CalendarNavigation) => void;
} {
  const onNavigationChange = vi.fn<(navigation: CalendarNavigation) => void>();

  render(
    <CalendarGrid
      anchor={new Date("2026-03-01T12:00:00.000Z")}
      className={className}
      compact={false}
      events={[]}
      facets={[]}
      grouping={[]}
      onDateChange={vi.fn<(date: Date) => void>()}
      onNavigationChange={onNavigationChange}
      timeZone="America/New_York"
      view="month"
    />,
  );

  return { onNavigationChange };
}

describe(CalendarGrid, () => {
  it("applies its class name", () => {
    render(
      <CalendarGrid
        anchor={new Date("2026-03-01T12:00:00.000Z")}
        className="calendar-grid"
        compact={false}
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={vi.fn<(date: Date) => void>()}
        onNavigationChange={vi.fn<(navigation: CalendarNavigation) => void>()}
        timeZone="America/New_York"
        view="month"
      />,
    );

    expect(screen.getByTestId("calendar-grid").className).toBe("calendar-grid");
  });

  it("reports the month it shows to the toolbar", () => {
    const { onNavigationChange } = renderGrid();

    expect(onNavigationChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "March 2026" }),
    );
  });
});
