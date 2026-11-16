import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryRepeats } from "./gallery-repeats";

describe(GalleryRepeats, () => {
  it("applies its class name", () => {
    render(
      <GalleryRepeats
        className="gallery-repeats"
        onRepeatsChange={vi.fn<(repeats: number) => void>()}
        repeats={12}
      />,
    );

    expect(screen.getByTestId("gallery-repeats").className).toBe(
      "gallery-repeats",
    );
  });

  it("offers 1 to 24 under a label, showing the count in force", () => {
    render(
      <GalleryRepeats
        onRepeatsChange={vi.fn<(repeats: number) => void>()}
        repeats={12}
      />,
    );

    const select = screen.getByRole<HTMLSelectElement>("combobox", {
      name: "Repeats",
    });

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toStrictEqual(
      Array.from({ length: 24 }, (_, index) => String(index + 1)),
    );
    expect(select.value).toBe("12");
  });

  it("hands over the count picked as a number", () => {
    const onRepeatsChange = vi.fn<(repeats: number) => void>();
    render(
      <GalleryRepeats
        onRepeatsChange={onRepeatsChange}
        repeats={12}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Repeats" }), {
      target: { value: "3" },
    });

    expect(onRepeatsChange).toHaveBeenCalledWith(3);
  });
});
