import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryPagination } from "./library-pagination";

describe(LibraryPagination, () => {
  it("applies its class name", () => {
    render(
      <LibraryPagination
        className="library-pagination"
        onPageChange={vi.fn<(page: number) => void>()}
        page={1}
        pageCount={3}
      />,
    );

    expect(screen.getByTestId("library-pagination").className).toBe(
      "library-pagination",
    );
  });

  it("marks the current page and skips the pages between the ends and their neighbors", () => {
    const onPageChange = vi.fn<(page: number) => void>();
    render(
      <LibraryPagination
        onPageChange={onPageChange}
        page={5}
        pageCount={10}
      />,
    );

    expect(
      screen
        .getByRole("button", { name: "Page 5" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getAllByText("…")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it("names each numbered page for assistive technology", () => {
    render(
      <LibraryPagination
        onPageChange={vi.fn<(page: number) => void>()}
        page={2}
        pageCount={3}
      />,
    );

    expect(screen.getByRole("button", { name: "Page 1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Page 3" })).toBeDefined();
  });

  it("renders nothing for a single page", () => {
    const { container } = render(
      <LibraryPagination
        onPageChange={vi.fn<(page: number) => void>()}
        page={1}
        pageCount={1}
      />,
    );

    expect(container.firstElementChild).toBeNull();
  });
});
