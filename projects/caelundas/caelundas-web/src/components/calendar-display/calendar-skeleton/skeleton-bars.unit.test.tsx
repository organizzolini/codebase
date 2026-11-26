import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonBars } from "./skeleton-bars";

describe(SkeletonBars, () => {
  it("applies its class name", () => {
    render(<SkeletonBars className="skeleton-bars" />);

    expect(screen.getByTestId("skeleton-bars").className).toBe("skeleton-bars");
  });

  it("holds no box of its own", () => {
    render(<SkeletonBars />);

    expect(screen.getByTestId("skeleton-bars").style.display).toBe("contents");
  });

  it("draws four charts in a grid that is one wide on a phone and two on a tablet", () => {
    render(<SkeletonBars />);

    const [grid] = screen.getByTestId("skeleton-bars").children;

    expect(grid?.children).toHaveLength(4);
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("lg:grid-cols-2");
  });

  it("hides its blocks from a screen reader and names what is loading", () => {
    render(<SkeletonBars />);

    const [grid, label] = screen.getByTestId("skeleton-bars").children;

    expect(grid?.getAttribute("aria-hidden")).toBe("true");
    expect(label?.textContent).toBe("Loading charts");
    expect(label?.className).toBe("sr-only");
  });

  it("gives its announcement the id it is handed", () => {
    render(<SkeletonBars labelId="charts-label" />);

    expect(screen.getByText("Loading charts").id).toBe("charts-label");
  });
});
