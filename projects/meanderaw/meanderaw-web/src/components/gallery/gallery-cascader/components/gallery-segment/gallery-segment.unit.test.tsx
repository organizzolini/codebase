import { fireEvent, render, screen } from "@testing-library/react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { GallerySegment } from "./gallery-segment";

function renderSegment(
  overrides: Partial<Parameters<typeof GallerySegment>[0]> = {},
): void {
  render(
    <GallerySegment
      actions={[
        { icon: ArrowLeft, label: "Move left", onSelect: vi.fn<() => void>() },
        {
          icon: ArrowLeft,
          isDisabled: true,
          label: "Move right",
          onSelect: vi.fn<() => void>(),
        },
      ]}
      ariaLabel="Rows"
      label="Rows"
      menuLabel="Rows options"
      {...overrides}
    />,
  );
}

describe(GallerySegment, () => {
  it("applies its class name", () => {
    render(
      <GallerySegment
        actions={[]}
        ariaLabel="Rows"
        className="gallery-segment"
        label="Rows"
        menuLabel="Rows options"
      />,
    );

    expect(screen.getByTestId("gallery-segment").className).toBe(
      "gallery-segment",
    );
  });

  it("runs an action from the menu", async () => {
    const onSelect = vi.fn<() => void>();

    renderSegment({
      actions: [
        { icon: Trash2, isDestructive: true, label: "Remove", onSelect },
      ],
    });
    fireEvent.click(screen.getByRole("button", { name: "Rows options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("disables an action marked disabled", async () => {
    renderSegment();
    fireEvent.click(screen.getByRole("button", { name: "Rows options" }));

    const item = await screen.findByRole("menuitem", { name: "Move right" });

    expect(item.getAttribute("aria-disabled")).toBe("true");
  });
});
