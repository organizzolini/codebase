import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { FilterGroupEditor } from "./filter-group-editor";
import { createFilterFields } from "./gallery-filter-builder.utilities";

describe(FilterGroupEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterGroupEditor
        className="filter-group-editor"
        fields={createFilterFields(FIXTURE_CHARACTERISTICS)}
        group={{ combinator: "and", rules: [] }}
        onEdit={vi.fn<() => void>()}
        path={[]}
      />,
    );

    expect(screen.getByTestId("filter-group-editor").className).toBe(
      "filter-group-editor",
    );
  });
});
