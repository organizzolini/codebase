import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GroupLevelChip } from "./group-level-chip";

describe(GroupLevelChip, () => {
  it("shows the level's name", () => {
    render(
      <GroupLevelChip
        label="Type"
        onRemove={() => {}}
      />,
    );

    expect(screen.getByText("Type")).toBeDefined();
  });

  it("removes its level from the ellipsis menu", async () => {
    const onRemove = vi.fn<() => void>();

    render(
      <GroupLevelChip
        label="Type"
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });

  it("moves its level left or right from the menu", async () => {
    const onMoveLeft = vi.fn<() => void>();
    const onMoveRight = vi.fn<() => void>();

    render(
      <GroupLevelChip
        label="Type"
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onRemove={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );

    expect(onMoveLeft).toHaveBeenCalledExactlyOnceWith();
    expect(onMoveRight).toHaveBeenCalledExactlyOnceWith();
  });
});
