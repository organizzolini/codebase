import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { FilterRuleEditor } from "./filter-rule-editor";
import { createFilterFields } from "./gallery-filter-builder.utilities";

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
});
