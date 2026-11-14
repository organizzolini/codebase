import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { fixtureMeander } from "../../../testing/meanders-api";

import { MeanderGallery } from "./meander-gallery";

describe(MeanderGallery, () => {
  it("applies its class name", () => {
    render(
      <MeanderGallery
        className="meander-gallery"
        meanders={[fixtureMeander(0)]}
        view="grid"
      />,
    );

    expect(screen.getByTestId("meander-gallery").className).toBe(
      "meander-gallery",
    );
  });

  it("shows a card for each meander", () => {
    render(
      <MeanderGallery
        meanders={[fixtureMeander(0), fixtureMeander(1)]}
        view="list"
      />,
    );

    expect(screen.getAllByTestId("meander-card")).toHaveLength(2);
  });

  it("says so when there are none", () => {
    render(
      <MeanderGallery
        meanders={[]}
        view="grid"
      />,
    );

    expect(screen.getByTestId("gallery-empty")).toBeDefined();
  });
});
