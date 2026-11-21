// cspell:ignore Fasti
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryTextNode } from "./library-text-node";

import type { LibraryTextRow } from "../library-grid/library-grid.types";

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

vi.mock("./library-text-children", () => ({
  LibraryTextChildren: (properties: Readonly<{ parentTextId: string }>) => (
    <p>{`children of ${properties.parentTextId}`}</p>
  ),
}));

/** A Text row with a number of children. */
function row(childCount: number): LibraryTextRow {
  return {
    childCount,
    matches: [],
    text: {
      collection: null,
      edition: null,
      editors: null,
      findSpot: null,
      id: "fasti",
      inscriptionType: null,
      lineCount: null,
      material: null,
      province: null,
      slug: "ovid-fasti",
      title: "Fasti",
      type: "text",
      wordCount: null,
    },
  };
}

describe(LibraryTextNode, () => {
  it("applies its class name", () => {
    render(
      <LibraryTextNode
        className="library-text-node"
        renderLevel={() => null}
        row={row(12)}
        search=""
      />,
    );

    expect(screen.getByTestId("library-text-node").className).toBe(
      "library-text-node",
    );
  });

  it("links a Text with no children straight to the Reader", () => {
    render(
      <LibraryTextNode
        renderLevel={() => null}
        row={row(0)}
        search=""
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("link", { name: /Fasti/u })).toBeDefined();
  });

  it("loads its children only once it opens, and keeps them when it closes", () => {
    render(
      <LibraryTextNode
        renderLevel={() => null}
        row={row(12)}
        search=""
      />,
    );

    const trigger = screen.getByRole("button", { name: /Fasti/u });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("children of fasti")).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("children of fasti")).toBeDefined();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens by default when told to and offers a link to the Text itself", () => {
    render(
      <LibraryTextNode
        renderLevel={() => null}
        row={row(12)}
        search="x"
        defaultOpen
      />,
    );

    expect(screen.getByText("children of fasti")).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Open Fasti" }).getAttribute("href"),
    ).toBe("/texts/ovid-fasti");
  });
});
