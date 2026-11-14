import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { FilterGroupEditor } from "./filter-group-editor";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { FilterGroup } from "./gallery-filter-builder.types";

describe(FilterGroupEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterGroupEditor
        className="filter-group-editor"
        fields={createFilterFields(FIXTURE_CHARACTERISTICS)}
        group={{ combinator: "and", rules: [] }}
        isFull={false}
        onEdit={vi.fn<() => void>()}
        path={[]}
      />,
    );

    expect(screen.getByTestId("filter-group-editor").className).toBe(
      "filter-group-editor",
    );
  });

  it("names itself by its place in the tree, and adds a rule at its path", () => {
    const onEdit = vi.fn<(edit: (root: FilterGroup) => FilterGroup) => void>();

    render(
      <FilterGroupEditor
        fields={createFilterFields(FIXTURE_CHARACTERISTICS)}
        group={{ combinator: "or", rules: [] }}
        isFull={false}
        onEdit={onEdit}
        path={[1, 0]}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Filter group 2.1" }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    const edit = onEdit.mock.calls[0]?.[0];

    if (edit === undefined) {
      throw new Error("no edit");
    }
    const root: FilterGroup = {
      combinator: "and",
      rules: [
        { field: "rows", operator: "eq", value: 1 },
        { combinator: "or", rules: [{ combinator: "and", rules: [] }] },
      ],
    };

    expect(JSON.stringify(edit(root))).toContain(
      '"field":"rows","operator":"eq","value":0',
    );
  });
});
