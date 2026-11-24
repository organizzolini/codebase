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

    expect(button.style.marginLeft).toBe("1.25rem");
    expect(screen.getByRole("cell").getAttribute("colspan")).toBe("3");
  });

  it("shows more of its list when the button is pressed", () => {
    const onMore = vi.fn<(listId: string, shown: number) => void>();

    renderRow(onMore);
    fireEvent.click(screen.getByRole("button"));

    expect(onMore).toHaveBeenCalledWith("group-id", 25);
  });

  it("shows more by itself when it scrolls into view", () => {
    const observe = vi.fn<(target: Element) => void>();
    const onMore = vi.fn<(listId: string, shown: number) => void>();
    let notify: IntersectionObserverCallback | undefined;

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe = observe;
        disconnect(): void {}
      },
    );
    renderRow(onMore);

    expect(observe).toHaveBeenCalledTimes(1);

    notify?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onMore).not.toHaveBeenCalled();

    notify?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onMore).toHaveBeenCalledWith("group-id", 25);
  });
});
