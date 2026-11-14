import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { FilterValueEditor } from "./filter-value-editor";
import { createFilterFields } from "./gallery-filter-builder.utilities";

describe(FilterValueEditor, () => {
  it("applies its class name", () => {
    const [field] = createFilterFields(FIXTURE_CHARACTERISTICS);

    if (field === undefined) {
      throw new Error("no field");
    }

    render(
      <FilterValueEditor
        className="filter-value-editor"
        field={field}
        onValueChange={vi.fn<() => void>()}
        rule={{ field: "rows", operator: "eq", value: 1 }}
      />,
    );

    expect(screen.getByTestId("filter-value-editor").className).toBe(
      "filter-value-editor",
    );
  });
});
