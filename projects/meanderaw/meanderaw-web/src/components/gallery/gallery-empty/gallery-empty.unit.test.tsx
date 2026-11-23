import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GalleryEmpty } from "./gallery-empty";

describe(GalleryEmpty, () => {
  it("applies its class name", () => {
    render(<GalleryEmpty className="gallery-empty" />);

    expect(screen.getByTestId("gallery-empty").className).toBe("gallery-empty");
  });

  it("says no meander matches when a filter is narrowing them", () => {
    render(<GalleryEmpty isFiltered />);

    expect(screen.getByRole("status").textContent).toMatch(
      /No meanders match these filters/u,
    );
    expect(screen.getByRole("status").textContent).not.toMatch(
      /meanderaw-cli/u,
    );
  });

  it("says there is nothing to show", () => {
    render(<GalleryEmpty />);

    expect(screen.getByRole("status").textContent).toMatch(/No meanders yet/u);
  });
});
