// cspell:ignore Praefatio Epistulae Atticum
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryTextTree } from "./library-text-tree";

import type { LibraryTextRow } from "../library-grid/library-grid.types";

vi.mock("./library-text-tree.constants", () => ({
  getLibraryChildren: async ({
    data,
  }: Readonly<{ data: { parentTextId: string } }>): Promise<unknown> => {
    // Epistulae holds Ad Atticum, which holds one letter; the rest never answer.
    if (data.parentTextId === "Epistulae") {
      return { texts: [row("Ad Atticum", 1)] };
    }
    if (data.parentTextId === "Ad Atticum") {
      return { texts: [row("Praefatio")] };
    }
    return new Promise<never>(() => {
      // Never answers, so an opened work stays loading.
    });
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: (
    properties: Readonly<{
      "aria-label"?: string;
      children: unknown;
      params: { slug: string };
    }>,
  ) => (
    <a
      aria-label={properties["aria-label"]}
      href={`/texts/${properties.params.slug}`}
    >
      {properties.children as never}
    </a>
  ),
}));

/** A leaf Text row with a title. */
function row(title: string, childCount = 0): LibraryTextRow {
  return {
    childCount,
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
      slug: title.toLowerCase().replaceAll(" ", "-"),
      title,
      type: "text",
      wordCount: null,
    },
  };
}

describe(LibraryTextTree, () => {
  it("applies its class name", () => {
    render(
      <LibraryTextTree
        className="library-text-tree"
        depth={0}
        rows={[row("Eclogues")]}
        search=""
      />,
    );

    expect(screen.getByTestId("library-text-tree").className).toBe(
      "library-text-tree",
    );
  });

  it("draws nothing for a level with no Texts", () => {
    render(
      <LibraryTextTree
        depth={1}
        rows={[]}
        search=""
      />,
    );

    expect(screen.queryByTestId("library-text-tree")).toBeNull();
  });

  it("shows the works of the top level as rows and expandable groups", () => {
    render(
      <LibraryTextTree
        depth={0}
        rows={[row("Eclogues"), row("Aeneid", 12)]}
        search=""
      />,
    );

    expect(screen.getByRole("link", { name: /Eclogues/u })).toBeDefined();
    expect(screen.getByRole("button", { name: /Aeneid/u })).toBeDefined();
  });

  it("shows the numbered leaves below the top level as round buttons", () => {
    render(
      <LibraryTextTree
        depth={1}
        rows={[row("Praefatio"), row("Book 1"), row("Book 2")]}
        search=""
      />,
    );

    expect(screen.getByRole("link", { name: /Praefatio/u })).toBeDefined();
    expect(screen.getByRole("link", { name: "Book 2" }).textContent).toBe("2");
  });

  it("opens a work whose child matched the search, but not one the author's name matched", () => {
    const { unmount } = render(
      <LibraryTextTree
        depth={0}
        rows={[row("Aeneid", 12)]}
        search="x"
      />,
    );

    expect(
      screen
        .getByRole("button", { name: /Aeneid/u })
        .getAttribute("aria-expanded"),
    ).toBe("true");

    unmount();
    render(
      <LibraryTextTree
        depth={0}
        rows={[row("Aeneid", 12)]}
        search="x"
        isAuthorMatched
      />,
    );

    expect(
      screen
        .getByRole("button", { name: /Aeneid/u })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("nests each opened work's children as Frames inside its parent's panel Frame", async () => {
    render(
      <LibraryTextTree
        depth={0}
        rows={[row("Epistulae", 1)]}
        search=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Epistulae/u }));
    fireEvent.click(await screen.findByRole("button", { name: /Ad Atticum/u }));
    const leaf = await screen.findByRole("link", { name: /Praefatio/u });

    let frames = 0;
    for (
      let element = leaf.closest("[data-slot=frame]");
      element !== null;
      element = element.parentElement?.closest("[data-slot=frame]") ?? null
    ) {
      frames += 1;
    }

    expect(frames).toBe(3);
  });
});
