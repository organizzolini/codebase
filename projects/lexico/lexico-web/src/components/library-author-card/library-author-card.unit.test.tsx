// cspell:ignore Maro
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryAuthorCard } from "./library-author-card";

describe(LibraryAuthorCard, () => {
  it("applies its class name", () => {
    render(
      <LibraryAuthorCard
        className="library-author-card"
        query={{ search: "" }}
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
          workCount: 0,
          works: [],
        }}
      />,
    );

    expect(screen.getByTestId("library-author-card").className).toBe(
      "library-author-card",
    );
  });

  it("bolds the matched part of the full name", () => {
    render(
      <LibraryAuthorCard
        query={{ search: "vergilius" }}
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
          workCount: 0,
          works: [],
        }}
      />,
    );

    expect(screen.getByText("Vergilius", { selector: "strong" })).toBeDefined();
  });
});
