import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";
import { createFilterFields } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterPillGroup } from "./filter-pill-group";

import type { FilterGroup } from "../gallery-filter-builder/gallery-filter-builder.types";
import type { FilterPillGroupProperties } from "./filter-pill-group";

const TREE: FilterGroup = {
  combinator: "or",
  rules: [
    { field: "rows", operator: "eq", value: 2 },
    {
      combinator: "and",
      rules: [{ field: "isChain", operator: "is", value: true }],
    },
  ],
};

/** The edit last handed to the handler, applied to the tree. */
function edited(filter: FilterPillGroupProperties): FilterGroup {
  const edit = vi.mocked(filter.onEdit).mock.lastCall?.[0];

  if (edit === undefined) {
    throw new Error("no edit");
  }

  return edit(TREE);
}

/** The properties a group needs, over the fixture catalog. */
function properties(
  overrides: Partial<FilterPillGroupProperties> = {},
): FilterPillGroupProperties {
  return {
    fields: createFilterFields(FIXTURE_CHARACTERISTICS),
    group: TREE,
    onEdit: vi.fn<FilterPillGroupProperties["onEdit"]>(),
    path: [],
    ...overrides,
  };
}

describe(FilterPillGroup, () => {
  it("applies its class name", () => {
    render(
      <FilterPillGroup
        {...properties({ group: { combinator: "and", rules: [] } })}
        className="filter-pill-group"
      />,
    );

    expect(screen.getByTestId("filter-pill-group").className).toBe(
      "filter-pill-group",
    );
  });

  it("shows a pill for each rule, a nested group parenthesized with its own controls", () => {
    render(<FilterPillGroup {...properties()} />);

    expect(screen.getByLabelText("Rows Value")).toBeDefined();
    expect(screen.getByLabelText("Chain Value")).toBeDefined();
    expect(screen.getByRole("group", { name: "Filter group 2" })).toBeDefined();
    expect(screen.getByLabelText("Filter group 2 match")).toBeDefined();
  });

  it("removes a rule, edits one in place, joins a nested group differently and removes it", () => {
    const filter = properties();

    render(<FilterPillGroup {...filter} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Rows filter" }));

    expect(edited(filter).rules).toHaveLength(1);

    fireEvent.change(screen.getByLabelText("Rows operator"), {
      target: { value: "gt" },
    });

    expect(edited(filter).rules[0]).toMatchObject({ operator: "gt" });

    fireEvent.change(screen.getByLabelText("Filter group 2 match"), {
      target: { value: "or" },
    });

    expect(edited(filter).rules[1]).toMatchObject({ combinator: "or" });

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Filter group 2" }),
    );

    expect(edited(filter).rules).toHaveLength(1);
  });
});
