// cspell:ignore Mynors Pers
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextCollection } from "../../../graphql/generated/mocks";

import { LibraryTextLink } from "./library-text-link";

vi.mock("@tanstack/react-router", () => ({
  Link: (properties: Readonly<{ children: unknown; className?: string }>) => (
    <a
      className={properties.className}
      href="/texts/vergil-aeneid-1"
    >
      {properties.children as never}
    </a>
  ),
}));

const ROW = {
  childCount: 0,
  matches: [],
  text: {
    collection: TextCollection.Perseus,
    edition: "Mynors 1969",
    editors: null,
    findSpot: null,
    id: "t1",
    inscriptionType: null,
    lineCount: 756,
    material: null,
    province: null,
    slug: "vergil-aeneid-1",
    title: "Book 1",
    type: "text",
    wordCount: 9902,
  },
};

describe(LibraryTextLink, () => {
  it("applies its class name", () => {
    render(
      <LibraryTextLink
        className="library-text-link"
        row={ROW}
      />,
    );

    expect(screen.getByTestId("library-text-link").className).toBe(
      "library-text-link",
    );
  });

  it("shows the Text's counts but not its collection or edition", () => {
    render(<LibraryTextLink row={ROW} />);

    const link = screen.getByTestId("library-text-link");

    expect(screen.getByText(/756 lines · 9902 words/u)).toBeDefined();
    expect(link.textContent).not.toContain("Perseus");
    expect(link.textContent).not.toContain("Mynors");
  });

  it("shows and bolds an inscription attribute only when it matched", () => {
    render(
      <LibraryTextLink
        row={{
          childCount: 0,
          matches: [{ end: 3, field: "province", start: 0 }],
          text: {
            ...ROW.text,
            findSpot: "Forum",
            material: "marble",
            province: "Roma",
          },
        }}
      />,
    );

    expect(screen.getByText("Rom", { selector: "strong" })).toBeDefined();
    expect(screen.queryByText(/marble/u)).toBeNull();
    expect(screen.queryByText(/Forum/u)).toBeNull();
  });
});
