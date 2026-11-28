import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChartSortButton } from "./chart-sort-button";

describe(ChartSortButton, () => {
  it("offers to sort when the groups are not sorted by the metric", () => {
    render(
      <ChartSortButton
        direction={undefined}
        label="Events"
        onClick={vi.fn<() => void>()}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Sort by Events: not sorted",
    });

    expect(button.dataset["direction"]).toBe("none");
  });

  it.each([
    ["asc", "ascending"],
    ["desc", "descending"],
  ] as const)("says the groups are sorted %s", (direction, word) => {
    render(
      <ChartSortButton
        direction={direction}
        label="Events"
        onClick={vi.fn<() => void>()}
      />,
    );

    const button = screen.getByRole("button", {
      name: `Sort by Events: ${word}`,
    });

    expect(button.dataset["direction"]).toBe(direction);
  });

  it("reports a click", () => {
    const onClick = vi.fn<() => void>();

    render(
      <ChartSortButton
        direction={undefined}
        label="Events"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByTestId("chart-sort-button"));

    expect(onClick).toHaveBeenCalledExactlyOnceWith();
  });
});
