// cspell:ignore Carmina
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryNumberGrid } from "./library-number-grid";

import type { LibraryNumbered } from "./library-text-tree.types";

vi.mock("@tanstack/react-router", () => ({
  Link: (
    properties: Readonly<{
      "aria-label"?: string;
      children: unknown;
      className?: string;
      params: { slug: string };
    }>,
  ) => (
    <a
      aria-label={properties["aria-label"]}
      className={properties.className}
      href={`/texts/${properties.params.slug}`}
    >
      {properties.children as never}
    </a>
  ),
}));

/** One numbered Text, matched or not. */
function item(value: number, isMatched = false): LibraryNumbered {
  return {
    first: value,
    label: String(value),
    last: value,
    prefix: "Carmina",
    row: {
      childCount: 0,
      matches: isMatched ? [{ end: 1, field: "title", start: 0 }] : [],
      text: {
        collection: null,
        edition: null,
        editors: null,
        findSpot: null,
        id: `t${String(value)}`,
        inscriptionType: null,
        lineCount: null,
        material: null,
        province: null,
        slug: `catullus-${String(value)}`,
        title: `Carmina ${String(value)}`,
        type: "text",
        wordCount: null,
      },
    },
  };
}

describe(LibraryNumberGrid, () => {
  it("applies its class name", () => {
    render(
      <LibraryNumberGrid
        className="library-number-grid"
        items={[]}
      />,
    );

    expect(screen.getByTestId("library-number-grid").className).toBe(
      "library-number-grid",
    );
  });

  it("links each number to its Text under an accessible name", () => {
    render(<LibraryNumberGrid items={[item(21), item(22)]} />);

    const link = screen.getByRole("link", { name: "Carmina 21" });

    expect(link.textContent).toBe("21");
    expect(link.getAttribute("href")).toBe("/texts/catullus-21");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("fills the number a search matched", () => {
    render(<LibraryNumberGrid items={[item(21, true), item(22)]} />);

    expect(screen.getByRole("link", { name: "Carmina 21" }).className).not.toBe(
      screen.getByRole("link", { name: "Carmina 22" }).className,
    );
  });
});
