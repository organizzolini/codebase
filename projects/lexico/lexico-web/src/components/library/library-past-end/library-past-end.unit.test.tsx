import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryPastEnd } from "./library-past-end";

describe(LibraryPastEnd, () => {
  it("applies its class name", () => {
    render(
      <LibraryPastEnd
        className="library-past-end"
        onLastPage={vi.fn<() => void>()}
        page={9}
        pageCount={3}
      />,
    );

    expect(screen.getByTestId("library-past-end").className).toBe(
      "library-past-end",
    );
  });

  it("says how many pages exist and goes to the last", () => {
    const onLastPage = vi.fn<() => void>();
    render(
      <LibraryPastEnd
        onLastPage={onLastPage}
        page={9}
        pageCount={3}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go to page 3" }));

    expect(
      screen.getByText("Page 9 does not exist; the library has 3 pages."),
    ).toBeDefined();
    expect(onLastPage).toHaveBeenCalledWith();
  });
});
