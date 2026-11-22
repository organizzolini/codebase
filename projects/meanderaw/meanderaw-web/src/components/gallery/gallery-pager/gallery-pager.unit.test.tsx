import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryPager } from "./gallery-pager";

import type { GalleryPagerProperties } from "./gallery-pager";

/** Opens the Page menu. */
async function openPage(): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: /Page$/u }));
  await screen.findByText("Go to page");
}

/** The properties a pager needs: the second of 7,600 pages of 24. */
function properties(
  overrides: Partial<GalleryPagerProperties> = {},
): GalleryPagerProperties {
  return {
    first: 2,
    last: 2,
    onPage: vi.fn<GalleryPagerProperties["onPage"]>(),
    onSizeChange: vi.fn<GalleryPagerProperties["onSizeChange"]>(),
    pageCount: 7600,
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

  it("words a window of several pages as the range they cover", () => {
    render(<GalleryPager {...properties({ first: 1, last: 2 })} />);

    expect(screen.getByText("1 to 48 of 182,397")).toBeDefined();
  });

  it("selects the page after the window with next, and the page before it with previous", () => {
    const onPage = vi.fn<GalleryPagerProperties["onPage"]>();

    render(<GalleryPager {...properties({ first: 3, last: 5, onPage })} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));

    expect(onPage).toHaveBeenNthCalledWith(1, 6);
    expect(onPage).toHaveBeenNthCalledWith(2, 2);
  });

  it("keeps a chevron with no page that way in the group, marked disabled", () => {
    const { rerender } = render(
      <GalleryPager {...properties({ first: 1, last: 2, pageCount: 2 })} />,
    );

    expect(
      screen
        .getByRole("button", { name: "Next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");

    rerender(<GalleryPager {...properties()} />);

    expect(
      screen
        .getByRole("button", { name: "Previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("false");
  });

  it("offers the page sizes in its menu, and hands over the one picked", async () => {
    const onSizeChange = vi.fn<GalleryPagerProperties["onSizeChange"]>();

    render(<GalleryPager {...properties({ onSizeChange })} />);
    await openPage();

    expect(
      screen
        .getAllByRole("menuitemradio")
        .map(({ textContent }) => textContent),
    ).toStrictEqual(["12", "24", "48", "96"]);
    expect(
      screen
        .getByRole("menuitemradio", { name: "24" })
        .getAttribute("aria-checked"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("menuitemradio", { name: "48" }));

    expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(48);
  });

  it("lists the pages with a check on each one of the window, and goes to the page picked", async () => {
    const onPage = vi.fn<GalleryPagerProperties["onPage"]>();

    render(<GalleryPager {...properties({ first: 2, last: 3, onPage })} />);
    await openPage();

    const checked = screen
      .getAllByRole("menuitemcheckbox")
      .filter((item) => item.getAttribute("aria-checked") === "true")
      .map(({ textContent }) => textContent);

    expect(checked).toStrictEqual(["Page 2", "Page 3"]);

    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Page 4" }));

    expect(onPage).toHaveBeenCalledExactlyOnceWith(4);
  });
});
