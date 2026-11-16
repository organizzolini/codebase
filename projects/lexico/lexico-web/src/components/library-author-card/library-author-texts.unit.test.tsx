import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryAuthorTexts } from "./library-author-texts";

describe(LibraryAuthorTexts, () => {
  it("applies its class name", () => {
    render(
      <LibraryAuthorTexts
        className="library-author-texts"
        id="panel"
        row={{
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
          textCount: 0,
          texts: [],
        }}
      />,
    );

    expect(screen.getByTestId("library-author-texts").className).toBe(
      "library-author-texts",
    );
  });

  it("says how many Texts the card omits when it returns fewer", () => {
    render(
      <LibraryAuthorTexts
        id="panel"
        row={{
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
          textCount: 3,
          texts: [],
        }}
      />,
    );

    expect(screen.getByText("Showing 0 of 3 texts")).toBeDefined();
  });
});
