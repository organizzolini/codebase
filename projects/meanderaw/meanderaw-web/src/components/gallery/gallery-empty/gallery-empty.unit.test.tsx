import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GalleryEmpty } from "./gallery-empty";

describe(GalleryEmpty, () => {
  it("applies its class name", () => {
    render(<GalleryEmpty className="gallery-empty" />);

    expect(screen.getByTestId("gallery-empty").className).toBe("gallery-empty");
  });

  it("says there is nothing to show", () => {
    render(<GalleryEmpty />);

    expect(screen.getByRole("status").textContent).toMatch(/No meanders yet/u);
  });
});
