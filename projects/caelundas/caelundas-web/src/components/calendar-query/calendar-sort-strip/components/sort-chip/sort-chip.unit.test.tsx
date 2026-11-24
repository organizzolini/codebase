import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SortChip } from "./sort-chip";

describe(SortChip, () => {
  it("names its sort and direction, and flips when pressed", () => {
    const onFlip = vi.fn<() => void>();

    render(
      <SortChip
        direction="asc"
        label="Name"
        onFlip={onFlip}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Sorted by Name, ascending; reverse",
      }),
    );

    expect(onFlip).toHaveBeenCalledExactlyOnceWith();
  });

  it("says descending when it is", () => {
    render(
      <SortChip
        direction="desc"
        label="Name"
        onFlip={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Sorted by Name, descending; reverse",
      }),
    ).toBeDefined();
  });

  it("disables removing without a way to remove it", async () => {
    render(
      <SortChip
        direction="asc"
        label="Name"
        onFlip={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Name options" }));

    const remove = await screen.findByRole("menuitem", { name: "Remove" });

    expect(remove.getAttribute("aria-disabled")).toBe("true");
  });

  it("reverses its sort from the ellipsis menu too", async () => {
    const onFlip = vi.fn<() => void>();

    render(
      <SortChip
        direction="asc"
        label="Name"
        onFlip={onFlip}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Reverse" }));

    expect(onFlip).toHaveBeenCalledExactlyOnceWith();
  });

  it("removes its sort from the ellipsis menu", async () => {
    const onRemove = vi.fn<() => void>();

    render(
      <SortChip
        direction="asc"
        label="Name"
        onFlip={() => {}}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Name options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });
});
