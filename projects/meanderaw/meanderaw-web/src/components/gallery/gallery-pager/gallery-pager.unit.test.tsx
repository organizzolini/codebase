import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryPager } from "./gallery-pager";

import type { GalleryPagerProperties } from "./gallery-pager";

/** Opens the Page popover. */
async function openPage(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: /Page$/u }));
  await screen.findByLabelText("Page number");
}

/** The properties a pager needs: the second of 7,600 pages of 24. */
function properties(
  overrides: Partial<GalleryPagerProperties> = {},
): GalleryPagerProperties {
  return {
    isLoading: false,
    onPage: vi.fn<GalleryPagerProperties["onPage"]>(),
    onSizeChange: vi.fn<GalleryPagerProperties["onSizeChange"]>(),
    pageCount: 7600,
    position: 1,
    shown: 24,
    size: 24,
    total: 182_397,
    ...overrides,
  };
}

describe(GalleryPager, () => {
  it("applies its class name", () => {
    render(
      <GalleryPager
        {...properties()}
        className="gallery-pager"
      />,
    );

    expect(screen.getByTestId("gallery-pager").className).toBe("gallery-pager");
  });

  it("joins the Page button, previous chevron, the range as text, and next chevron in one group", () => {
    render(<GalleryPager {...properties()} />);

    const group = screen.getByRole("group", { name: "Pages" });

    expect(group.textContent).toBe("Page25 to 48 of 182,397");
    expect(group.children).toHaveLength(4);
  });

  it("moves to the next and the previous page with its chevrons", () => {
    const onPage = vi.fn<GalleryPagerProperties["onPage"]>();

    render(<GalleryPager {...properties({ onPage })} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));

    expect(onPage).toHaveBeenNthCalledWith(1, 2);
    expect(onPage).toHaveBeenNthCalledWith(2, 0);
  });

  it("disables a chevron with no page that way, and both while a page is read", () => {
    const { rerender } = render(
      <GalleryPager {...properties({ pageCount: 2 })} />,
    );

    expect(
      screen
        .getByRole("button", { name: "Next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");

    rerender(<GalleryPager {...properties({ position: 0 })} />);

    expect(
      screen
        .getByRole("button", { name: "Previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");

    rerender(<GalleryPager {...properties({ isLoading: true })} />);

    expect(
      screen
        .getByRole("button", { name: "Next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(screen.getByText("Loading…")).toBeDefined();
  });

  it("offers the page sizes in its popover, and hands over the one picked", async () => {
    const onSizeChange = vi.fn<GalleryPagerProperties["onSizeChange"]>();

    render(<GalleryPager {...properties({ onSizeChange })} />);
    await openPage();

    expect(screen.getByRole("group", { name: "Per page" }).textContent).toBe(
      "122448",
    );

    fireEvent.click(screen.getByRole("button", { name: "48" }));

    expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(48);
  });

  it("goes to the page typed, from 1, and ignores a number that is no page", async () => {
    const onPage = vi.fn<GalleryPagerProperties["onPage"]>();

    render(<GalleryPager {...properties({ onPage })} />);
    await openPage();

    const box = screen.getByLabelText("Page number");

    fireEvent.change(box, { target: { value: "9999" } });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(onPage).not.toHaveBeenCalled();

    fireEvent.change(box, { target: { value: "300" } });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(onPage).toHaveBeenCalledExactlyOnceWith(299);
  });
});
