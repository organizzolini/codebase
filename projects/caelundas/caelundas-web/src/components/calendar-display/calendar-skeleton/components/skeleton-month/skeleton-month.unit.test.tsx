import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonMonth } from "./skeleton-month";

describe(SkeletonMonth, () => {
  it("applies its class name", () => {
    render(<SkeletonMonth className="skeleton-month" />);

    expect(screen.getByTestId("skeleton-month").className).toContain(
      "skeleton-month",
    );
  });

  it("draws six weeks of seven days", () => {
    render(<SkeletonMonth />);

    expect(screen.getAllByTestId("skeleton-month-day")).toHaveLength(42);
  });

  it("gives each day a number and, in turn, bars for its events", () => {
    render(<SkeletonMonth />);

    const days = screen.getAllByTestId("skeleton-month-day");

    expect(days[0]?.children).toHaveLength(3);
    expect(days[3]?.children).toHaveLength(1);
    expect(days[0]?.querySelectorAll("button, a, input")).toHaveLength(0);
  });
});
