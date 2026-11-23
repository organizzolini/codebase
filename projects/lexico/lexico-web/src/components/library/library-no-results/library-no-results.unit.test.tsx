import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryNoResults } from "./library-no-results";

describe(LibraryNoResults, () => {
  it("applies its class name", () => {
    render(
      <LibraryNoResults
        className="library-no-results"
        hasFilters={false}
        onClearSearch={vi.fn<() => void>()}
        onResetFilters={vi.fn<() => void>()}
        search=""
      />,
    );

    expect(screen.getByTestId("library-no-results").className).toBe(
      "library-no-results",
    );
  });

  it("offers to reset the filters and to clear the search", () => {
    const onClearSearch = vi.fn<() => void>();
    const onResetFilters = vi.fn<() => void>();
    render(
      <LibraryNoResults
        onClearSearch={onClearSearch}
        onResetFilters={onResetFilters}
        search="zzz"
        hasFilters
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset all filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onResetFilters).toHaveBeenCalledTimes(1);
    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("offers nothing to undo for an empty library", () => {
    render(
      <LibraryNoResults
        hasFilters={false}
        onClearSearch={vi.fn<() => void>()}
        onResetFilters={vi.fn<() => void>()}
        search=""
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });
});
