import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonBody } from "./skeleton-body";

describe(SkeletonBody, () => {
  it("applies its class name", () => {
    render(
      <SkeletonBody
        className="skeleton-body"
        view="month"
      />,
    );

    expect(screen.getByTestId("skeleton-body").className).toBe("skeleton-body");
  });

  it("draws a grid of six weeks for the month", () => {
    render(<SkeletonBody view="month" />);

    expect(
      screen.getByTestId("skeleton-body").querySelectorAll(".grid > *"),
    ).toHaveLength(42);
  });
});
