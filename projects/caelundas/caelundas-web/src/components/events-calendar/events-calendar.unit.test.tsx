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

  describe("colors", () => {
    const INGRESS = {
      color: null,
      description: "The Sun enters Aries",
      durationMinutes: 0,
      end: new Date("2026-03-20T14:46:00.000Z"),
      groups: [],
      id: "event-ingress",
      location: null,
      start: new Date("2026-03-20T14:46:00.000Z"),
      summary: "Sun Ingress Aries",
      tags: [
        {
          depth: 2,
          id: "tag-sign-ingress",
          name: "Sign Ingress",
          path: "Type / Ingress / Sign Ingress",
        },
      ],
      timezone: "America/New_York",
    };

    function renderMonth(colors: boolean): void {
      render(
        <EventsCalendar
          anchor={new Date("2026-03-20T12:00:00.000Z")}
          colors={colors}
          events={[INGRESS]}
          facets={[]}
          grouping={[]}
          onDateChange={() => {}}
          timeZone="America/New_York"
          view="month"
        />,
      );
    }

    it("draws each event in the color of its kind", () => {
      renderMonth(true);

      const chip = document.querySelector<HTMLElement>(
        "[data-slot='event-calendar-event']",
      );

      expect(chip?.getAttribute("style")).toContain("#10b981");
    });

    it("draws events in the default color with colors off", () => {
      renderMonth(false);

      const chip = document.querySelector<HTMLElement>(
        "[data-slot='event-calendar-event']",
      );

      expect(chip?.getAttribute("style")).not.toContain("#10b981");
    });
  });
});
