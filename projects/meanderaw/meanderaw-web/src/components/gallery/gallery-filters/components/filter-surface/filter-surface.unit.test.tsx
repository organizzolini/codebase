import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterSurface } from "./filter-surface";

import type { FilterSurfaceProperties } from "./filter-surface";

/** The properties a surface needs, closed and with no active filters. */
function properties(
  overrides: Partial<FilterSurfaceProperties> = {},
): FilterSurfaceProperties {
  return {
    activeCount: 0,
    isOpen: false,
    onOpenChange: vi.fn<FilterSurfaceProperties["onOpenChange"]>(),
    ...overrides,
  };
}

describe(FilterSurface, () => {
  it("applies its class name", () => {
    render(
      <FilterSurface
        {...properties()}
        className="filter-surface"
      />,
    );

    expect(screen.getByTestId("filter-surface").className).toBe(
      "filter-surface",
    );
  });

  it("asks to open when its button is pressed, and to close when it is pressed open", () => {
    const closed = properties();
    const { rerender } = render(<FilterSurface {...closed} />);

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    expect(closed.onOpenChange).toHaveBeenLastCalledWith(true);

    const open = properties({ isOpen: true });

    rerender(<FilterSurface {...open} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    expect(open.onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("badges the button with the active count", () => {
    render(<FilterSurface {...properties({ activeCount: 2 })} />);

    expect(
      screen.getByRole("button", { name: "Filter, 2 active" }),
    ).toBeDefined();
  });

  it("shows a popup holding its children, asks to close on the backdrop, and moves focus in", () => {
    const open = properties({ isOpen: true });

    render(
      <FilterSurface {...open}>
        <input aria-label="Inside" />
      </FilterSurface>,
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(globalThis.document.activeElement).toBe(
      screen.getByLabelText("Inside"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Close filters" }));

    expect(open.onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("asks to close on Escape, except one pressed in a select, which keeps it", () => {
    const open = properties({ isOpen: true });

    render(
      <FilterSurface {...open}>
        <select aria-label="Pick">
          <option>one</option>
        </select>
      </FilterSurface>,
    );
    fireEvent.keyDown(screen.getByLabelText("Pick"), { key: "Escape" });

    expect(open.onOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "a" });

    expect(open.onOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(open.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("gives focus back to its button when it closes", () => {
    const { rerender } = render(
      <FilterSurface {...properties({ isOpen: true })} />,
    );

    rerender(<FilterSurface {...properties({ isOpen: false })} />);

    expect(globalThis.document.activeElement).toBe(
      screen.getByRole("button", { name: "Filter" }),
    );
  });
});
