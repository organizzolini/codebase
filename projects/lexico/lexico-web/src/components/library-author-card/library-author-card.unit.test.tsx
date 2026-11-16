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
});
