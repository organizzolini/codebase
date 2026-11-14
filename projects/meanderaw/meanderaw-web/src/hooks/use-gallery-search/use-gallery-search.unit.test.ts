import { useNavigate, useSearch } from "@tanstack/react-router";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGallerySearch } from "./use-gallery-search";
import { gallerySearchSchema } from "./use-gallery-search.constants";

/** What the hook hands `navigate`. */
interface NavigateOptions {
  replace: boolean;
  search: (previous: object) => object;
}

vi.mock(import("@tanstack/react-router"), () => ({
  useNavigate: vi.fn<() => unknown>() as unknown as typeof useNavigate,
  useSearch: vi.fn<() => unknown>() as unknown as typeof useSearch,
}));

/** Makes `useNavigate` hand back a recording `navigate`. */
function mockNavigate(): ReturnType<
  typeof vi.fn<(options: NavigateOptions) => void>
> {
  const navigate = vi.fn<(options: NavigateOptions) => void>();
  vi.mocked(useNavigate).mockReturnValue(
    navigate as unknown as ReturnType<typeof useNavigate>,
  );

  return navigate;
}

describe(useGallerySearch, () => {
  it("returns its result", () => {
    mockNavigate();
    vi.mocked(useSearch).mockReturnValue({});

    const { result } = renderHook(() => useGallerySearch());

    expect(result.current).toStrictEqual({
      handleViewChange: result.current.handleViewChange,
      view: "grid",
    });
  });

  it("replaces the link with the view picked, keeping the rest of it", () => {
    const navigate = mockNavigate();
    vi.mocked(useSearch).mockReturnValue({ view: "grid" });

    const { result } = renderHook(() => useGallerySearch());
    result.current.handleViewChange("list");

    const options = navigate.mock.calls[0]?.[0];

    expect(result.current.view).toBe("grid");
    expect(options?.replace).toBe(true);
    expect(options?.search({ other: 1 })).toStrictEqual({
      other: 1,
      view: "list",
    });
  });

  it("drops a view that is not one of the two", () => {
    expect(gallerySearchSchema.parse({ view: "wall" })).toStrictEqual({
      view: "grid",
    });
    expect(gallerySearchSchema.parse({})).toStrictEqual({});
  });
});
