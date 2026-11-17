// cspell:ignore Fasti
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryAuthorTexts } from "./library-author-texts";

import type { LibraryAuthorRow } from "../library-grid/library-grid.types";

vi.mock("../library-text-tree/library-text-tree.constants", () => ({
  getLibraryWorks: vi
    .fn<() => Promise<never>>()
    .mockRejectedValue(new Error("unavailable")),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: (properties: Readonly<{ children: unknown }>) => (
    <a href="/texts/x">{properties.children as never}</a>
  ),
}));

/** A card holding one work, out of a number of works. */
function row(workCount: number): LibraryAuthorRow {
  return {
    author: {
      endYear: null,
      era: null,
      fullName: null,
      id: "a1",
      name: "Ovid",
      slug: "ovid",
      startYear: null,
    },
    matches: [],
    workCount,
    works: [
      {
        childCount: 0,
        matches: [],
        text: {
          collection: null,
          edition: null,
          editors: null,
          findSpot: null,
          id: "t1",
          inscriptionType: null,
          lineCount: null,
          material: null,
          province: null,
          slug: "ovid-fasti",
          title: "Fasti",
          type: "text",
          wordCount: null,
        },
      },
    ],
  };
}

describe(LibraryAuthorTexts, () => {
  it("applies its class name", () => {
    render(
      <LibraryAuthorTexts
        className="library-author-texts"
        id="panel"
        query={{ search: "" }}
        row={row(1)}
      />,
    );

    expect(screen.getByTestId("library-author-texts").className).toBe(
      "library-author-texts",
    );
  });

  it("lists the card's works and no button when it holds them all", () => {
    render(
      <LibraryAuthorTexts
        id="panel"
        query={{ search: "" }}
        row={row(1)}
      />,
    );

    expect(screen.getByRole("link", { name: /Fasti/u })).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers the works it omits and says when they cannot be loaded", async () => {
    render(
      <LibraryAuthorTexts
        id="panel"
        query={{ search: "" }}
        row={row(60)}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Load more works (59 left)" }),
    );

    await expect(screen.findByRole("alert")).resolves.toBeDefined();
  });
});
