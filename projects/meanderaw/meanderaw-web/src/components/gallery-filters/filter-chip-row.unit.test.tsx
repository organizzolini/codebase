import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";
import { DEFAULT_ROWS_FILTER } from "../gallery-filter-builder/gallery-filter-builder.constants";
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
    rows: DEFAULT_ROWS_FILTER,
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
    ).toStrictEqual(["Rows = 4", "Rows ≥ 2×", "Chain is true×"]);
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

  it("draws only the rows chip, with no way to remove it, when the tree holds no rule", () => {
    render(<FilterChipRow {...properties({ filter: undefined })} />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toStrictEqual(["Rows = 4"]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("words a rows range, low end first", () => {
    render(
      <FilterChipRow
        {...properties({
          filter: undefined,
          rows: { operator: "between", value: [2, 6] },
        })}
      />,
    );

    expect(screen.getByText("Rows between 2 and 6")).toBeDefined();
  });
});
