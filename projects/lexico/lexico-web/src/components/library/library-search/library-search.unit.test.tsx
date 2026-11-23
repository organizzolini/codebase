import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LibrarySearch } from "./library-search";

const SEARCH_LABEL = { name: "Search the library" };

describe(LibrarySearch, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies its class name", () => {
    render(
      <LibrarySearch
        className="library-search"
        onSearch={vi.fn<(search: string) => void>()}
        search=""
      />,
    );

    expect(screen.getByTestId("library-search").className).toBe(
      "library-search",
    );
  });

  it("has no Search button", () => {
    render(
      <LibrarySearch
        onSearch={vi.fn<(search: string) => void>()}
        search=""
      />,
    );

    expect(screen.queryByRole("button", { name: "Search" })).toBeNull();
  });

  it("searches the trimmed draft once typing pauses", () => {
    const onSearch = vi.fn<(search: string) => void>();
    render(
      <LibrarySearch
        onSearch={onSearch}
        search=""
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", SEARCH_LABEL), {
      target: { value: "  ovid " },
    });
    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("ovid");
  });

  it("searches at once on Enter and drops the pending search", () => {
    const onSearch = vi.fn<(search: string) => void>();
    render(
      <LibrarySearch
        onSearch={onSearch}
        search=""
      />,
    );
    const box = screen.getByRole("searchbox", SEARCH_LABEL);

    fireEvent.change(box, { target: { value: "ovid" } });
    fireEvent.submit(screen.getByRole("search"));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("ovid");
  });

  it("replaces the draft with a search the URL changed", () => {
    const onSearch = vi.fn<(search: string) => void>();
    const { rerender } = render(
      <LibrarySearch
        onSearch={onSearch}
        search="ovid"
      />,
    );

    rerender(
      <LibrarySearch
        onSearch={onSearch}
        search=""
      />,
    );

    expect(
      screen.getByRole<HTMLInputElement>("searchbox", SEARCH_LABEL).value,
    ).toBe("");
  });

  it("keeps what is being typed when the URL echoes an earlier search", () => {
    const onSearch = vi.fn<(search: string) => void>();
    const { rerender } = render(
      <LibrarySearch
        onSearch={onSearch}
        search=""
      />,
    );

    const box = screen.getByRole("searchbox", SEARCH_LABEL);
    fireEvent.change(box, { target: { value: "ovid" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.change(box, { target: { value: "ovid, am" } });
    rerender(
      <LibrarySearch
        onSearch={onSearch}
        search="ovid"
      />,
    );

    expect(
      screen.getByRole<HTMLInputElement>("searchbox", SEARCH_LABEL).value,
    ).toBe("ovid, am");
  });
});
