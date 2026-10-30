import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "./search-bar";

describe(SearchBar, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies its class name", () => {
    render(
      <SearchBar
        className="search-bar"
        onSearch={vi.fn<(query: string) => void>()}
      />,
    );

    expect(screen.getByTestId("search-bar").className).toBe("search-bar");
  });

  it("searches once typing pauses", () => {
    const onSearch = vi.fn<(query: string) => void>();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "amo" },
    });

    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("amo");
  });

  it("searches at once when submitted", () => {
    const onSearch = vi.fn<(query: string) => void>();
    render(
      <SearchBar
        initialQuery="rex"
        onSearch={onSearch}
      />,
    );

    fireEvent.submit(screen.getByRole("search"));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("rex");
  });
});
