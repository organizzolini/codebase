import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../../../testing/meanders-api";
import { createFilterFields } from "../../gallery-filter-builder.utilities";

import { FilterValueEditor } from "./filter-value-editor";

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

  it("edits a flag with a true or false pick", () => {
    const onValueChange = vi.fn<(value: unknown) => void>();
    const [field] = createFilterFields(FIXTURE_CHARACTERISTICS).slice(-2);

    if (field === undefined) {
      throw new Error("no field");
    }

    render(
      <FilterValueEditor
        field={field}
        onValueChange={onValueChange}
        rule={{ field: "isChain", operator: "is", value: true }}
      />,
    );
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "false" },
    });

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it("edits the two ends of a range, each as a number", () => {
    const onValueChange = vi.fn<(value: unknown) => void>();
    const [field] = createFilterFields(FIXTURE_CHARACTERISTICS);

    if (field === undefined) {
      throw new Error("no field");
    }

    render(
      <FilterValueEditor
        field={field}
        onValueChange={onValueChange}
        rule={{ field: "rows", operator: "between", value: [1, 4] }}
      />,
    );
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "6" } });
    fireEvent.blur(screen.getByLabelText("To"));

    expect(onValueChange).toHaveBeenCalledWith([1, 6]);
  });
});
