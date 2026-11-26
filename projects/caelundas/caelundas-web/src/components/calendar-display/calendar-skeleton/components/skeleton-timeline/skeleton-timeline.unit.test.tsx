import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonTimeline } from "./skeleton-timeline";
import { TIMELINE_ROWS } from "./skeleton-timeline.constants";

describe(SkeletonTimeline, () => {
  it("applies its class name", () => {
    render(<SkeletonTimeline className="skeleton-timeline" />);

    expect(screen.getByTestId("skeleton-timeline").className).toContain(
      "skeleton-timeline",
    );
  });

  it("draws a group beside a bar for each row", () => {
    render(<SkeletonTimeline />);

    expect(screen.getAllByTestId("skeleton-timeline-group")).toHaveLength(
      TIMELINE_ROWS.length,
    );
    expect(screen.getAllByTestId("skeleton-timeline-row")).toHaveLength(
      TIMELINE_ROWS.length,
    );
  });

  it("indents each group by its depth", () => {
    render(<SkeletonTimeline />);

    const [first, second] = screen
      .getAllByTestId("skeleton-timeline-group")
      .map((group) => group.querySelector<HTMLElement>("[data-slot=skeleton]"));

    expect(first?.style.marginLeft).toBe("0rem");
    expect(second?.style.marginLeft).toBe("0.75rem");
  });

  it("has no interactive element", () => {
    render(<SkeletonTimeline />);

    expect(
      screen
        .getByTestId("skeleton-timeline")
        .querySelectorAll("button, a, input"),
    ).toHaveLength(0);
  });
});
