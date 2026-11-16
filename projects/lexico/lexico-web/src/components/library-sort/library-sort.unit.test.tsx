import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../graphql/generated/operations";

import { LibrarySort } from "./library-sort";

import type { LibrarySortProperties } from "./library-sort";

type LibrarySortHandler = LibrarySortProperties["onSort"];

describe(LibrarySort, () => {
  it("applies its class name", () => {
    render(
      <LibrarySort
        className="library-sort"
        onSort={vi.fn<LibrarySortHandler>()}
      />,
    );

    expect(screen.getByTestId("library-sort").className).toBe("library-sort");
  });

  it("reports the attribute picked, keeping the direction", () => {
    const onSort = vi.fn<LibrarySortHandler>();
    render(
      <LibrarySort
        direction={LibrarySortDirection.Desc}
        onSort={onSort}
      />,
    );
    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: LibrarySortField.AuthorName },
    });

    expect(onSort).toHaveBeenCalledWith(
      LibrarySortField.AuthorName,
      LibrarySortDirection.Desc,
    );
  });

  it("disables the direction until an attribute is picked", () => {
    render(<LibrarySort onSort={vi.fn<LibrarySortHandler>()} />);

    expect(screen.getByLabelText<HTMLSelectElement>("Direction").disabled).toBe(
      true,
    );
  });

  it("reports the default order when the attribute is cleared", () => {
    const onSort = vi.fn<LibrarySortHandler>();
    render(
      <LibrarySort
        onSort={onSort}
        sort={LibrarySortField.AuthorName}
      />,
    );
    fireEvent.change(screen.getByLabelText("Sort by"), {
      target: { value: "" },
    });

    expect(onSort).toHaveBeenCalledWith(undefined, undefined);
  });
});
