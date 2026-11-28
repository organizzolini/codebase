import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { setViewportWidth } from "../../../../testing/viewport";

import { CalendarSkeleton } from "./calendar-skeleton";

describe(CalendarSkeleton, () => {
  it("applies its class name", () => {
    render(<CalendarSkeleton className="calendar-skeleton" />);

    expect(screen.getByTestId("calendar-skeleton").className).toBe(
      "calendar-skeleton",
    );
  });

  it("stands in for a month's grid on a wide page", () => {
    render(<CalendarSkeleton />);

    expect(screen.getByRole("status").dataset["layout"]).toBe("grid");
  });

  it("stands in for the table's list on a phone, which opens on it", () => {
    setViewportWidth(375);
    render(<CalendarSkeleton />);

    expect(screen.getByRole("status").dataset["layout"]).toBe("list");

    act(() => {
      setViewportWidth(1280);
    });

    expect(screen.getByRole("status").dataset["layout"]).toBe("grid");
  });

  it.each([
    ["month", "grid", "skeleton-month"],
    ["week", "columns", "skeleton-columns"],
    ["day", "columns", "skeleton-columns"],
    ["table", "list", "skeleton-table"],
    ["charts", "bars", "skeleton-bars"],
    ["totals", "cards", "skeleton-cards"],
    ["timeline", "timeline", "skeleton-timeline"],
  ] as const)(
    "takes the %s view's layout when it is named",
    (view, layout, testId) => {
      render(<CalendarSkeleton view={view} />);

      expect(screen.getByRole("status").dataset["layout"]).toBe(layout);
      expect(screen.getByRole("status").dataset["view"]).toBe(view);
      expect(screen.getByTestId(testId)).toBeDefined();
      expect(screen.getByTestId("skeleton-toolbar")).toBeDefined();
    },
  );

  it("draws a chart for the Charts and a card for each Totals metric", () => {
    const { rerender } = render(<CalendarSkeleton view="charts" />);

    expect(screen.getAllByTestId("skeleton-chart-card")).toHaveLength(4);

    rerender(<CalendarSkeleton view="totals" />);

    expect(screen.getAllByTestId("skeleton-total-card")).toHaveLength(6);
  });

  it("draws a column for each day a view shows", () => {
    const { rerender } = render(<CalendarSkeleton view="week" />);

    expect(screen.getAllByTestId("skeleton-column")).toHaveLength(7);

    rerender(<CalendarSkeleton view="day" />);

    expect(screen.getAllByTestId("skeleton-column")).toHaveLength(1);
  });

  it("keeps the view the link names whatever the width", () => {
    setViewportWidth(375);
    render(<CalendarSkeleton view="week" />);

    expect(screen.getByRole("status").dataset["view"]).toBe("week");
  });

  it("is a busy status with a hidden label and nothing to press", () => {
    render(<CalendarSkeleton view="table" />);

    const status = screen.getByRole("status", { name: "Loading events" });

    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.querySelector(".sr-only")?.textContent).toBe(
      "Loading events",
    );
    expect(
      status.querySelectorAll("button, a, input, [tabindex]"),
    ).toHaveLength(0);
  });

  it("stills its pulse for a reader who wants less motion", () => {
    render(<CalendarSkeleton view="table" />);

    expect(screen.getByRole("status").className).toContain(
      "motion-reduce:[&_[data-slot=skeleton]]:animate-none",
    );
  });
});
