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
      direction: "asc",
      group: [],
      handleFilterChange: result.current.handleFilterChange,
      handleGroupChange: result.current.handleGroupChange,
      handleSortChange: result.current.handleSortChange,
      handleViewChange: result.current.handleViewChange,
      sort: undefined,
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

  it("reads the sort and direction the link names", () => {
    mockNavigate();
    vi.mocked(useSearch).mockReturnValue({ direction: "desc", sort: "rows" });

    const { result } = renderHook(() => useGallerySearch());

    expect(result.current.sort).toBe("rows");
    expect(result.current.direction).toBe("desc");
  });

  it("replaces the link with the sort picked, and drops the direction with no field", () => {
    const navigate = mockNavigate();
    vi.mocked(useSearch).mockReturnValue({ view: "list" });

    const { result } = renderHook(() => useGallerySearch());
    result.current.handleSortChange("rows", "desc");
    result.current.handleSortChange(undefined, "desc");

    const [picked, cleared] = navigate.mock.calls.map(([options]) => options);

    expect(picked?.search({ view: "list" })).toStrictEqual({
      direction: "desc",
      sort: "rows",
      view: "list",
    });
    expect(cleared?.search({ direction: "desc", sort: "rows" })).toStrictEqual({
      direction: undefined,
      sort: undefined,
    });
  });

  it("replaces the link with the filter and rows rule, keeping the rest of it", () => {
    const navigate = mockNavigate();
    vi.mocked(useSearch).mockReturnValue({});

    const { result } = renderHook(() => useGallerySearch());
    const filter = {
      combinator: "and" as const,
      rules: [{ field: "rows", operator: "eq" as const, value: 2 }],
    };

    const rows = { operator: "gte" as const, value: 3 };

    result.current.handleFilterChange(filter, rows);
    result.current.handleFilterChange(undefined, rows);

    const [[first], [second]] = navigate.mock.calls as [
      [NavigateOptions],
      [NavigateOptions],
    ];

    expect(first.replace).toBe(true);
    expect(first.search({ view: "list" })).toStrictEqual({
      filter,
      rows,
      view: "list",
    });
    expect(second.search({ filter })).toStrictEqual({
      filter: undefined,
      rows,
    });
  });

  it("reads a filter from a link, and drops one that is not a tree", () => {
    const filter = {
      combinator: "or",
      rules: [
        { field: "rows", operator: "between", value: [1, 2] },
        { combinator: "and", rules: [] },
      ],
    };

    expect(gallerySearchSchema.parse({ filter })).toStrictEqual({ filter });
    expect(
      gallerySearchSchema.parse({ filter: { combinator: "xor", rules: [] } }),
    ).toStrictEqual({ filter: undefined });
    expect(gallerySearchSchema.parse({ filter: "rows" })).toStrictEqual({
      filter: undefined,
    });
  });

  it("reads the rows rule from a link, and drops one that is not a comparison", () => {
    const rows = { operator: "between", value: [2, 5] };

    expect(gallerySearchSchema.parse({ rows })).toStrictEqual({ rows });
    expect(
      gallerySearchSchema.parse({ rows: { operator: "xor" } }),
    ).toStrictEqual({ rows: undefined });
    expect(gallerySearchSchema.parse({ rows: 4 })).toStrictEqual({
      rows: undefined,
    });
  });

  it("drops a view or direction that is not one of the two, and reads a number as a field", () => {
    expect(
      gallerySearchSchema.parse({ direction: "up", sort: 5, view: "wall" }),
    ).toStrictEqual({ direction: "asc", sort: "5", view: "grid" });
    expect(gallerySearchSchema.parse({})).toStrictEqual({});
  });

  it("replaces the link with the grouping, dropping it for no levels", () => {
    const navigate = mockNavigate();
    vi.mocked(useSearch).mockReturnValue({ group: ["lattice"] });

    const { result } = renderHook(() => useGallerySearch());
    result.current.handleGroupChange(["lattice", "rowsColumns"]);
    result.current.handleGroupChange([]);

    const [[first], [second]] = navigate.mock.calls as [
      [NavigateOptions],
      [NavigateOptions],
    ];

    expect(result.current.group).toStrictEqual(["lattice"]);
    expect(first.search({ view: "list" })).toStrictEqual({
      group: ["lattice", "rowsColumns"],
      view: "list",
    });
    expect(second.search({ group: ["lattice"] })).toStrictEqual({
      group: undefined,
    });
  });

  it("reads a grouping from a link, capped at four levels, and drops one that is not a list", () => {
    expect(
      gallerySearchSchema.parse({ group: ["a", "b", "c", "d", "e"] }),
    ).toStrictEqual({ group: ["a", "b", "c", "d"] });
    expect(gallerySearchSchema.parse({ group: "lattice" })).toStrictEqual({
      group: [],
    });
  });

  it("drops a level that is not text alone, then caps the rest at four", () => {
    expect(
      gallerySearchSchema.parse({
        group: [1, "a", "", "b", { x: 1 }, "c", "d", "e"],
      }),
    ).toStrictEqual({ group: ["a", "b", "c", "d"] });
  });
});
