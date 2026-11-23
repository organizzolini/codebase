import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryCascader } from "./gallery-cascader";
import { createFieldNodes } from "./gallery-cascader.utilities";

import type { GalleryCascaderProperties } from "./gallery-cascader";
import type { PickerField } from "./gallery-cascader.types";

const FIELDS: PickerField[] = [
  {
    category: "submatrix",
    description: "Holds a chain.",
    key: "isChain",
    label: "Chain",
  },
  {
    category: "shape",
    description: "How many rows",
    key: "rows",
    label: "Rows",
  },
  {
    category: "path",
    description: "Pieces of ink.",
    key: "junctionCount",
    label: "Junction count",
  },
  {
    category: "shape",
    description: "How many columns",
    key: "columns",
    label: "Columns",
  },
];

/** The text of every option on show, spaces squeezed. */
function optionsShown(): string[] {
  return screen
    .getAllByRole("option")
    .map((option) => option.textContent.replaceAll(/\s+/gu, " ").trim());
}

/** The properties a cascader needs, over four fields and none ticked. */
function properties(
  overrides: Partial<GalleryCascaderProperties> = {},
): GalleryCascaderProperties {
  return {
    checked: [],
    items: createFieldNodes(FIELDS),
    label: "Group by",
    onToggle: vi.fn<GalleryCascaderProperties["onToggle"]>(),
    ...overrides,
  };
}

describe(GalleryCascader, () => {
  it("applies its class name", () => {
    render(
      <GalleryCascader
        {...properties()}
        className="gallery-cascader"
      />,
    );

    expect(screen.getByTestId("gallery-cascader").className).toBe(
      "gallery-cascader",
    );
  });

  it("opens on the categories, shape first, behind a search box named for what it picks", () => {
    render(<GalleryCascader {...properties()} />);

    expect(screen.getByPlaceholderText("Group by")).toBeDefined();
    expect(optionsShown()).toStrictEqual([
      expect.stringContaining("Shape"),
      expect.stringContaining("Path"),
      expect.stringContaining("Submatrix"),
    ]);
  });

  it("drills into a category to its fields, each with its description, and hands over the one pressed", () => {
    const onToggle = vi.fn<GalleryCascaderProperties["onToggle"]>();

    render(<GalleryCascader {...properties({ onToggle })} />);
    fireEvent.click(screen.getByRole("option", { name: /Shape/u }));

    expect(optionsShown()).toStrictEqual([
      expect.stringContaining("Rows"),
      expect.stringContaining("Columns"),
    ]);
    expect(screen.getByText("How many rows")).toBeDefined();

    fireEvent.click(screen.getByRole("option", { name: /Columns/u }));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith("columns");
  });

  it("checks the fields ticked", () => {
    render(<GalleryCascader {...properties({ checked: ["rows"] })} />);
    fireEvent.click(screen.getByRole("option", { name: /Shape/u }));

    expect(
      screen
        .getAllByRole("option")
        .map((option) => option.getAttribute("aria-selected")),
    ).toStrictEqual(["true", "false"]);
  });

  it("finds a field in any category by searching", async () => {
    render(<GalleryCascader {...properties()} />);
    fireEvent.change(screen.getByPlaceholderText("Group by"), {
      target: { value: "junction" },
    });

    await screen.findByRole("option", { name: /Junction count/u });

    expect(optionsShown()).toStrictEqual([
      expect.stringContaining("Junction count"),
    ]);
  });
});
