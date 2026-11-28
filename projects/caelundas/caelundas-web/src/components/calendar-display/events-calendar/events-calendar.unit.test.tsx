import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  readServedApi,
  serveCalendarApi,
} from "../../../../testing/calendar/calendar-api";
import { renderWithCatalog } from "../../../../testing/metrics/metric-catalog";

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
      filters: <button type="button">Filters</button>,
      grouping: [],
      onDateChange: () => {},
      timeZone: "America/New_York",
    };
    const { rerender } = renderWithCatalog(
      <EventsCalendar
        {...properties}
        view="month"
      />,
    );
    const toolbar = screen.getByTestId("calendar-toolbar");
    const selector = screen.getByRole("button", { name: "Filters" });

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

  it.each([
    ["charts", "calendar-charts"],
    ["totals", "calendar-totals"],
  ] as const)(
    "draws the %s layout, and keeps the toolbar, over the table's days",
    async (view, testId) => {
      serveCalendarApi();
      renderWithCatalog(
        <EventsCalendar
          anchor={new Date("2026-03-01T12:00:00.000Z")}
          events={[]}
          facets={[]}
          grouping={[{ field: "tag:body" }]}
          metrics={["events"]}
          onDateChange={() => {}}
          timeZone="America/New_York"
          view={view}
          compare
        />,
      );

      expect(screen.getByTestId(testId)).toBeDefined();
      expect(screen.getByTestId("calendar-toolbar")).toBeDefined();

      await waitFor(() => {
        expect(readServedApi().requests.metrics[0]).toMatchObject({
          compareToPrevious: true,
          metrics: ["events"],
        });
      });
    },
  );

  it.each(["month", "timeline"] as const)(
    "moves the %s view from the toolbar's buttons",
    (view) => {
      const onDateChange = vi.fn<(date: Date) => void>();

      renderWithCatalog(
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
      durationMinutes: 0,
      end: new Date("2026-03-20T14:46:00.000Z"),
      groups: [],
      id: "event-ingress",
      name: "Sun Ingress Aries",
      note: "The Sun enters Aries",
      start: new Date("2026-03-20T14:46:00.000Z"),
      tags: [
        {
          depth: 2,
          id: "tag-zodiac-ingress",
          name: "Sign",
          path: "Ingress / Stay / Full Sign",
        },
      ],
      timezone: "America/New_York",
    };

    function renderWeek(colors: boolean): void {
      renderWithCatalog(
        <EventsCalendar
          anchor={new Date("2026-03-20T12:00:00.000Z")}
          colors={colors}
          events={[INGRESS]}
          facets={[]}
          grouping={[]}
          onDateChange={() => {}}
          timeZone="America/New_York"
          view="week"
        />,
      );
    }

    it("draws each event in the color of its kind", () => {
      renderWeek(true);

      const chip = document.querySelector<HTMLElement>(
        "[data-slot='event-calendar-event']",
      );

      expect(chip?.getAttribute("style")).toContain("#10b981");
    });

    it("draws events in the default color with colors off", () => {
      renderWeek(false);

      const chip = document.querySelector<HTMLElement>(
        "[data-slot='event-calendar-event']",
      );

      expect(chip?.getAttribute("style")).not.toContain("#10b981");
    });
  });
});
