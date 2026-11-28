import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createRecord } from "../../../../../../testing/calendar/calendar-records";

import { CalendarGrid } from "./calendar-grid";

import type { CalendarNavigation } from "../../../../calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type { DayOpener } from "../calendar-month/calendar-month.types";
import type { GridViewName } from "../calendar-views/calendar-views.types";

const GROUPING = [{ field: "tag:*", tags: ["a"] }];

function renderGrid(
  properties: {
    events?: readonly CalendarEventRecord[];
    onAllDayModeChange?: (mode: "contracted" | "expanded" | "grouped") => void;
    onOpenDay?: DayOpener;
    view?: GridViewName;
  } = {},
): { onNavigationChange: (navigation: CalendarNavigation) => void } {
  const onNavigationChange = vi.fn<(navigation: CalendarNavigation) => void>();

  render(
    <CalendarGrid
      anchor={new Date("2026-03-04T12:00:00.000Z")}
      compact={false}
      events={properties.events ?? []}
      grouping={GROUPING}
      onAllDayModeChange={properties.onAllDayModeChange}
      onDateChange={vi.fn<(date: Date) => void>()}
      onNavigationChange={onNavigationChange}
      onOpenDay={properties.onOpenDay}
      timeZone="UTC"
      view={properties.view ?? "month"}
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

  it("draws the month with the app's own grouped cells", () => {
    renderGrid({
      events: [createRecord("a", "2026-03-04T10:00:00Z")],
    });

    expect(screen.getByTestId("calendar-month")).toBeDefined();
  });

  it("opens the week from a month's day", () => {
    const onOpenDay = vi.fn<DayOpener>();

    renderGrid({ onOpenDay });
    fireEvent.click(
      screen.getByRole("button", { name: "Open the week of 2026-03-12" }),
    );

    expect(onOpenDay).toHaveBeenCalledWith("week", "2026-03-12");
  });

  it("opens a day from the week's day heading, and no heading elsewhere", () => {
    const onOpenDay = vi.fn<DayOpener>();

    renderGrid({ onOpenDay, view: "week" });
    fireEvent.click(screen.getByRole("button", { name: "Open 2026-03-04" }));

    expect(onOpenDay).toHaveBeenCalledWith("day", "2026-03-04");
  });

  it("draws the week's all-day row grouped, with a control that asks for the next state", () => {
    const onAllDayModeChange = vi.fn<(mode: string) => void>();

    renderGrid({
      events: [
        createRecord("long", "2026-03-02T08:00:00Z", "2026-03-06T08:00:00Z"),
      ],
      onAllDayModeChange,
      view: "week",
    });

    expect(
      screen.getByTestId("calendar-all-day").matches("[data-mode=grouped]"),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /^All day: grouped/u }));

    expect(onAllDayModeChange).toHaveBeenCalledWith("expanded");
  });

  it("draws a long event's start and end as blocks on their days, with no arrows", () => {
    renderGrid({
      events: [
        createRecord("long", "2026-03-02T08:00:00Z", "2026-03-06T08:00:00Z"),
      ],
      view: "week",
    });

    expect(document.querySelector("[data-edge=start]")).not.toBeNull();
    expect(document.querySelector("[data-edge=end]")).not.toBeNull();
    expect(document.body.textContent).not.toMatch(/[«»]/u);
  });

  it("merges events of one group that run together into a chip that opens in place", () => {
    renderGrid({
      events: [
        createRecord("a", "2026-03-04T10:00:00Z"),
        createRecord("b", "2026-03-04T10:05:00Z"),
        createRecord("c", "2026-03-04T10:10:00Z"),
      ],
      view: "week",
    });

    expect(screen.queryAllByTestId("calendar-event-chip")).toHaveLength(0);

    fireEvent.click(screen.getByTestId("calendar-group-chip"));

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(3);
  });
});
