import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { FilterOperandEditor } from "./filter-operand-editor";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { FilterField, FilterRule } from "./gallery-filter-builder.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The fixture field a key names. */
function field(key: string): FilterField {
  const found = FIELDS.find((candidate) => candidate.key === key);

  if (found === undefined) {
    throw new Error(key);
  }

  return found;
}

describe(FilterOperandEditor, () => {
  it("applies its class name", () => {
    render(
      <FilterOperandEditor
        className="filter-operand-editor"
        field={field("rows")}
        onRuleChange={vi.fn<() => void>()}
        rule={{ field: "rows", operator: "eq", value: 0 }}
      />,
    );

    expect(screen.getByTestId("filter-operand-editor").className).toBe(
      "filter-operand-editor",
    );
  });

  it("offers a number its seven operators, and widens it to a range for between", () => {
    const onRuleChange = vi.fn<(rule: FilterRule) => void>();

    render(
      <FilterOperandEditor
        field={field("junctionCount")}
        onRuleChange={onRuleChange}
        rule={{ field: "junctionCount", operator: "gte", value: 3 }}
      />,
    );

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual(["=", "≠", "<", "≤", ">", "≥", "between"]);

    fireEvent.change(screen.getByLabelText("Operator"), {
      target: { value: "between" },
    });

    expect(onRuleChange).toHaveBeenCalledWith({
      field: "junctionCount",
      operator: "between",
      value: [3, 3],
    });
  });

  it("offers a boolean is and is not, and passes on a value edit", () => {
    const onRuleChange = vi.fn<(rule: FilterRule) => void>();

    render(
      <FilterOperandEditor
        field={field("isChain")}
        onRuleChange={onRuleChange}
        rule={{ field: "isChain", operator: "is", value: true }}
      />,
    );

    expect(
      screen
        .getAllByRole("option", { name: /^is/u })
        .map((option) => option.textContent),
    ).toStrictEqual(["is", "is not"]);

    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "false" },
    });

    expect(onRuleChange).toHaveBeenCalledWith({
      field: "isChain",
      operator: "is",
      value: false,
    });
  });
});
