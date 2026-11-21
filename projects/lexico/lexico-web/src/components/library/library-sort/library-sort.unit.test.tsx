import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";

import { LibrarySort } from "./library-sort";

import type { LibrarySortProperties } from "./library-sort";

const ERA = {
  direction: LibrarySortDirection.Asc,
  field: LibrarySortField.AuthorEra,
};

describe(LibrarySort, () => {
  it("applies its class name", () => {
    render(
      <LibrarySort
        className="library-sort"
        onSorts={vi.fn<LibrarySortProperties["onSorts"]>()}
      />,
    );

    expect(screen.getByTestId("library-sort").className).toBe("library-sort");
  });

  it("adds an attribute last, ascending", async () => {
    const onSorts = vi.fn<LibrarySortProperties["onSorts"]>();
    render(
      <LibrarySort
        onSorts={onSorts}
        sorts={[ERA]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(await screen.findByRole("option", { name: "Text title" }));

    expect(onSorts).toHaveBeenCalledWith([
      ERA,
      {
        direction: LibrarySortDirection.Asc,
        field: LibrarySortField.TextTitle,
      },
    ]);
  });

  it("checks the attributes already sorted, and removes one chosen again", async () => {
    const onSorts = vi.fn<LibrarySortProperties["onSorts"]>();
    render(
      <LibrarySort
        onSorts={onSorts}
        sorts={[ERA]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    const era = await screen.findByRole("option", {
      name: "Author era",
    });

    expect(within(era).getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "true",
    );

    fireEvent.click(era);

    expect(onSorts).toHaveBeenCalledWith([]);
  });

  it("shows a chip for each sort in order and flips or removes one", () => {
    const onSorts = vi.fn<LibrarySortProperties["onSorts"]>();
    const title = {
      direction: LibrarySortDirection.Desc,
      field: LibrarySortField.TextTitle,
    };
    render(
      <LibrarySort
        onSorts={onSorts}
        sorts={[ERA, title]}
      />,
    );

    expect(
      screen
        .getAllByTestId("library-sort-chip")
        .map((chip) => chip.textContent),
    ).toStrictEqual(["Author era", "Text title"]);

    fireEvent.click(
      screen.getByRole("button", { name: /Switch to descending/u }),
    );

    expect(onSorts).toHaveBeenLastCalledWith([
      { ...ERA, direction: LibrarySortDirection.Desc },
      title,
    ]);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove sort by Text title" }),
    );

    expect(onSorts).toHaveBeenLastCalledWith([ERA]);
  });
});
