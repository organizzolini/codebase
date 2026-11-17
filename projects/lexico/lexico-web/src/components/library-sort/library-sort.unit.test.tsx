import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../graphql/generated/operations";

import { LibrarySort } from "./library-sort";

import type { LibrarySortProperties } from "./library-sort";

describe(LibrarySort, () => {
  it("applies its class name", () => {
    render(
      <LibrarySort
        className="library-sort"
        onSort={vi.fn<LibrarySortProperties["onSort"]>()}
      />,
    );

    expect(screen.getByTestId("library-sort").className).toBe("library-sort");
  });

  it("chooses an attribute, ascending by default", async () => {
    const onSort = vi.fn<LibrarySortProperties["onSort"]>();
    render(<LibrarySort onSort={onSort} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Author era" }),
    );

    expect(onSort).toHaveBeenCalledWith(
      LibrarySortField.AuthorEra,
      LibrarySortDirection.Asc,
    );
  });
});
