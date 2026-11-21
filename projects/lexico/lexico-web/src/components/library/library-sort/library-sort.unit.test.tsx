import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { stubAnimations } from "../../../../testing/animations";
import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";

import { LibrarySort } from "./library-sort";

import type { LibrarySortProperties } from "./library-sort";

stubAnimations();

const TITLE = {
  direction: LibrarySortDirection.Desc,
  field: LibrarySortField.TextTitle,
};
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
    fireEvent.click(await screen.findByRole("option", { name: /^Text/u }));
    fireEvent.click(await screen.findByRole("option", { name: /Text title/u }));

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
    fireEvent.click(await screen.findByRole("option", { name: /^Author/u }));
    const era = await screen.findByRole("option", { name: /Author era/u });

    expect(era.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(era);

    expect(onSorts).toHaveBeenCalledWith([]);
  });

  it("shows a chip for each sort in order and flips one from its label", () => {
    const onSorts = vi.fn<LibrarySortProperties["onSorts"]>();
    render(
      <LibrarySort
        onSorts={onSorts}
        sorts={[ERA, TITLE]}
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
      TITLE,
    ]);
  });

  it("moves a sort left or right from its menu, keeping directions", async () => {
    const onSorts = vi.fn<LibrarySortProperties["onSorts"]>();
    render(
      <LibrarySort
        onSorts={onSorts}
        sorts={[ERA, TITLE]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Options for Text title" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onSorts).toHaveBeenLastCalledWith([TITLE, ERA]);
  });

  it("disables moving the first sort left and the last sort right", async () => {
    render(
      <LibrarySort
        onSorts={vi.fn<LibrarySortProperties["onSorts"]>()}
        sorts={[ERA, TITLE]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Options for Author era" }),
    );

    const moveLeft = await screen.findByRole("menuitem", {
      name: "Move left",
    });

    expect(moveLeft.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen
        .getByRole("menuitem", { name: "Move right" })
        .getAttribute("aria-disabled"),
    ).toBeNull();
  });

  it("removes a sort from its menu", async () => {
    const onSorts = vi.fn<LibrarySortProperties["onSorts"]>();
    render(
      <LibrarySort
        onSorts={onSorts}
        sorts={[ERA, TITLE]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Options for Text title" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onSorts).toHaveBeenLastCalledWith([ERA]);
  });
});
