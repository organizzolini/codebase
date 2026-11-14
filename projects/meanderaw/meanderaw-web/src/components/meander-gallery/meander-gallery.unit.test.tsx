import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { fixtureMeander } from "../../../testing/meanders-api";

import { MeanderGallery } from "./meander-gallery";

import type { MeanderGalleryProperties } from "./meander-gallery";

/** The properties a gallery needs, over three fixture meanders. */
function properties(
  overrides: Partial<MeanderGalleryProperties> = {},
): MeanderGalleryProperties {
  return {
    hasMore: false,
    loadError: undefined,
    meanders: [fixtureMeander(0), fixtureMeander(1), fixtureMeander(2)],
    onLoadMore: vi.fn<() => void>(),
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

  it("asks for the next page when the end is in view, and not when there is none", () => {
    const onLoadMore = vi.fn<() => void>();
    const { unmount } = render(
      <MeanderGallery {...properties({ hasMore: true, onLoadMore })} />,
    );

    expect(onLoadMore).toHaveBeenCalledWith();

    unmount();
    onLoadMore.mockClear();
    render(<MeanderGallery {...properties({ onLoadMore })} />);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("shows why a page failed instead of asking again, with a way to retry", () => {
    const onLoadMore = vi.fn<() => void>();
    render(
      <MeanderGallery
        {...properties({
          hasMore: true,
          loadError: new Error("boom"),
          onLoadMore,
        })}
      />,
    );

    expect(onLoadMore).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toMatch(/boom/u);
  });
});
