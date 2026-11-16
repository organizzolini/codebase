import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibrarySearch } from "./library-search";

describe(LibrarySearch, () => {
  it("applies its class name", () => {
    render(
      <LibrarySearch
        className="library-search"
        onSearch={vi.fn<(search: string) => void>()}
        search=""
      />,
    );

    expect(screen.getByTestId("library-search").className).toBe(
      "library-search",
    );
  });

  it("submits the trimmed search", () => {
    const onSearch = vi.fn<(search: string) => void>();
    render(
      <LibrarySearch
        onSearch={onSearch}
        search=""
      />,
    );

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search the library" }),
      { target: { value: "  ovid " } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith("ovid");
  });
});
