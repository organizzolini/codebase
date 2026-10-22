import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { setViewportWidth } from "../../testing/viewport";

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

  it("stands in for the agenda's list on a phone, which opens on it", () => {
    setViewportWidth(375);
    render(<CalendarSkeleton />);

    expect(screen.getByRole("status").dataset["layout"]).toBe("list");

    act(() => {
      setViewportWidth(1280);
    });

    expect(screen.getByRole("status").dataset["layout"]).toBe("grid");
  });
});
