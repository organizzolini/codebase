import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";
import { createFilterFields } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterChipRow } from "./filter-chip-row";

import type { FilterGroup } from "../gallery-filter-builder/gallery-filter-builder.types";
import type { FilterChipRowProperties } from "./filter-chip-row";

const TREE: FilterGroup = {
  combinator: "and",
  rules: [
    { field: "rows", operator: "gte", value: 2 },
    {
      combinator: "or",
      rules: [{ field: "isChain", operator: "is", value: true }],
    },
  ],
};

/** The properties a row needs, over the fixture catalog. */
function properties(
  overrides: Partial<FilterChipRowProperties> = {},
): FilterChipRowProperties {
  return {
    fields: createFilterFields(FIXTURE_CHARACTERISTICS),
    filter: TREE,
    onFilterChange: vi.fn<FilterChipRowProperties["onFilterChange"]>(),
    ...overrides,
  };
}

describe(FilterChipRow, () => {
  it("applies its class name", () => {
    render(
      <FilterChipRow
        {...properties()}
        className="filter-chip-row"
      />,
    );

    expect(screen.getByTestId("filter-chip-row").className).toBe(
      "filter-chip-row",
    );
  });

  it("draws a chip for each rule, nested ones included", () => {
    render(<FilterChipRow {...properties()} />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toStrictEqual(["Rows ≥ 2×", "Chain is true×"]);
  });

  it("removes the rule a chip names, and gives none when it was the last", () => {
    const filter = properties();

    render(<FilterChipRow {...filter} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Rows ≥ 2" }));

    expect(filter.onFilterChange).toHaveBeenLastCalledWith({
      combinator: "and",
      rules: [
        {
          combinator: "or",
          rules: [{ field: "isChain", operator: "is", value: true }],
        },
      ],
    });

    const single = properties({
      filter: {
        combinator: "and",
        rules: [{ field: "rows", operator: "eq", value: 1 }],
      },
    });

    render(<FilterChipRow {...single} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Rows = 1" }));

    expect(vi.mocked(single.onFilterChange).mock.lastCall).toStrictEqual([
      undefined,
    ]);
  });

  it("draws nothing without a rule", () => {
    render(<FilterChipRow {...properties({ filter: undefined })} />);

    expect(screen.queryByTestId("filter-chip-row")).toBeNull();
  });
});
