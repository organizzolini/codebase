import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChipMenu } from "./chip-menu";

describe(ChipMenu, () => {
  it("applies its class name", () => {
    render(
      <ChipMenu
        className="chip-menu"
        label="Type"
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByTestId("chip-menu").className).toBe("chip-menu");
  });

  it("offers the moves it is given and removing", async () => {
    const onMoveLeft = vi.fn();
    const onRemove = vi.fn();

    render(
      <ChipMenu
        label="Type"
        onMoveLeft={onMoveLeft}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onMoveLeft).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("disables a move it is not given", async () => {
    render(
      <ChipMenu
        label="Type"
        onRemove={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    const item = await screen.findByRole("menuitem", { name: "Move right" });

    expect(item.getAttribute("aria-disabled")).toBe("true");
  });
});
