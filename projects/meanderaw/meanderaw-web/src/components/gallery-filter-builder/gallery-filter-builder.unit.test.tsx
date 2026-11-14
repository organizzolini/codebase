import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { GalleryFilterBuilder } from "./gallery-filter-builder";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { GalleryFilterBuilderProperties } from "./gallery-filter-builder";
import type { FilterGroup } from "./gallery-filter-builder.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

/** The properties a builder needs, over the fixture catalog. */
function properties(
  overrides: Partial<GalleryFilterBuilderProperties> = {},
): GalleryFilterBuilderProperties {
  return {
    fields: FIELDS,
    filter: undefined,
    onFilterChange: vi.fn<GalleryFilterBuilderProperties["onFilterChange"]>(),
    ...overrides,
  };
}

/** A tree holding the rules given, under and. */
function tree(...rules: FilterGroup["rules"]): FilterGroup {
  return { combinator: "and", rules };
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

  it("asks for a first rule when it holds none", () => {
    const filter = properties();

    render(<GalleryFilterBuilder {...filter} />);

    expect(screen.getByText(/No filters yet/u)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    expect(filter.onFilterChange).toHaveBeenCalledWith(
      tree({ field: "rows", operator: "eq", value: 0 }),
    );
  });

  it("adds a nested group holding a rule, and gives the root back when it is emptied", () => {
    const filter = properties({
      filter: tree({ field: "rows", operator: "eq", value: 2 }),
    });

    render(<GalleryFilterBuilder {...filter} />);
    fireEvent.click(screen.getByRole("button", { name: "Add group" }));

    expect(filter.onFilterChange).toHaveBeenLastCalledWith(
      tree(
        { field: "rows", operator: "eq", value: 2 },
        tree({ field: "rows", operator: "eq", value: 0 }),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove rule" }));

    expect(vi.mocked(filter.onFilterChange).mock.lastCall).toStrictEqual([
      undefined,
    ]);
  });

  it("limits how deep groups nest", () => {
    let deep = tree({ field: "rows", operator: "eq", value: 1 });

    for (let level = 0; level < 5; level += 1) {
      deep = tree(deep);
    }

    render(<GalleryFilterBuilder {...properties({ filter: deep })} />);

    const innermost = screen.getByRole("group", {
      name: "Filter group 1.1.1.1.1",
    });

    expect(
      within(innermost)
        .getByRole("button", { name: "Add group" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("joins a group by any, and removes a nested group", () => {
    const filter = properties({
      filter: tree(tree({ field: "rows", operator: "eq", value: 2 })),
    });

    render(<GalleryFilterBuilder {...filter} />);

    const [rootMatch] = screen.getAllByLabelText("Match");

    if (rootMatch === undefined) {
      throw new Error("no combinator");
    }

    fireEvent.change(rootMatch, { target: { value: "or" } });

    expect(filter.onFilterChange).toHaveBeenLastCalledWith({
      combinator: "or",
      rules: [tree({ field: "rows", operator: "eq", value: 2 })],
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove group" }));

    expect(vi.mocked(filter.onFilterChange).mock.lastCall).toStrictEqual([
      undefined,
    ]);
  });

  it("offers each kind of field its own operators and value editor", () => {
    const filter = properties({
      filter: tree({ field: "junctionCount", operator: "eq", value: 3 }),
    });

    render(<GalleryFilterBuilder {...filter} />);

    expect(
      within(screen.getByLabelText("Operator"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toStrictEqual(["=", "≠", "<", "≤", ">", "≥", "between"]);

    fireEvent.change(screen.getByLabelText("Operator"), {
      target: { value: "between" },
    });

    expect(filter.onFilterChange).toHaveBeenLastCalledWith(
      tree({ field: "junctionCount", operator: "between", value: [3, 3] }),
    );

    fireEvent.change(screen.getByLabelText("Field"), {
      target: { value: "isChain" },
    });

    expect(filter.onFilterChange).toHaveBeenLastCalledWith(
      tree({ field: "isChain", operator: "is", value: true }),
    );
  });

  it("edits a number, a range, a flag and a text", () => {
    const rule = (
      value: number | string,
      field = "junctionCount",
    ): FilterGroup =>
      tree({
        field,
        operator: typeof value === "string" ? "eq" : "gte",
        value,
      });
    const number = properties({ filter: rule(1) });
    const { rerender } = render(<GalleryFilterBuilder {...number} />);

    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "4.5" },
    });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "x" },
    });

    expect(number.onFilterChange).toHaveBeenCalledTimes(1);
    expect(number.onFilterChange).toHaveBeenCalledWith(rule(4.5));

    const whole = properties({ filter: rule(1, "rows") });

    rerender(<GalleryFilterBuilder {...whole} />);
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "2.9" },
    });

    expect(whole.onFilterChange).toHaveBeenCalledWith(rule(2, "rows"));

    const text = properties({ filter: rule("0", "lattice") });

    rerender(<GalleryFilterBuilder {...text} />);
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "square" },
    });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "" } });

    expect(text.onFilterChange).toHaveBeenCalledTimes(1);

    const flag = properties({
      filter: tree({ field: "isChain", operator: "is", value: true }),
    });

    rerender(<GalleryFilterBuilder {...flag} />);
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "false" },
    });

    expect(flag.onFilterChange).toHaveBeenCalledWith(
      tree({ field: "isChain", operator: "is", value: false }),
    );

    const range = properties({
      filter: tree({
        field: "junctionCount",
        operator: "between",
        value: [1, 4],
      }),
    });

    rerender(<GalleryFilterBuilder {...range} />);
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "3" } });

    expect(range.onFilterChange).toHaveBeenNthCalledWith(
      1,
      tree({ field: "junctionCount", operator: "between", value: [2, 4] }),
    );
    expect(range.onFilterChange).toHaveBeenNthCalledWith(
      2,
      tree({ field: "junctionCount", operator: "between", value: [1, 3] }),
    );
  });

  it("shows what the field in the rule measures, with its counts", () => {
    render(
      <GalleryFilterBuilder
        {...properties({
          filter: tree({ field: "isChain", operator: "is", value: true }),
        })}
      />,
    );

    expect(screen.getByTestId("filter-field-details").textContent).toBe(
      "Whether the path is one chain · path · boolean · pattern · meanders by value 1: 3",
    );
    expect(
      within(screen.getByLabelText("Field"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toContain("Chain (pattern)");
  });

  it("keeps a rule naming a field it does not know, without an operator", () => {
    render(
      <GalleryFilterBuilder
        {...properties({
          filter: tree({ field: "gone", operator: "eq", value: 1 }),
        })}
      />,
    );

    expect(screen.getByText("gone")).toBeDefined();
    expect(screen.queryByLabelText("Operator")).toBeNull();
  });
});
