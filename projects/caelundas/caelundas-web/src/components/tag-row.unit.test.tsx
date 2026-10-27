import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagRow } from "./tag-row";

import type { TagTreeRow } from "../types/event-filter-tag-tree.types";

const ROW: TagTreeRow = {
  depth: 0,
  hasChildren: true,
  isExpanded: false,
  item: { description: "400 events", label: "Aspect", value: "aspect" },
  name: "Aspect",
  selectedBelow: 2,
  state: "partial",
};

function renderRow(
  overrides: Partial<{
    onOpenChange: (id: string, open: boolean) => void;
    onToggle: (id: string) => void;
  }> = {},
): void {
  render(
    <TagRow
      className="tag-row"
      onKeyDown={vi.fn<() => void>()}
      onOpenChange={overrides.onOpenChange ?? vi.fn<() => void>()}
      onToggle={overrides.onToggle ?? vi.fn<() => void>()}
      row={ROW}
    />,
  );
}

describe(TagRow, () => {
  it("applies its class name", () => {
    render(
      <TagRow
        className="tag-row"
        onKeyDown={vi.fn<() => void>()}
        onOpenChange={vi.fn<() => void>()}
        onToggle={vi.fn<() => void>()}
        row={ROW}
      />,
    );

    expect(screen.getByTestId("tag-row").className).toBe("tag-row");
  });

  it("ticks the tag on a click and opens it from its handle", () => {
    const onOpenChange = vi.fn<(id: string, open: boolean) => void>();
    const onToggle = vi.fn<(id: string) => void>();

    renderRow({ onOpenChange, onToggle });
    fireEvent.click(screen.getByRole("option"));
    fireEvent.click(screen.getByRole("button", { name: "Expand Aspect" }));

    expect(onToggle).toHaveBeenCalledExactlyOnceWith("aspect");
    expect(onOpenChange).toHaveBeenCalledWith("aspect", true);
  });

  it("counts the picks inside a closed tag", () => {
    renderRow();

    expect(screen.getByText("2")).toBeDefined();
  });
});
