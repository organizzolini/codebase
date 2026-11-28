import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ColumnPicker } from "./column-picker";

import type { CascaderNode } from "@codebase/presentation";

const ITEMS: CascaderNode[] = [
  { label: "Name", value: "name" },
  { label: "Start", value: "start" },
];

describe(ColumnPicker, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("opens a list of the columns, with those shown ticked", async () => {
    render(
      <ColumnPicker
        ids={["name"]}
        items={ITEMS}
        onColumnsChange={vi.fn<
          (columns: readonly string[] | undefined) => void
        >()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    const name = await screen.findByRole("treeitem", { name: /Name/u });

    expect(name.getAttribute("aria-selected")).toBe("true");
    expect(
      screen
        .getByRole("treeitem", { name: /Start/u })
        .getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("hands the columns ticked to the change handler", async () => {
    const onColumnsChange =
      vi.fn<(columns: readonly string[] | undefined) => void>();

    render(
      <ColumnPicker
        ids={["name"]}
        items={ITEMS}
        onColumnsChange={onColumnsChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(await screen.findByRole("treeitem", { name: /Start/u }));

    expect(onColumnsChange).toHaveBeenCalledWith(["name", "start"]);
  });
});
