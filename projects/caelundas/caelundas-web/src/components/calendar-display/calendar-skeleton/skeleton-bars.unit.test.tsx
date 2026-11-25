import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonBars } from "./skeleton-bars";

describe(SkeletonBars, () => {
  it("applies its class name", () => {
    render(<SkeletonBars className="skeleton-bars" />);

    expect(screen.getByTestId("skeleton-bars").className).toBe("skeleton-bars");
  });

  it("draws ten bars of different heights", () => {
    render(<SkeletonBars />);

    expect(screen.getByTestId("skeleton-bars").children).toHaveLength(10);
  });
});
