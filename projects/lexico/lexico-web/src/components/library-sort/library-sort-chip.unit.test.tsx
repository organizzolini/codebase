import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../graphql/generated/operations";

import { LibrarySortChip } from "./library-sort-chip";

import type { LibrarySortChipProperties } from "./library-sort-chip";

describe(LibrarySortChip, () => {
  it("applies its class name", () => {
    render(
      <LibrarySortChip
        className="library-sort-chip"
        onSort={vi.fn<LibrarySortChipProperties["onSort"]>()}
        sort={LibrarySortField.TextTitle}
      />,
    );

    expect(screen.getByTestId("library-sort-chip").className).toBe(
      "library-sort-chip",
    );
  });

  it("names the attribute and direction", () => {
    render(
      <LibrarySortChip
        direction={LibrarySortDirection.Desc}
        onSort={vi.fn<LibrarySortChipProperties["onSort"]>()}
        sort={LibrarySortField.TextTitle}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Sort by Text title, descending" }),
    ).toBeDefined();
  });

  it("flips the direction and removes the sort", () => {
    const onSort = vi.fn<LibrarySortChipProperties["onSort"]>();
    render(
      <LibrarySortChip
        onSort={onSort}
        sort={LibrarySortField.TextTitle}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Switch to descending/u }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove sort" }));

    expect(onSort).toHaveBeenNthCalledWith(
      1,
      LibrarySortField.TextTitle,
      LibrarySortDirection.Desc,
    );
    expect(onSort).toHaveBeenNthCalledWith(2);
  });
});
