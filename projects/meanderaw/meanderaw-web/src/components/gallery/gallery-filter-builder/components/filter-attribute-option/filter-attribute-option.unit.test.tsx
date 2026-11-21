import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SHAPE_FILTER_FIELDS } from "../../gallery-filter-builder.constants";

import { FilterAttributeOption } from "./filter-attribute-option";

import type { FilterField } from "../../gallery-filter-builder.types";

const FIELD: FilterField = SHAPE_FILTER_FIELDS[0] ?? {
  category: "shape",
  description: "",
  isInteger: true,
  isPattern: false,
  key: "rows",
  label: "Rows",
  type: "number",
  valueCounts: [],
};

describe(FilterAttributeOption, () => {
  it("applies its class name", () => {
    render(
      <FilterAttributeOption
        className="filter-attribute-option"
        field={FIELD}
        id="option"
        isActive={false}
        onActivate={vi.fn<() => void>()}
        onSelect={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByTestId("filter-attribute-option").className).toBe(
      "filter-attribute-option",
    );
  });

  it("shows the name, kind and description, marks a pattern, and reports a click and the mouse", () => {
    const onActivate = vi.fn<() => void>();
    const onSelect = vi.fn<() => void>();

    render(
      <FilterAttributeOption
        field={{ ...FIELD, isPattern: true }}
        id="option"
        onActivate={onActivate}
        onSelect={onSelect}
        isActive
      />,
    );

    const option = screen.getByRole("option");

    expect(option.textContent).toContain("Rows");
    expect(option.textContent).toContain("number");
    expect(option.textContent).toContain("pattern");
    expect(option.getAttribute("aria-selected")).toBe("true");

    fireEvent.mouseMove(option);
    fireEvent.click(option);

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
