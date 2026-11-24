import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TableMoreRow } from "./table-more-row";

import type { TableRowModel } from "../../calendar-table.types";

type MoreRow = Extract<TableRowModel, { kind: "more" }>;

const ROW: MoreRow = {
  depth: 1,
  groupId: "group-id",
  id: "group-id|more",
  kind: "more",
  next: 7,
  remaining: 7,
  shown: 25,
  total: 32,
};

function renderRow(
  onMore?: (listId: string, shown: number) => void,
  className?: string,
): void {
  render(
    <table>
      <tbody>
        <TableMoreRow
          columnCount={3}
          onMore={onMore}
          row={ROW}
          {...(className === undefined ? {} : { className })}
        />
      </tbody>
    </table>,
  );
}

describe(TableMoreRow, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies its class name", () => {
    renderRow(undefined, "table-more-row");

    expect(screen.getByTestId("table-more-row").className).toContain(
      "table-more-row",
    );
  });

  it("says how much shows, how many there are, and how many load next, spanning every column, at its depth", () => {
    renderRow();

    const button = screen.getByRole("button", {
      name: "1 to 25 of 32, load 7 more",
    });

    expect(
      screen.getByText("1 to 25 of 32, load 7 more").style.marginLeft,
    ).toBe("1.25rem");
    expect(button.getAttribute("aria-label")).toBe(
      "1 to 25 of 32, load 7 more",
    );
    expect(screen.getByRole("cell").getAttribute("colspan")).toBe("3");
  });

  it("is one button across the whole row, which a keyboard reaches", () => {
    renderRow();

    const button = screen.getByRole("button");

    expect(button.tagName).toBe("BUTTON");
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("cursor-pointer");
    expect(screen.getByRole("cell").contains(button)).toBe(true);
  });

  it("writes in the group pill's text, in an opaque pill led by a load icon", () => {
    renderRow();

    const pill = screen.getByText("1 to 25 of 32, load 7 more");

    expect(pill.className).toContain("text-sm");
    expect(pill.className).toContain("font-medium");
    expect(pill.className).toContain("bg-background");
    expect(pill.querySelector("svg")).not.toBeNull();
  });

  it("shows more of its list when the button is pressed", () => {
    const onMore = vi.fn<(listId: string, shown: number) => void>();

    renderRow(onMore);
    fireEvent.click(screen.getByRole("button"));

    expect(onMore).toHaveBeenCalledWith("group-id", 25);
  });

  it("loads nothing until the button is pressed, even when it scrolls into view", () => {
    const observe = vi.fn<(target: Element) => void>();
    const onMore = vi.fn<(listId: string, shown: number) => void>();

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = observe;
        disconnect(): void {}
      },
    );
    renderRow(onMore);

    expect(observe).not.toHaveBeenCalled();
    expect(onMore).not.toHaveBeenCalled();
  });

  it("loads the list's next page once for each press", () => {
    const onMore = vi.fn<(listId: string, shown: number) => void>();

    renderRow(onMore);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));

    expect(onMore).toHaveBeenCalledTimes(2);
    expect(onMore).toHaveBeenLastCalledWith("group-id", 25);
  });
});
