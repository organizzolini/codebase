import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryGrid } from "./library-grid";

describe(LibraryGrid, () => {
  it("applies its class name", () => {
    render(
      <LibraryGrid
        authors={[]}
        className="library-grid"
        query={{ search: "" }}
      />,
    );

    expect(screen.getByTestId("library-grid").className).toBe("library-grid");
  });

  it("renders one card per author", () => {
    const author = {
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
    };
    render(
      <LibraryGrid
        authors={[author]}
        query={{ search: "" }}
      />,
    );

    expect(screen.getAllByTestId("library-author-card")).toHaveLength(1);
  });
});
