import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterNumberInput } from "./filter-number-input";

describe(FilterNumberInput, () => {
  it("applies its class name", () => {
    render(
      <FilterNumberInput
        className="filter-number-input"
        label="Value"
        onValueChange={vi.fn<() => void>()}
        value={1}
      />,
    );

    expect(screen.getByTestId("filter-number-input").className).toBe(
      "filter-number-input",
    );
  });
});
