// cspell:ignore Carmina
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryNumberRange } from "./library-number-range";

import type { LibraryNumberGroup } from "./library-text-tree.types";

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

/** A range of two numbered Texts, the second matched when asked. */
function group(isMatched: boolean): LibraryNumberGroup {
  const make = (
    value: number,
    matched: boolean,
  ): LibraryNumberGroup["items"][number] => ({
    first: value,
    label: String(value),
    last: value,
    prefix: "Carmina",
    row: {
      childCount: 0,
      matches: matched ? [{ end: 1, field: "title", start: 0 }] : [],
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
  });
  return {
    items: [make(21, false), make(22, isMatched)],
    label: "Carmina 21–22",
  };
}

describe(LibraryNumberRange, () => {
  it("applies its class name", () => {
    render(
      <LibraryNumberRange
        className="library-number-range"
        group={group(false)}
      />,
    );

    expect(screen.getByTestId("library-number-range").className).toBe(
      "library-number-range",
    );
  });

  it("opens into its buttons from a trigger that reports its state", () => {
    render(<LibraryNumberRange group={group(false)} />);

    const trigger = screen.getByRole("button", { name: "Carmina 21–22" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: "Carmina 21" })).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "Carmina 21" })).toBeDefined();
  });

  it("opens by itself when a search matched one of its numbers", () => {
    render(<LibraryNumberRange group={group(true)} />);

    expect(
      screen
        .getByRole("button", { name: "Carmina 21–22" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(screen.getByRole("link", { name: "Carmina 22" })).toBeDefined();
  });
});
