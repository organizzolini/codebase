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
    ["month", "grid"],
    ["week", "columns"],
    ["day", "columns"],
    ["table", "list"],
    ["charts", "bars"],
    ["totals", "cards"],
    ["timeline", "timeline"],
  ] as const)("takes the %s view's layout when it is named", (view, layout) => {
    render(<CalendarSkeleton view={view} />);

    expect(screen.getByRole("status").dataset["layout"]).toBe(layout);
    expect(screen.getByRole("status").dataset["view"]).toBe(view);
  });

  it("draws bars for the Charts and cards for the Totals", () => {
    const { container, rerender } = render(<CalendarSkeleton view="charts" />);

    expect(container.querySelectorAll("[class*=' w-full']")).toHaveLength(10);

    rerender(<CalendarSkeleton view="totals" />);

    expect(container.querySelectorAll("[class*='h-28']")).toHaveLength(8);
  });

  it("draws a column for each day a view shows", () => {
    const { container, rerender } = render(<CalendarSkeleton view="week" />);

    expect(container.querySelectorAll("[style*='repeat(7']")).toHaveLength(1);

    rerender(<CalendarSkeleton view="day" />);

    expect(container.querySelectorAll("[style*='repeat(1']")).toHaveLength(1);
  });

  it("keeps the view the link names whatever the width", () => {
    setViewportWidth(375);
    render(<CalendarSkeleton view="week" />);

    expect(screen.getByRole("status").dataset["view"]).toBe("week");
  });
});
