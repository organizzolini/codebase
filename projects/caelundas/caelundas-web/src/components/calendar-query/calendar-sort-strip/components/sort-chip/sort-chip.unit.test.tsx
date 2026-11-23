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

  it("has no menu without a way to remove it", () => {
    render(
      <SortChip
        direction="asc"
        label="Name"
        onFlip={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Name options" })).toBeNull();
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
