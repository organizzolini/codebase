import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonTotalCard } from "./skeleton-total-card";
import { SUBTOTAL_LABELS } from "./skeleton-total-card.constants";

describe(SkeletonTotalCard, () => {
  it("applies its class name", () => {
    render(<SkeletonTotalCard className="skeleton-total-card" />);

    expect(screen.getByTestId("skeleton-total-card").className).toContain(
      "skeleton-total-card",
    );
  });

  it("nests a bordered subtotal for each group, each with a share bar", () => {
    render(<SkeletonTotalCard />);

    const subtotals = screen.getAllByTestId("skeleton-subtotal");

    expect(subtotals).toHaveLength(SUBTOTAL_LABELS.length);
    expect(subtotals[0]?.className).toContain("border");
    expect(subtotals[0]?.lastElementChild?.className).toContain("h-1");
  });

  it("lists subtotals in one column of a narrow card and two of a wide one", () => {
    render(<SkeletonTotalCard />);

    const list = screen.getAllByTestId("skeleton-subtotal")[0]?.parentElement;

    expect(list?.className).toContain("grid-cols-1");
    expect(list?.className).toContain("@sm:grid-cols-2");
  });

  it("has no interactive element and no hover color", () => {
    render(<SkeletonTotalCard />);

    const card = screen.getByTestId("skeleton-total-card");

    expect(card.querySelectorAll("button, a, input")).toHaveLength(0);
    expect(card.outerHTML).not.toContain("hover:");
  });
});
