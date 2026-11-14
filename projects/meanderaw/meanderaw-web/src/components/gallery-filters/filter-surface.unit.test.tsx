import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilterSurface } from "./filter-surface";

describe(FilterSurface, () => {
  it("applies its class name", () => {
    render(
      <FilterSurface
        activeCount={0}
        className="filter-surface"
        kind="popover"
      />,
    );

    expect(screen.getByTestId("filter-surface").className).toBe(
      "filter-surface",
    );
  });

  it("opens from the button and closes with the backdrop, Escape or Done", () => {
    render(
      <FilterSurface
        activeCount={2}
        kind="drawer"
      >
        <p>Builder</p>
      </FilterSurface>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Filter, 2 active" }));

    expect(screen.getByRole("dialog").matches('[data-surface="drawer"]')).toBe(
      true,
    );
    expect(screen.getByText("Builder")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Close filters" }));

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Filter, 2 active" }));
    fireEvent.keyDown(globalThis.window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Filter, 2 active" }));
    fireEvent.keyDown(globalThis.window, { key: "a" });
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a popover with no header of its own, and toggles on its button", () => {
    render(
      <FilterSurface
        activeCount={0}
        kind="popover"
      />,
    );

    const button = screen.getByRole("button", { name: "Filter" });

    fireEvent.click(button);

    expect(screen.queryByRole("button", { name: "Done" })).toBeNull();
    expect(screen.getByRole("dialog").matches('[data-surface="popover"]')).toBe(
      true,
    );

    fireEvent.click(button);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
