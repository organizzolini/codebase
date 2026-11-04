import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilterSurface } from "./filter-surface";

describe(FilterSurface, () => {
  it("applies its class name", () => {
    render(
      <FilterSurface
        className="filter-surface"
        isTablet={false}
        trigger={<button type="button">Filters</button>}
      />,
    );

    expect(screen.getByTestId("filter-surface").className).toBe(
      "filter-surface",
    );
  });

  it("opens the builder from its trigger", () => {
    render(
      <FilterSurface
        isTablet={false}
        trigger={<button type="button">Filters</button>}
      >
        Builder
      </FilterSurface>,
    );

    expect(screen.queryByText("Builder")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Filters" }));

    expect(screen.getByText("Builder")).toBeDefined();
  });
});
