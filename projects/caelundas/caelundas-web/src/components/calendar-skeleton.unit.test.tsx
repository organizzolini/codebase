import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSkeleton } from "./calendar-skeleton";

describe(CalendarSkeleton, () => {
  it("applies its class name", () => {
    render(<CalendarSkeleton className="calendar-skeleton" />);

    expect(screen.getByTestId("calendar-skeleton").className).toBe(
      "calendar-skeleton",
    );
  });
});
