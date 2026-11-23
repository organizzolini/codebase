import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryGroupHeading } from "./library-group-heading";

describe(LibraryGroupHeading, () => {
  it("applies its class name", () => {
    render(
      <LibraryGroupHeading
        className="library-group-heading"
        heading="Classical"
      />,
    );

    expect(screen.getByTestId("library-group-heading").className).toBe(
      "library-group-heading",
    );
  });

  it("shows the heading as a level two heading", () => {
    render(<LibraryGroupHeading heading="Classical" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Classical" }),
    ).toBeDefined();
  });
});
