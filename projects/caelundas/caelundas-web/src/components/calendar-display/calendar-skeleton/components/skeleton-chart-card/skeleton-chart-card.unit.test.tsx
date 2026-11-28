import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonChartCard } from "./skeleton-chart-card";

describe(SkeletonChartCard, () => {
  it("applies its class name", () => {
    render(
      <SkeletonChartCard
        className="skeleton-chart-card"
        columns={[50]}
      />,
    );

    expect(screen.getByTestId("skeleton-chart-card").className).toContain(
      "skeleton-chart-card",
    );
  });

  it("draws a column as tall as each share it is given", () => {
    render(<SkeletonChartCard columns={[20, 80, 50]} />);

    expect(
      screen
        .getAllByTestId("skeleton-chart-column")
        .map((column) => column.style.height),
    ).toStrictEqual(["20%", "80%", "50%"]);
  });

  it("rules the plot and labels its axes, with no interactive element", () => {
    render(<SkeletonChartCard columns={[20, 80]} />);

    const card = screen.getByTestId("skeleton-chart-card");

    expect(card.querySelectorAll(".border-t")).toHaveLength(5);
    expect(card.querySelectorAll("button, a, input")).toHaveLength(0);
  });
});
