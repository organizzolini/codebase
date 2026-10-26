import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EventsCalendar } from "./events-calendar";

describe(EventsCalendar, () => {
  it("applies its class name", () => {
    render(
      <EventsCalendar
        anchor={new Date("2026-03-01T12:00:00.000Z")}
        className="events-calendar"
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByTestId("events-calendar").className).toBe(
      "events-calendar",
    );
  });

  it("offers grouping and a scale only when it can change them", () => {
    render(
      <EventsCalendar
        anchor={new Date("2026-03-01T12:00:00.000Z")}
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        timeZone="America/New_York"
        view="timeline"
      />,
    );

    expect(screen.getByTestId("calendar-timeline")).toBeDefined();
    expect(screen.queryByRole("button", { name: /^Group by/u })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Scale/u })).toBeNull();
  });

  it("keeps the same toolbar, and the focus in it, as the view changes", () => {
    const properties = {
      anchor: new Date("2026-03-01T12:00:00.000Z"),
      events: [],
      facets: [],
      grouping: [],
      onDateChange: () => {},
      onViewChange: () => {},
      timeZone: "America/New_York",
    };
    const { rerender } = render(
      <EventsCalendar
        {...properties}
        view="month"
      />,
    );
    const toolbar = screen.getByTestId("calendar-toolbar");
    const selector = screen.getByRole("button", { name: "Month" });

    selector.focus();

    rerender(
      <EventsCalendar
        {...properties}
        view="timeline"
      />,
    );

    expect(screen.getByTestId("calendar-toolbar")).toBe(toolbar);
    expect(document.activeElement).toBe(selector);

    rerender(
      <EventsCalendar
        {...properties}
        view="week"
      />,
    );

    expect(screen.getByTestId("calendar-toolbar")).toBe(toolbar);
  });

  it.each(["month", "timeline"] as const)(
    "moves the %s view from the toolbar's buttons",
    (view) => {
      const onDateChange = vi.fn<(date: Date) => void>();

      render(
        <EventsCalendar
          anchor={new Date("2026-03-15T12:00:00.000Z")}
          events={[]}
          facets={[]}
          grouping={[]}
          onDateChange={onDateChange}
          timeZone="America/New_York"
          view={view}
        />,
      );

      expect(screen.getByRole("heading", { name: "March 2026" })).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(onDateChange).toHaveBeenCalledTimes(1);
      expect(onDateChange.mock.lastCall?.[0].getUTCMonth()).toBe(3);
    },
  );
});
