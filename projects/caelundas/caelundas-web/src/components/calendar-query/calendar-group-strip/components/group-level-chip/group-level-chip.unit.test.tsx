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

  it("removes its level with the cross", () => {
    const onRemove = vi.fn<() => void>();

    render(
      <GroupLevelChip
        label="Type"
        onRemove={onRemove}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Stop grouping by Type" }),
    );

    expect(onRemove).toHaveBeenCalledExactlyOnceWith();
  });
});
