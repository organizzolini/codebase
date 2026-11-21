import { fireEvent, render, screen } from "@testing-library/react";
import { Hourglass } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { stubAnimations } from "../../../../testing/animations";

import { LibraryChip } from "./library-chip";

import type { LibraryChipProperties } from "./library-chip";

stubAnimations();

/** Opens the chip's ellipsis menu. */
async function openMenu(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Options for Era" }));
  await screen.findByRole("menuitem", { name: "Remove" });
}

/** A chip with spies for its move and remove. */
function renderChip(overrides: Partial<LibraryChipProperties> = {}): {
  onMove: ReturnType<typeof vi.fn<LibraryChipProperties["onMove"]>>;
  onRemove: ReturnType<typeof vi.fn<LibraryChipProperties["onRemove"]>>;
} {
  const onMove = vi.fn<LibraryChipProperties["onMove"]>();
  const onRemove = vi.fn<LibraryChipProperties["onRemove"]>();
  render(
    <LibraryChip
      icon={Hourglass}
      isFirst={false}
      isLast={false}
      label="Era"
      onMove={onMove}
      onRemove={onRemove}
      {...overrides}
    />,
  );

  return { onMove, onRemove };
}

describe(LibraryChip, () => {
  it("applies its class name", () => {
    render(
      <LibraryChip
        className="library-chip"
        isFirst={false}
        isLast={false}
        label="Era"
        onMove={vi.fn<LibraryChipProperties["onMove"]>()}
        onRemove={vi.fn<LibraryChipProperties["onRemove"]>()}
      />,
    );

    expect(screen.getByTestId("library-chip").className).toBe("library-chip");
  });

  it("shows its label and a permanent ellipsis button", () => {
    renderChip();

    expect(screen.getByTestId("library-chip").textContent).toBe("Era");
    expect(
      screen.getByRole("button", { name: "Options for Era" }),
    ).toBeDefined();
  });

  it("moves left, moves right, and removes from its menu", async () => {
    const { onMove, onRemove } = renderChip();
    await openMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "Move left" }));

    expect(onMove).toHaveBeenLastCalledWith(-1);

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Move right" }));

    expect(onMove).toHaveBeenLastCalledWith(1);

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });

  it("disables Move left on the first chip and Move right on the last", async () => {
    renderChip({ isFirst: true, isLast: true });
    await openMenu();

    for (const name of ["Move left", "Move right"]) {
      expect(
        screen.getByRole("menuitem", { name }).getAttribute("aria-disabled"),
      ).toBe("true");
    }
  });

  it("is a plain label with no button, showing its trailing arrow", () => {
    renderChip({ trailing: <span>arrow</span> });

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByTestId("library-chip").textContent).toContain("arrow");
  });

  it("offers Reverse in its menu only when it has a direction", async () => {
    const onReverse = vi.fn<NonNullable<LibraryChipProperties["onReverse"]>>();
    renderChip({ onReverse });
    await openMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "Reverse" }));

    expect(onReverse).toHaveBeenCalledExactlyOnceWith();
  });

  it("leaves Reverse out of the menu of a chip with no direction", async () => {
    renderChip();
    await openMenu();

    expect(screen.queryByRole("menuitem", { name: "Reverse" })).toBeNull();
  });
});
