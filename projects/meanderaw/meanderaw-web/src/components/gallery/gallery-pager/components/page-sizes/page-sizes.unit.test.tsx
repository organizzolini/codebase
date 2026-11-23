import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@codebase/presentation";

import { PageSizes } from "./page-sizes";

/** Renders the sizes in an open menu, the size showing being 24. */
function renderOpen(onSizeChange: (size: number) => void): void {
  render(
    <DropdownMenu open>
      <DropdownMenuContent>
        <PageSizes
          onSizeChange={onSizeChange}
          size={24}
        />
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe(PageSizes, () => {
  it("offers 12, 24, 48 and 96, checking the one showing", () => {
    renderOpen(vi.fn<(size: number) => void>());

    const items = screen.getAllByRole("menuitemradio");

    expect(items.map(({ textContent }) => textContent)).toStrictEqual([
      "12",
      "24",
      "48",
      "96",
    ]);
    expect(
      items.map((item) => item.getAttribute("aria-checked")),
    ).toStrictEqual(["false", "true", "false", "false"]);
  });

  it("hands over the size picked", () => {
    const onSizeChange = vi.fn<(size: number) => void>();

    renderOpen(onSizeChange);
    fireEvent.click(screen.getByRole("menuitemradio", { name: "96" }));

    expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(96);
  });
});
