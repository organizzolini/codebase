import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterRowsEditor } from "./filter-rows-editor";
import { DEFAULT_ROWS_FILTER } from "./gallery-filter-builder.constants";

describe(FilterRowsEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterRowsEditor
        className="filter-rows-editor"
        onRowsChange={vi.fn<() => void>()}
        rows={DEFAULT_ROWS_FILTER}
      />,
    );

    expect(screen.getByTestId("filter-rows-editor").className).toBe(
      "filter-rows-editor",
    );
  });

  it("changes the operator, turning a number into a range, and offers no way to remove the rule", () => {
    const onRowsChange = vi.fn<(rows: unknown) => void>();

    render(
      <FilterRowsEditor
        onRowsChange={onRowsChange}
        rows={DEFAULT_ROWS_FILTER}
      />,
    );
    fireEvent.change(screen.getByLabelText("Rows operator"), {
      target: { value: "between" },
    });

    expect(onRowsChange).toHaveBeenCalledWith({
      operator: "between",
      value: [4, 4],
    });
    expect(
      screen
        .getByRole("button", { name: "Remove rows rule" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
