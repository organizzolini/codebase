import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageMenu } from "./page-menu";

import type { PageMenuProperties } from "./page-menu";

/** The properties a menu needs: 24 a page of 7,600 pages. */
function properties(
  overrides: Partial<PageMenuProperties> = {},
): PageMenuProperties {
  return {
    onPage: vi.fn<PageMenuProperties["onPage"]>(),
    onSizeChange: vi.fn<PageMenuProperties["onSizeChange"]>(),
    pageCount: 7600,
    size: 24,
    ...overrides,
  };
}

describe(PageMenu, () => {
  it("applies its class name", () => {
    render(
      <PageMenu
        {...properties()}
        className="page-menu"
      />,
    );

    expect(screen.getByTestId("page-menu").className).toBe("page-menu");
  });

  it("offers the page sizes, pressing the one in force, and hands over the one picked", () => {
    const onSizeChange = vi.fn<PageMenuProperties["onSizeChange"]>();

    render(<PageMenu {...properties({ onSizeChange })} />);

    expect(
      screen.getByRole("button", { name: "24", pressed: true }),
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "48" }));
    // The size already in force is pressed again: nothing changes.
    fireEvent.click(screen.getByRole("button", { name: "24" }));

    expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(48);
  });

  it("goes to the page typed, from 1, and ignores a number that is no page", () => {
    const onPage = vi.fn<PageMenuProperties["onPage"]>();

    render(<PageMenu {...properties({ onPage })} />);

    const box = screen.getByLabelText("Page number");

    fireEvent.change(box, { target: { value: "9999" } });
    fireEvent.submit(box);

    expect(onPage).not.toHaveBeenCalled();

    fireEvent.change(box, { target: { value: "300" } });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(onPage).toHaveBeenCalledExactlyOnceWith(299);
  });
});
