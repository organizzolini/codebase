import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryToolbar } from "./gallery-toolbar";

describe(GalleryToolbar, () => {
  it("applies its class name", () => {
    render(
      <GalleryToolbar
        className="gallery-toolbar"
        onViewChange={vi.fn<() => void>()}
        view="grid"
      />,
    );

    expect(screen.getByTestId("gallery-toolbar").className).toBe(
      "gallery-toolbar",
    );
  });

  it("marks the view showing and offers the other", () => {
    const onViewChange = vi.fn<() => void>();
    render(
      <GalleryToolbar
        onViewChange={onViewChange}
        view="grid"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Grid", pressed: true }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "List" }));

    expect(onViewChange).toHaveBeenCalledWith("list");
  });
});
