import { fireEvent, render, screen } from "@testing-library/react";
import { Hourglass } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { Sortable } from "@codebase/presentation";

import { LibraryChip } from "./library-chip";

import type { LibraryChipProperties } from "./library-chip";
import type { ReactNode } from "react";

/** A chip inside the sortable list it belongs to, with a spy for its remove. */
function renderChip(
  overrides: Partial<LibraryChipProperties> = {},
): ReturnType<typeof vi.fn<LibraryChipProperties["onRemove"]>> {
  const onRemove = vi.fn<LibraryChipProperties["onRemove"]>();
  const chip: ReactNode = (
    <LibraryChip
      icon={Hourglass}
      label="Era"
      onRemove={onRemove}
      removeLabel="Remove era"
      value="era"
      {...overrides}
    />
  );
  render(
    <Sortable
      getItemValue={(value: string) => value}
      onValueChange={vi.fn<(value: string[]) => void>()}
      value={["era"]}
    >
      {chip}
    </Sortable>,
  );

  return onRemove;
}

describe(LibraryChip, () => {
  it("applies its class name", () => {
    render(
      <LibraryChip
        className="library-chip"
        label="Era"
        onRemove={vi.fn<LibraryChipProperties["onRemove"]>()}
        removeLabel="Remove era"
        value="era"
      />,
    );

    expect(screen.getByTestId("library-chip").className).toBe("library-chip");
  });

  it("shows its label and removes itself from the cross", () => {
    const onRemove = renderChip();

    expect(screen.getByTestId("library-chip").textContent).toBe("Era");

    fireEvent.click(screen.getByRole("button", { name: "Remove era" }));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });

  it("reveals the drag handle and cross on hover and on keyboard focus", () => {
    renderChip();

    for (const control of [
      screen.getByRole("button", { name: "Reorder Era" }),
      screen.getByRole("button", { name: "Remove era" }),
    ]) {
      expect(control.className).toContain("opacity-0");
      expect(control.className).toContain("group-hover/chip:opacity-100");
      expect(control.className).toContain(
        "group-focus-within/chip:opacity-100",
      );
      expect(control.className).toContain("focus-visible:opacity-100");
    }
  });

  it("is a plain label with no button when it has nothing to do on a click", () => {
    renderChip();

    expect(screen.queryByRole("button", { name: /Switch/u })).toBeNull();
  });

  it("makes its label a button that calls back when it has an action", () => {
    const onActivate =
      vi.fn<NonNullable<LibraryChipProperties["onActivate"]>>();
    renderChip({
      activateLabel: "Switch to descending",
      onActivate,
      trailing: <span>arrow</span>,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to descending" }),
    );

    expect(onActivate).toHaveBeenCalledExactlyOnceWith();
    expect(screen.getByTestId("library-chip").textContent).toContain("arrow");
  });
});
