import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StripFoldContext } from "../strip-fold-button/strip-fold-button.constants";

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

    expect(screen.getByTestId("chip-menu").className).toContain("chip-menu");
  });

  it("drops its horizontal padding", () => {
    render(<ChipMenu label="Type" />);

    expect(screen.getByTestId("chip-menu").className).toContain("px-0");
    expect(screen.getByTestId("chip-menu").className).toContain("w-5");
  });

  it("puts its test id on the button, a direct child of the strip", () => {
    render(
      <div data-testid="strip">
        <ChipMenu label="Type" />
      </div>,
    );

    const button = screen.getByTestId("chip-menu");

    expect(button.tagName).toBe("BUTTON");
    expect(button.parentElement).toBe(screen.getByTestId("strip"));
  });

  it("reverses when it is given a way to, and offers none otherwise", async () => {
    const onReverse = vi.fn();

    const { unmount } = render(
      <ChipMenu
        label="Type"
        onReverse={onReverse}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Reverse" }));

    expect(onReverse).toHaveBeenCalledTimes(1);

    unmount();
    render(<ChipMenu label="Type" />);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    await screen.findByRole("menuitem", { name: "Remove" });

    expect(screen.queryByRole("menuitem", { name: "Reverse" })).toBeNull();
  });

  it("ends with a destructive Remove after a separator", async () => {
    render(<ChipMenu label="Type" />);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    const items = await screen.findAllByRole("menuitem");
    const last = items.at(-1);

    expect(last?.textContent).toBe("Remove");
    expect(last?.dataset["variant"]).toBe("destructive");
    expect(last?.previousElementSibling?.getAttribute("role")).toBe(
      "separator",
    );
  });

  it("disables removing when it is not given a way to", async () => {
    render(<ChipMenu label="Type" />);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    const item = await screen.findByRole("menuitem", { name: "Remove" });

    expect(item.getAttribute("aria-disabled")).toBe("true");
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

  it("offers Collapse all and Expand all only when given a way to", async () => {
    const onCollapseAll = vi.fn();
    const onExpandAll = vi.fn();

    const { unmount } = render(
      <ChipMenu
        label="Type"
        onCollapseAll={onCollapseAll}
        onExpandAll={onExpandAll}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Collapse all" }),
    );

    expect(onCollapseAll).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Expand all" }),
    );

    expect(onExpandAll).toHaveBeenCalledTimes(1);

    unmount();
    render(<ChipMenu label="Type" />);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    await screen.findByRole("menuitem", { name: "Remove" });

    expect(screen.queryByRole("menuitem", { name: "Collapse all" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Expand all" })).toBeNull();
  });

  it("keeps only the chip when it is given a way to, and disables Only otherwise", async () => {
    const onOnly = vi.fn();
    const { unmount } = render(
      <ChipMenu
        label="Type"
        onOnly={onOnly}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Only" }));

    expect(onOnly).toHaveBeenCalledTimes(1);

    unmount();
    render(<ChipMenu label="Type" />);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    const only = await screen.findByRole("menuitem", { name: "Only" });

    expect(only.getAttribute("aria-disabled")).toBe("true");
  });

  it("folds the strip when it sits in one that folds, and disables Fold otherwise", async () => {
    const onFold = vi.fn<() => void>();
    const { unmount } = render(
      <StripFoldContext value={onFold}>
        <ChipMenu label="Type" />
      </StripFoldContext>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Type options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));

    expect(onFold).toHaveBeenCalledTimes(1);

    unmount();
    render(<ChipMenu label="Type" />);
    fireEvent.click(screen.getByRole("button", { name: "Type options" }));

    const fold = await screen.findByRole("menuitem", { name: "Fold" });

    expect(fold.getAttribute("aria-disabled")).toBe("true");
  });
});
