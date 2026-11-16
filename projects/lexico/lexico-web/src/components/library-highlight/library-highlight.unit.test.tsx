import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryHighlight } from "./library-highlight";

describe(LibraryHighlight, () => {
  it("applies its class name", () => {
    render(
      <LibraryHighlight
        className="library-highlight"
        field="name"
        matches={[]}
        value="Ovid"
      />,
    );

    expect(screen.getByTestId("library-highlight").className).toBe(
      "library-highlight",
    );
  });

  it("bolds only the ranges matched in its field", () => {
    render(
      <LibraryHighlight
        field="title"
        matches={[
          { end: 3, field: "name", start: 0 },
          { end: 4, field: "title", start: 2 },
        ]}
        value="Eclogues"
      />,
    );

    expect(screen.getByText("lo", { selector: "strong" })).toBeDefined();
    expect(screen.getByTestId("library-highlight").textContent).toBe(
      "Eclogues",
    );
  });
});
