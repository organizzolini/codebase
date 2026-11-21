import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";
import { DEFAULT_ROWS_FILTER } from "../gallery-filter-builder/gallery-filter-builder.constants";
import { createFilterFields } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterPillRow } from "./filter-pill-row";

import type { FilterPillRowProperties } from "./filter-pill-row";

/** The properties a row needs, over the fixture catalog. */
function properties(
  overrides: Partial<FilterPillRowProperties> = {},
): FilterPillRowProperties {
  return {
    fields: createFilterFields(FIXTURE_CHARACTERISTICS),
    filter: undefined,
    onEdit: vi.fn<FilterPillRowProperties["onEdit"]>(),
    onRowsChange: vi.fn<FilterPillRowProperties["onRowsChange"]>(),
    rows: DEFAULT_ROWS_FILTER,
    ...overrides,
  };
}

describe(FilterPillRow, () => {
  it("applies its class name", () => {
    render(
      <FilterPillRow
        {...properties()}
        className="filter-pill-row"
      />,
    );

    expect(screen.getByTestId("filter-pill-row").className).toBe(
      "filter-pill-row",
    );
  });

  it("shows only the rows pill, with no remove button, when the tree holds no rule", () => {
    render(<FilterPillRow {...properties()} />);

    expect(screen.getByLabelText<HTMLInputElement>("Rows Value").value).toBe(
      "4",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("edits the rows rule, a range put low end first", () => {
    const row = properties({ rows: { operator: "between", value: [2, 5] } });

    render(<FilterPillRow {...row} />);
    fireEvent.change(screen.getByLabelText("Rows From"), {
      target: { value: "9" },
    });
    fireEvent.blur(screen.getByLabelText("Rows From"));

    expect(row.onRowsChange).toHaveBeenCalledWith({
      operator: "between",
      value: [5, 9],
    });
  });

  it("shows the tree's rules after the rows pill, joined by and", () => {
    render(
      <FilterPillRow
        {...properties({
          filter: {
            combinator: "and",
            rules: [{ field: "isChain", operator: "is", value: true }],
          },
        })}
      />,
    );

    expect(screen.getByLabelText("Chain Value")).toBeDefined();
    expect(screen.getByText("and")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Remove Chain filter" }),
    ).toBeDefined();
  });
});
