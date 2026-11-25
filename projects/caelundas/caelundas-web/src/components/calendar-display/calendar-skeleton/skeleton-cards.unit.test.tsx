import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonCards } from "./skeleton-cards";

describe(SkeletonCards, () => {
  it("applies its class name", () => {
    render(<SkeletonCards className="skeleton-cards" />);

    expect(screen.getByTestId("skeleton-cards").className).toBe(
      "skeleton-cards",
    );
  });

  it("draws eight cards", () => {
    render(<SkeletonCards />);

    expect(screen.getByTestId("skeleton-cards").children).toHaveLength(8);
  });
});
