import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";
import { createFilterFields } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterPill } from "./filter-pill";

import type { FilterField } from "../gallery-filter-builder/gallery-filter-builder.types";
import type { FilterPillProperties } from "./filter-pill";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The fixture field a key names. */
function field(key: string): FilterField {
  const found = FIELDS.find((candidate) => candidate.key === key);

  if (found === undefined) {
    throw new Error(key);
  }

  return found;
}

/** The properties a pill needs, for a junction count rule. */
function properties(
  overrides: Partial<FilterPillProperties> = {},
): FilterPillProperties {
  return {
    field: field("junctionCount"),
    onRemove: vi.fn<() => void>(),
    onRuleChange: vi.fn<FilterPillProperties["onRuleChange"]>(),
    rule: { field: "junctionCount", operator: "gte", value: 3 },
    ...overrides,
  };
}

describe(FilterPill, () => {
  it("applies its class name", () => {
    render(
      <FilterPill
        {...properties()}
        className="filter-pill"
      />,
    );

    expect(screen.getByTestId("filter-pill").className).toBe("filter-pill");
  });

  it("shows the attribute, operator and value, and edits the operator in place", () => {
    const pill = properties();

    render(<FilterPill {...pill} />);

    expect(screen.getByText("Junction count")).toBeDefined();
    expect(
      screen.getByLabelText<HTMLInputElement>("Junction count Value").value,
    ).toBe("3");

    fireEvent.change(screen.getByLabelText("Junction count operator"), {
      target: { value: "between" },
    });

    expect(pill.onRuleChange).toHaveBeenCalledWith({
      field: "junctionCount",
      operator: "between",
      value: [3, 3],
    });
  });

  it("edits the value on blur", () => {
    const pill = properties();

    render(<FilterPill {...pill} />);
    fireEvent.change(screen.getByLabelText("Junction count Value"), {
      target: { value: "5" },
    });
    fireEvent.blur(screen.getByLabelText("Junction count Value"));

    expect(pill.onRuleChange).toHaveBeenCalledWith({
      field: "junctionCount",
      operator: "gte",
      value: 5,
    });
  });

  it("removes its rule from a button, and has none when the rule is required", () => {
    const pill = properties();
    const { rerender } = render(<FilterPill {...pill} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove Junction count filter" }),
    );

    expect(pill.onRemove).toHaveBeenCalledTimes(1);

    rerender(<FilterPill {...properties({ onRemove: undefined })} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("reads a rule on an attribute the catalog lacks, without editing it", () => {
    render(
      <FilterPill
        {...properties({
          field: undefined,
          rule: { field: "retired", operator: "eq", value: 1 },
        })}
      />,
    );

    expect(screen.getByText("retired = 1")).toBeDefined();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
