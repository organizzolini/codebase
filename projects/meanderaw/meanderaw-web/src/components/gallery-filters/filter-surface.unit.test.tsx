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
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "a" });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Filter, 2 active" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("moves focus in when it opens and gives it back to the button when it closes", () => {
    render(
      <FilterSurface
        activeCount={0}
        kind="sheet"
      >
        <input aria-label="Inside" />
      </FilterSurface>,
    );

    const button = screen.getByRole("button", { name: "Filter" });

    fireEvent.click(button);

    expect(globalThis.document.activeElement).toBe(
      screen.getByRole("button", { name: "Done" }),
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(globalThis.document.activeElement).toBe(button);
  });

  it("keeps Tab inside a drawer or a sheet, wrapping from the last control to the first", () => {
    render(
      <FilterSurface
        activeCount={0}
        kind="drawer"
      >
        <input aria-label="Inside" />
      </FilterSurface>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    const done = screen.getByRole("button", { name: "Done" });
    const inside = screen.getByLabelText("Inside");

    inside.focus();

    const forward = fireEvent.keyDown(inside, { key: "Tab" });

    expect(forward).toBe(false);
    expect(globalThis.document.activeElement).toBe(done);

    const backward = fireEvent.keyDown(done, { key: "Tab", shiftKey: true });

    expect(backward).toBe(false);
    expect(globalThis.document.activeElement).toBe(inside);

    done.focus();

    expect(fireEvent.keyDown(done, { key: "Tab" })).toBe(true);
  });

  it("lets Tab leave a popover, which does not trap it", () => {
    render(
      <FilterSurface
        activeCount={0}
        kind="popover"
      >
        <input aria-label="Inside" />
      </FilterSurface>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    const inside = screen.getByLabelText("Inside");

    expect(fireEvent.keyDown(inside, { key: "Tab" })).toBe(true);
  });

  it("leaves Escape to a select, which uses it to close its list", () => {
    render(
      <FilterSurface
        activeCount={0}
        kind="popover"
      >
        <select aria-label="Pick">
          <option>one</option>
        </select>
      </FilterSurface>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    fireEvent.keyDown(screen.getByLabelText("Pick"), { key: "Escape" });

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("ignores Escape pressed when it is closed", () => {
    render(
      <FilterSurface
        activeCount={0}
        kind="popover"
      />,
    );
    fireEvent.keyDown(globalThis.document.body, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stays open, with its focus, when the kind changes as the window resizes", () => {
    const { rerender } = render(
      <FilterSurface
        activeCount={0}
        kind="popover"
      >
        <input aria-label="Inside" />
      </FilterSurface>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));

    const dialog = screen.getByRole("dialog");
    const inside = screen.getByLabelText("Inside");

    inside.focus();
    rerender(
      <FilterSurface
        activeCount={0}
        kind="sheet"
      >
        <input aria-label="Inside" />
      </FilterSurface>,
    );

    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(dialog.matches('[data-surface="sheet"]')).toBe(true);
    expect(globalThis.document.activeElement).toBe(inside);
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
