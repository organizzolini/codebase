// cspell:ignore Mynors
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextCollection } from "../../graphql/generated/mocks";

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
  matches: [],
  text: {
    collection: TextCollection.Perseus,
    edition: "Mynors 1969",
    id: "t1",
    lineCount: 756,
    parentText: null,
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

  it("labels the Text with its collection, edition, and counts", () => {
    render(<LibraryTextLink row={ROW} />);

    expect(screen.getByText("Perseus · Mynors 1969")).toBeDefined();
    expect(screen.getByText("756 lines · 9902 words")).toBeDefined();
  });
});
