import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";

import { LibrarySort } from "./library-sort";

import type { LibrarySortProperties } from "./library-sort";
import type { ReactNode } from "react";

// jsdom cannot drag, so a stand-in for Sortable reports the reversed order from a button.
vi.mock("@codebase/presentation", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  Sortable: ({
    children,
    onValueChange,
    value,
  }: {
    children: ReactNode;
    onValueChange: (value: string[]) => void;
    value: string[];
  }) => (
    <div>
      {children}
      <button
        onClick={() => {
          onValueChange(value.map((_, index, all) => all.at(-1 - index) ?? ""));
        }}
        type="button"
      >
        Reverse
      </button>
    </div>
  ),
}));
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
      screen.getAllByTestId("library-chip").map((chip) => chip.textContent),
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

  it("applies a drag as the new order of the sorts, keeping directions", () => {
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

    fireEvent.click(screen.getByRole("button", { name: "Reverse" }));

    expect(onSorts).toHaveBeenCalledExactlyOnceWith([title, ERA]);
  });

  it("gives each chip a drag handle and a cross, and a click on the label keeps flipping", () => {
    render(
      <LibrarySort
        onSorts={vi.fn<LibrarySortProperties["onSorts"]>()}
        sorts={[ERA]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Reorder Author era" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Remove sort by Author era" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Switch to descending/u }),
    ).toBeDefined();
  });
});
