// cspell:ignore Maro
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryAuthorCard } from "./library-author-card";

describe(LibraryAuthorCard, () => {
  it("applies its class name", () => {
    render(
      <LibraryAuthorCard
        className="library-author-card"
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: null,
            id: "a1",
            name: "Ennius",
            slug: "ennius",
            startYear: null,
          },
          matches: [],
          textCount: 0,
          texts: [],
        }}
        search=""
      />,
    );

    expect(screen.getByTestId("library-author-card").className).toBe(
      "library-author-card",
    );
  });

  it("bolds the matched part of the full name", () => {
    render(
      <LibraryAuthorCard
        row={{
          author: {
            endYear: null,
            era: null,
            fullName: "Publius Vergilius Maro",
            id: "a2",
            name: "Vergil",
            slug: "vergil",
            startYear: null,
          },
          matches: [{ end: 17, field: "fullName", start: 8 }],
          textCount: 0,
          texts: [],
        }}
        search="vergilius"
      />,
    );

    expect(screen.getByText("Vergilius", { selector: "strong" })).toBeDefined();
  });
});
