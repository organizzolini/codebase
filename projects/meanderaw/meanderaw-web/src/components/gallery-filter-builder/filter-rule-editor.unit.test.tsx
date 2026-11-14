import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { FilterRuleEditor } from "./filter-rule-editor";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { FilterGroup } from "./gallery-filter-builder.types";

describe(FilterRuleEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterRuleEditor
        className="filter-rule-editor"
        fields={createFilterFields(FIXTURE_CHARACTERISTICS)}
        onEdit={vi.fn<() => void>()}
        path={[0]}
        rule={{ field: "rows", operator: "eq", value: 1 }}
      />,
    );

    expect(screen.getByTestId("filter-rule-editor").className).toBe(
      "filter-rule-editor",
    );
  });

  it("removes its rule from the tree", () => {
    const onEdit = vi.fn<(edit: (root: FilterGroup) => FilterGroup) => void>();

    render(
      <FilterRuleEditor
        fields={createFilterFields(FIXTURE_CHARACTERISTICS)}
        onEdit={onEdit}
        path={[0]}
        rule={{ field: "rows", operator: "eq", value: 1 }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove rule" }));

    const edit = onEdit.mock.calls[0]?.[0];

    if (edit === undefined) {
      throw new Error("no edit");
    }

    expect(
      edit({
        combinator: "and",
        rules: [{ field: "rows", operator: "eq", value: 1 }],
      }).rules,
    ).toStrictEqual([]);
  });

  it("groups the fields under shape and characteristics, marking the patterns", () => {
    render(
      <FilterRuleEditor
        fields={createFilterFields(FIXTURE_CHARACTERISTICS)}
        onEdit={vi.fn<() => void>()}
        path={[0]}
        rule={{ field: "rows", operator: "eq", value: 1 }}
      />,
    );

    expect(
      screen.getByRole("option", { name: "Chain (pattern)" }),
    ).toBeDefined();
    expect(screen.getByRole("option", { name: "Rows" })).toBeDefined();
  });
});
