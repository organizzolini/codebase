import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@codebase/presentation";

import { PageList } from "./page-list";
import { startOffset } from "./page-list.utilities";

import type { PageListProperties } from "./page-list";

/** Renders the list in an open menu, over 7,600 pages with 25 and 26 showing. */
function renderOpen(overrides: Partial<PageListProperties> = {}): void {
  render(
    <DropdownMenu open>
      <DropdownMenuContent>
        <PageList
          first={25}
          last={26}
          onPage={vi.fn<(page: number) => void>()}
          pageCount={7600}
          {...overrides}
        />
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe(PageList, () => {
  it("opens around the pages showing, mounting only the pages near", () => {
    renderOpen();

    const items = screen.getAllByRole("menuitemcheckbox");

    expect(items.length).toBeLessThan(40);
    expect(screen.getByText("Page 25")).toBeDefined();
    expect(screen.queryByText("Page 7,000")).toBeNull();
  });

  it("checks each page of the window and no other", () => {
    renderOpen();

    const checked = screen
      .getAllByRole("menuitemcheckbox")
      .filter((item) => item.getAttribute("aria-checked") === "true")
      .map(({ textContent }) => textContent);

    expect(checked).toStrictEqual(["Page 25", "Page 26"]);
  });

  it("goes to the page picked, whether or not it was checked", () => {
    const onPage = vi.fn<(page: number) => void>();

    renderOpen({ onPage });
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Page 25" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Page 27" }));

    expect(onPage).toHaveBeenNthCalledWith(1, 25);
    expect(onPage).toHaveBeenNthCalledWith(2, 27);
  });

  it("starts a little above the first page showing, and never above the first page", () => {
    expect(startOffset(1)).toBe(0);
    expect(startOffset(3)).toBe(0);
    expect(startOffset(25)).toBe(22 * 28);
  });
});
