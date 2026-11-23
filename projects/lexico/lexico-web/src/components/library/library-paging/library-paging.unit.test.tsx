import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryPaging } from "./library-paging";

import type { LibraryPagingProperties } from "./library-paging";

function renderPaging(
  overrides: Partial<LibraryPagingProperties> = {},
): LibraryPagingProperties {
  const properties: LibraryPagingProperties = {
    limit: 25,
    onLimit: vi.fn<LibraryPagingProperties["onLimit"]>(),
    onPage: vi.fn<LibraryPagingProperties["onPage"]>(),
    page: 2,
    pageCount: 4,
    totalCount: 90,
    ...overrides,
  };
  render(<LibraryPaging {...properties} />);
  return properties;
}

describe(LibraryPaging, () => {
  it("shows the range of authors on the page out of the total", () => {
    renderPaging();

    expect(screen.getByText("26 to 50 of 90")).toBeDefined();
  });

  it("steps to the previous and next page", () => {
    const { onPage } = renderPaging();

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(onPage).toHaveBeenNthCalledWith(1, 1);
    expect(onPage).toHaveBeenNthCalledWith(2, 3);
  });

  it("marks the step beyond either end aria-disabled, keeping its look", () => {
    renderPaging({ page: 1, pageCount: 1 });

    expect(
      screen
        .getByRole("button", { name: "Previous page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Next page" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("applies its class name", () => {
    render(
      <LibraryPaging
        className="library-paging"
        limit={25}
        onLimit={vi.fn<LibraryPagingProperties["onLimit"]>()}
        onPage={vi.fn<LibraryPagingProperties["onPage"]>()}
        page={1}
        pageCount={1}
        totalCount={1}
      />,
    );

    expect(screen.getByTestId("library-paging").className).toBe(
      "library-paging",
    );
  });

  it("offers every limit and checks the current one", async () => {
    renderPaging();

    fireEvent.click(screen.getByRole("button", { name: "Page" }));

    for (const limit of ["10", "25", "50", "100"]) {
      await expect(
        screen.findByRole("menuitemradio", { name: limit }),
      ).resolves.toBeDefined();
    }

    expect(
      screen
        .getByRole("menuitemradio", { name: "25" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("chooses a limit", async () => {
    const { onLimit } = renderPaging();

    fireEvent.click(screen.getByRole("button", { name: "Page" }));
    fireEvent.click(await screen.findByRole("menuitemradio", { name: "50" }));

    expect(onLimit).toHaveBeenCalledWith(50);
  });

  it("lists every page, checks the current one, and chooses one", async () => {
    const { onPage } = renderPaging();

    fireEvent.click(screen.getByRole("button", { name: "Page" }));
    const third = await screen.findByRole("menuitemradio", {
      name: "Page 3",
    });
    fireEvent.click(third);

    expect(
      screen
        .getByRole("menuitemradio", { name: "Page 2" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(screen.queryByRole("menuitemradio", { name: "Page 5" })).toBeNull();
    expect(onPage).toHaveBeenCalledWith(3);
  });

  it("offers one page when there are none", async () => {
    renderPaging({ page: 1, pageCount: 0 });

    fireEvent.click(screen.getByRole("button", { name: "Page" }));

    await expect(
      screen.findByRole("menuitemradio", { name: "Page 1" }),
    ).resolves.toBeDefined();
  });
});
