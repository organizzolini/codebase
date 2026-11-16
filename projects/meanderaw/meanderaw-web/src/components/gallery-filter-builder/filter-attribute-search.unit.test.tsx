import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../testing/meanders-api";

import { FilterAttributeSearch } from "./filter-attribute-search";
import { createFilterFields } from "./gallery-filter-builder.utilities";

import type { FilterField } from "./gallery-filter-builder.types";

const FIELDS = createFilterFields(FIXTURE_CHARACTERISTICS);

describe(FilterAttributeSearch, () => {
  it("applies its class name", () => {
    render(
      <FilterAttributeSearch
        className="filter-attribute-search"
        fields={FIELDS}
        onSelect={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByTestId("filter-attribute-search").className).toBe(
      "filter-attribute-search",
    );
  });

  it("lists the attributes by category with their kind and pattern marker", () => {
    render(
      <FilterAttributeSearch
        fields={FIELDS}
        onSelect={vi.fn<() => void>()}
      />,
    );

    expect(
      screen
        .getAllByRole("group")
        .map((group) => group.getAttribute("aria-label")),
    ).toStrictEqual(["shape", "path", "submatrix"]);

    const chain = screen.getByRole("option", { name: /Chain/u });

    expect(chain.textContent).toContain("boolean");
    expect(chain.textContent).toContain("pattern");
    expect(
      screen.getByRole("option", { name: /Rows/u }).textContent,
    ).not.toContain("pattern");
  });

  it("narrows the list as words are typed, and says when nothing matches", () => {
    render(
      <FilterAttributeSearch
        fields={FIELDS}
        onSelect={vi.fn<() => void>()}
      />,
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Search attributes" }),
      {
        target: { value: "junction" },
      },
    );

    expect(screen.getAllByRole("option")).toHaveLength(1);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zzz" },
    });

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No attributes match.")).toBeDefined();
  });

  it("picks the attribute clicked", () => {
    const onSelect = vi.fn<(field: FilterField) => void>();

    render(
      <FilterAttributeSearch
        fields={FIELDS}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: /Junction count/u }));

    expect(onSelect.mock.calls[0]?.[0].key).toBe("junctionCount");
  });

  it("moves through the list with the arrow keys, wrapping, and picks with Enter", () => {
    const onSelect = vi.fn<(field: FilterField) => void>();

    render(
      <FilterAttributeSearch
        fields={FIELDS}
        onSelect={onSelect}
      />,
    );

    const box = screen.getByRole("combobox");

    expect(box.getAttribute("aria-activedescendant")).toMatch(/-0$/u);

    fireEvent.keyDown(box, { key: "ArrowDown" });
    fireEvent.keyDown(box, { key: "ArrowDown" });

    expect(box.getAttribute("aria-activedescendant")).toMatch(/-2$/u);

    fireEvent.keyDown(box, { key: "ArrowUp" });
    fireEvent.keyDown(box, { key: "ArrowUp" });
    fireEvent.keyDown(box, { key: "ArrowUp" });

    expect(box.getAttribute("aria-activedescendant")).toMatch(/-6$/u);

    fireEvent.keyDown(box, { key: "Enter" });

    expect(onSelect.mock.calls[0]?.[0].key).toBe("junctionCount");

    fireEvent.keyDown(box, { key: "a" });

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("follows the mouse, and ignores the keys when nothing is listed", () => {
    const onSelect = vi.fn<() => void>();

    render(
      <FilterAttributeSearch
        fields={FIELDS}
        onSelect={onSelect}
      />,
    );
    fireEvent.mouseMove(screen.getByRole("option", { name: /Columns/u }));

    expect(
      screen
        .getByRole("option", { name: /Columns/u })
        .getAttribute("aria-selected"),
    ).toBe("true");

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zzz" },
    });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("lists a bounded number of a long catalog, and asks for a narrower search", () => {
    const many: FilterField[] = Array.from({ length: 80 }, (_, index) => ({
      category: "path",
      description: "Counts something",
      isInteger: false,
      isPattern: false,
      key: `count${String(index)}`,
      label: `Count ${String(index)}`,
      type: "number",
      valueCounts: [],
    }));

    render(
      <FilterAttributeSearch
        fields={many}
        onSelect={vi.fn<() => void>()}
      />,
    );

    expect(screen.getAllByRole("option")).toHaveLength(50);
    expect(screen.getByText(/Showing 50 of 80/u)).toBeDefined();
  });
});
