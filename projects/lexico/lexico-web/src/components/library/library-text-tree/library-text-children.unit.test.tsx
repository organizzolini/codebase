// cspell:ignore Fasti
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LibraryTextChildren } from "./library-text-children";
import { getLibraryChildren } from "./library-text-tree.constants";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type { LibraryTextsPage } from "./library-text-tree.types";

vi.mock("./library-text-tree.constants", () => ({
  getLibraryChildren: vi.fn<() => Promise<LibraryTextsPage>>(),
}));

/** A page of children out of a total. */
function page(titles: string[], totalCount: number): LibraryTextsPage {
  return { pageCount: 2, texts: titles.map((title) => row(title)), totalCount };
}

/** Draws the loaded rows as plain titles. */
function renderLevel(rows: readonly LibraryTextRow[]): React.ReactNode {
  return rows.map(({ text }) => <p key={text.id}>{text.title}</p>);
}

/** A child row with a title. */
function row(title: string): LibraryTextRow {
  return {
    childCount: 0,
    matches: [],
    text: {
      collection: null,
      edition: null,
      editors: null,
      findSpot: null,
      id: title,
      inscriptionType: null,
      lineCount: null,
      material: null,
      province: null,
      slug: title,
      title,
      type: "text",
      wordCount: null,
    },
  };
}

describe(LibraryTextChildren, () => {
  beforeEach(() => {
    vi.mocked(getLibraryChildren).mockReset();
  });

  it("applies its class name", async () => {
    vi.mocked(getLibraryChildren).mockResolvedValue(page(["a"], 1));
    render(
      <LibraryTextChildren
        childCount={1}
        className="library-text-children"
        parentTextId="p"
        renderLevel={renderLevel}
        search=""
      />,
    );

    await screen.findByText("a");

    expect(screen.getByTestId("library-text-children").className).toBe(
      "library-text-children",
    );
  });

  it("loads the first page when it mounts and pages in more on request", async () => {
    vi.mocked(getLibraryChildren)
      .mockResolvedValueOnce(page(["a", "b"], 3))
      .mockResolvedValueOnce(page(["c"], 3));
    render(
      <LibraryTextChildren
        childCount={3}
        parentTextId="p"
        renderLevel={renderLevel}
        search="x"
      />,
    );

    await screen.findByText("b");

    expect(getLibraryChildren).toHaveBeenCalledWith({
      data: { page: 1, parentTextId: "p", search: "x" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await screen.findByText("c");

    expect(getLibraryChildren).toHaveBeenLastCalledWith({
      data: { page: 2, parentTextId: "p", search: "x" },
    });
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("offers a retry when the children cannot be loaded", async () => {
    vi.mocked(getLibraryChildren)
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce(page(["a"], 1));
    render(
      <LibraryTextChildren
        childCount={1}
        parentTextId="p"
        renderLevel={renderLevel}
        search=""
      />,
    );

    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });

    expect(screen.getByText("a")).toBeDefined();
  });
});
