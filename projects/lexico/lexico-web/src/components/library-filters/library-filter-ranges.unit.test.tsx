import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LibraryFilterRanges } from "./library-filter-ranges";

describe(LibraryFilterRanges, () => {
  it("applies its class name", () => {
    render(
      <LibraryFilterRanges
        className="library-filter-ranges"
        draft={{ selected: {}, text: {} }}
        onText={vi.fn<(key: string, value: string) => void>()}
      />,
    );

    expect(screen.getByTestId("library-filter-ranges").className).toBe(
      "library-filter-ranges",
    );
  });

  it("reports each bound under its own key", () => {
    const onText = vi.fn<(key: string, value: string) => void>();
    render(
      <LibraryFilterRanges
        draft={{ selected: {}, text: {} }}
        onText={onText}
      />,
    );
    fireEvent.change(screen.getByLabelText("Word count maximum"), {
      target: { value: "500" },
    });

    expect(onText).toHaveBeenCalledWith("wordCountMaximum", "500");
  });

  it("keeps the BCE hint out of the accessible name", () => {
    render(
      <LibraryFilterRanges
        draft={{ selected: {}, text: {} }}
        onText={vi.fn<(key: string, value: string) => void>()}
      />,
    );

    expect(screen.getByLabelText("Author years minimum")).toBeDefined();
    expect(
      screen
        .getByLabelText("Author years minimum")
        .getAttribute("aria-describedby"),
    ).toBe("library-filter-authorYears-hint");
    expect(screen.getAllByText("Negative for BCE")).toHaveLength(2);
  });
});
