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

  it("holds no box of its own", () => {
    render(<SkeletonCards />);

    expect(screen.getByTestId("skeleton-cards").style.display).toBe("contents");
  });

  it("draws six cards in the columns the Totals have", () => {
    render(<SkeletonCards />);

    const [grid] = screen.getByTestId("skeleton-cards").children;

    expect(grid?.children).toHaveLength(6);
    expect(grid?.className).toContain(
      "grid-cols-1 gap-4 overflow-hidden p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
    );
  });

  it("hides its blocks from a screen reader and names what is loading", () => {
    render(<SkeletonCards />);

    const [grid, label] = screen.getByTestId("skeleton-cards").children;

    expect(grid?.getAttribute("aria-hidden")).toBe("true");
    expect(label?.textContent).toBe("Loading totals");
    expect(label?.className).toBe("sr-only");
  });

  it("gives its announcement the id it is handed", () => {
    render(<SkeletonCards labelId="totals-label" />);

    expect(screen.getByText("Loading totals").id).toBe("totals-label");
  });
});
