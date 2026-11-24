import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageMenu } from "./page-menu";

function renderMenu(
  pages = 2,
  limit = 25,
): {
  onLimitChange: ReturnType<typeof vi.fn<(limit: number) => void>>;
  onPagesChange: ReturnType<typeof vi.fn<(pages: number) => void>>;
} {
  const onLimitChange = vi.fn<(limit: number) => void>();
  const onPagesChange = vi.fn<(pages: number) => void>();

  render(
    <PageMenu
      count={4}
      limit={limit}
      longest={90}
      onLimitChange={onLimitChange}
      onPagesChange={onPagesChange}
      pages={pages}
    />,
  );

  return { onLimitChange, onPagesChange };
}

describe(PageMenu, () => {
  it("applies its class name", () => {
    render(
      <PageMenu
        className="page-menu"
        count={1}
        limit={25}
        longest={0}
        onLimitChange={() => {}}
        onPagesChange={() => {}}
        pages={1}
      />,
    );

    expect(screen.getByTestId("page-menu").className).toBe("page-menu");
  });

  it("offers the page sizes, and marks the current one", () => {
    renderMenu();

    expect(
      ["10", "25", "50", "100"].map((name) =>
        screen.getByRole("button", { name }).getAttribute("aria-pressed"),
      ),
    ).toStrictEqual(["false", "true", "false", "false"]);
  });

  it("changes the page size", () => {
    const { onLimitChange } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "100" }));

    expect(onLimitChange).toHaveBeenCalledWith(100);
  });

  it("lists each page with the events it covers, the last ending where the list does", () => {
    renderMenu();

    expect(screen.getByText("1–25")).toBeDefined();
    expect(screen.getByText("51–75")).toBeDefined();
    expect(screen.getByText("76–90")).toBeDefined();
  });

  it("checks the pages loaded, and keeps the first from being unchecked", () => {
    renderMenu(2);

    const checked = [1, 2, 3, 4].map((page) =>
      screen
        .getByRole("checkbox", { name: `Page ${String(page)}` })
        .getAttribute("aria-checked"),
    );

    expect(checked).toStrictEqual(["true", "true", "false", "false"]);
    expect(
      screen
        .getByRole("checkbox", { name: "Page 1" })
        .hasAttribute("disabled") ||
        screen
          .getByRole("checkbox", { name: "Page 1" })
          .getAttribute("aria-disabled") === "true",
    ).toBe(true);
  });

  it("loads through a page that is checked, and trims to the page before one that is unchecked", () => {
    const { onPagesChange } = renderMenu(3);

    fireEvent.click(screen.getByRole("checkbox", { name: "Page 4" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Page 3" }));

    expect(onPagesChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPagesChange).toHaveBeenNthCalledWith(2, 2);
  });
});
