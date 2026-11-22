import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Masonry } from "./masonry";

/** Stubs a viewport that matches every breakpoint, for four columns. */
function stubWideViewport(): void {
  vi.stubGlobal("matchMedia", () => ({
    addEventListener: vi.fn<() => void>(),
    matches: true,
    removeEventListener: vi.fn<() => void>(),
  }));
}

describe(Masonry, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies its class name", () => {
    stubWideViewport();
    render(<Masonry className="masonry" />);

    expect(screen.getByTestId("masonry").className).toBe("masonry");
  });

  it("deals its children round-robin across the columns", () => {
    stubWideViewport();
    render(
      <Masonry>
        {["a", "b", "c", "d", "e"].map((id) => (
          <p key={id}>{id}</p>
        ))}
      </Masonry>,
    );

    const columns = screen.getAllByTestId("masonry-column");

    expect(columns.map((column) => column.textContent)).toStrictEqual([
      "ae",
      "b",
      "c",
      "d",
    ]);
  });
});
