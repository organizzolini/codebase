import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { GalleryFilterBuilder } from "./gallery-filter-builder";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { GalleryFilterBuilderProperties } from "./gallery-filter-builder";

/** The properties the builder needs, over the fixture catalog. */
function properties(
  overrides: Partial<GalleryFilterBuilderProperties> = {},
): GalleryFilterBuilderProperties {
  return {
    fields: createFilterFields(FIXTURE_CHARACTERISTICS),
    isFull: false,
    onAdd: vi.fn<GalleryFilterBuilderProperties["onAdd"]>(),
    ...overrides,
  };
}

describe(GalleryFilterBuilder, () => {
  it("applies its class name", () => {
    render(
      <GalleryFilterBuilder
        {...properties()}
        className="gallery-filter-builder"
      />,
    );

    expect(screen.getByTestId("gallery-filter-builder").className).toBe(
      "gallery-filter-builder",
    );
  });

  it("asks for an attribute first, then its operator and value, and adds the rule", () => {
    const filter = properties();

    render(<GalleryFilterBuilder {...filter} />);
    fireEvent.click(screen.getByRole("option", { name: /Junction count/u }));

    expect(screen.getByText("How many junctions the path has")).toBeDefined();
    expect(
      screen.queryByRole("combobox", { name: "Search attributes" }),
    ).toBeNull();

    fireEvent.change(screen.getByLabelText("Operator"), {
      target: { value: "gte" },
    });
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "3" },
    });
    fireEvent.blur(screen.getByLabelText("Value"));
    fireEvent.click(screen.getByRole("button", { name: "Add filter" }));

    expect(filter.onAdd).toHaveBeenCalledWith({
      field: "junctionCount",
      operator: "gte",
      value: 3,
    });
    expect(
      screen.getByRole("combobox", { name: "Search attributes" }),
    ).toBeDefined();
  });

  it("goes back to the search to change the attribute", () => {
    render(<GalleryFilterBuilder {...properties()} />);
    fireEvent.click(screen.getByRole("option", { name: /Chain/u }));
    fireEvent.click(screen.getByRole("button", { name: "Change attribute" }));

    expect(
      screen.getByRole("combobox", { name: "Search attributes" }),
    ).toBeDefined();
  });

  it("will not add a lattice rule that has no text yet, or once the filter is full", () => {
    const { rerender } = render(<GalleryFilterBuilder {...properties()} />);

    fireEvent.click(screen.getByRole("option", { name: /Lattice/u }));

    const add = screen.getByRole("button", { name: "Add filter" });

    expect(add.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "square" },
    });
    fireEvent.blur(screen.getByLabelText("Value"));

    expect(add.hasAttribute("disabled")).toBe(false);

    rerender(<GalleryFilterBuilder {...properties({ isFull: true })} />);

    expect(
      screen
        .getByRole("button", { name: "Add filter" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
