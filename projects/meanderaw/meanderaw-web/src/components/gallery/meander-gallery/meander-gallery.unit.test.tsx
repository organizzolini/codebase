import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FIXTURE_CHARACTERISTICS,
  fixtureMeander,
} from "../../../../testing/meanders-api";

import { MeanderGallery } from "./meander-gallery";

import type { MeanderGalleryProperties } from "./meander-gallery";

/** The properties a gallery needs, over three fixture meanders. */
function properties(
  overrides: Partial<MeanderGalleryProperties> = {},
): MeanderGalleryProperties {
  return {
    activeKeys: [],
    catalog: FIXTURE_CHARACTERISTICS,
    loadError: undefined,
    meanders: [fixtureMeander(0), fixtureMeander(1), fixtureMeander(2)],
    onRetry: vi.fn<() => void>(),
    repeats: 12,
    view: "grid",
    ...overrides,
  };
}

describe(MeanderGallery, () => {
  it("applies its class name", () => {
    render(
      <MeanderGallery
        {...properties()}
        className="meander-gallery"
      />,
    );

    expect(screen.getByTestId("meander-gallery").className).toBe(
      "meander-gallery",
    );
  });

  it("lays a row of cards across the width, as many as fit", () => {
    render(<MeanderGallery {...properties()} />);

    const rows = screen.getAllByTestId("meander-gallery-row");

    expect(rows).toHaveLength(1);
    expect(screen.getAllByTestId("meander-card")).toHaveLength(3);
  });

  it("puts one card in each row of the list", () => {
    render(<MeanderGallery {...properties({ view: "list" })} />);

    expect(screen.getAllByTestId("meander-gallery-row")).toHaveLength(3);
  });

  it("says so when there are none", () => {
    render(<MeanderGallery {...properties({ meanders: [] })} />);

    expect(screen.getByTestId("gallery-empty")).toBeDefined();
  });

  it("shows why a page failed, with a way to read it again", () => {
    const onRetry = vi.fn<() => void>();
    render(
      <MeanderGallery
        {...properties({ loadError: new Error("boom"), onRetry })}
      />,
    );

    expect(screen.getByRole("alert").textContent).toMatch(/boom/u);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
});
