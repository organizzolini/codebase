import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  fixtureMeander,
  serveMeandersApi,
} from "../../../testing/meanders-api";

import { useMeanders } from "./use-meanders";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";

/** A page of fixture meanders from `start` to `end`, of 100 in all. */
function pageOf(start: number, end: number): MeandersPage {
  return {
    edges: Array.from({ length: end - start }, (_, offset) => ({
      cursor: String(start + offset),
      node: fixtureMeander(start + offset),
    })),
    pageInfo: { endCursor: String(end - 1), hasNextPage: end < 100 },
    totalCount: 100,
  };
}

const QUERY = { repeats: 6, size: 2 };

/** The Codes of the meanders showing. */
function codesOf(meanders: readonly { code: string }[]): string[] {
  return meanders.map(({ code }) => code);
}

describe(useMeanders, () => {
  it("returns its result", () => {
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    expect(result.current).toStrictEqual({
      append: result.current.append,
      hasMore: true,
      isLoading: false,
      loadError: undefined,
      meanders: first.edges.map(({ node }) => node),
      next: result.current.next,
      pageCount: 50,
      previous: result.current.previous,
      range: { first: 1, last: 1 },
      retry: result.current.retry,
      select: result.current.select,
    });
  });

  it("reads the next page past an offset, as many meanders as the size, and shows it alone", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const scrollTo = vi.spyOn(globalThis, "scrollTo");
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.next();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasMore).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.requests[0]).toMatchObject({ first: 2, offset: 2, repeats: 6 });
    expect(result.current.range).toStrictEqual({ first: 2, last: 2 });
    expect(codesOf(result.current.meanders)).toStrictEqual([
      "01x01y0002",
      "01x01y0003",
    ]);

    scrollTo.mockRestore();
  });

  it("appends the page after the window without scrolling, keeping the pages before it", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const scrollTo = vi.spyOn(globalThis, "scrollTo");
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.append();
    });

    // The page showing stays while the next is read.
    expect(result.current.isLoading).toBe(true);
    expect(codesOf(result.current.meanders)).toStrictEqual([
      "01x01y0000",
      "01x01y0001",
    ]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(scrollTo).not.toHaveBeenCalled();
    expect(api.requests[0]).toMatchObject({ offset: 2 });
    expect(result.current.range).toStrictEqual({ first: 1, last: 2 });
    expect(codesOf(result.current.meanders)).toStrictEqual([
      "01x01y0000",
      "01x01y0001",
      "01x01y0002",
      "01x01y0003",
    ]);

    act(() => {
      result.current.append();
    });
    await waitFor(() => {
      expect(result.current.range.last).toBe(3);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.meanders).toHaveLength(6);

    scrollTo.mockRestore();
  });

  it("selects the page after a window of several, and the page before it, alone", async () => {
    serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.select(3);
    });
    act(() => {
      result.current.append();
    });
    await waitFor(() => {
      expect(result.current.range).toStrictEqual({ first: 3, last: 4 });
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.next();
    });

    expect(result.current.range).toStrictEqual({ first: 5, last: 5 });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.previous();
    });

    expect(result.current.range).toStrictEqual({ first: 4, last: 4 });
  });

  it("jumps to a page not read before by its offset, reading it once", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.select(10);
      result.current.select(10);
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.requests).toHaveLength(1);
    expect(api.requests[0]).toMatchObject({ offset: 18 });
    expect(result.current.meanders[0]?.code).toBe("01x01y0018");
  });

  it("goes back to a page read already without reading it again", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.next();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    act(() => {
      result.current.previous();
    });

    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
    expect(result.current.meanders).toStrictEqual(
      first.edges.map(({ node }) => node),
    );

    act(() => {
      result.current.next();
    });

    expect(result.current.range).toStrictEqual({ first: 2, last: 2 });
    expect(api.requests).toHaveLength(1);
  });

  it("ignores a page before the first and one past the last", () => {
    serveMeandersApi(3);
    const first = { ...pageOf(0, 2), totalCount: 3 };
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.previous();
      result.current.select(3);
      result.current.append();
      result.current.append();
    });

    expect(result.current.range.first).toBe(1);
    expect(result.current.range.last).toBeLessThanOrEqual(2);
    expect(result.current.pageCount).toBe(2);
  });

  it("has nothing more to ask for once the window reaches the last page", async () => {
    serveMeandersApi(3);
    const first = { ...pageOf(0, 2), totalCount: 3 };
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.append();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);
  });

  it("reports a failed read, steps back to the window it was on, and reads again on retry", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    api.failMeanders("boom");
    act(() => {
      result.current.append();
    });

    await waitFor(() => {
      expect(result.current.loadError).toBeInstanceOf(Error);
    });

    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
    expect(result.current.hasMore).toBe(false);

    api.recover();
    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.range).toStrictEqual({ first: 1, last: 2 });
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.loadError).toBeUndefined();
  });

  it("does nothing to retry when nothing failed", () => {
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.retry();
    });

    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
  });

  it("keeps the window it moved on to when an earlier read fails", async () => {
    const api = serveMeandersApi(100, 30);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    api.failMeanders("boom");
    act(() => {
      result.current.select(5);
    });
    act(() => {
      result.current.select(1);
    });
    await waitFor(() => {
      expect(result.current.loadError).toBeInstanceOf(Error);
    });

    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
  });

  it("starts over on a new first page, forgetting the pages read under the old one", async () => {
    serveMeandersApi(100);
    const { rerender, result } = renderHook(
      ({ first }) => useMeanders(first, QUERY),
      { initialProps: { first: pageOf(0, 2) } },
    );

    act(() => {
      result.current.next();
    });
    await waitFor(() => {
      expect(result.current.range.first).toBe(2);
      expect(result.current.isLoading).toBe(false);
    });

    const second = pageOf(3, 5);

    rerender({ first: second });

    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
    expect(result.current.meanders).toStrictEqual(
      second.edges.map(({ node }) => node),
    );
  });

  it("ignores a read that ends after a new first page showed", async () => {
    serveMeandersApi(100, 30);
    const { rerender, result } = renderHook(
      ({ first }) => useMeanders(first, QUERY),
      { initialProps: { first: pageOf(0, 2) } },
    );

    act(() => {
      result.current.next();
    });

    const second = pageOf(3, 5);

    rerender({ first: second });
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 80);
    });

    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
    expect(result.current.meanders).toStrictEqual(
      second.edges.map(({ node }) => node),
    );
  });

  it("ignores a read that fails after a new first page showed", async () => {
    const api = serveMeandersApi(100, 30);
    const { rerender, result } = renderHook(
      ({ first }) => useMeanders(first, QUERY),
      { initialProps: { first: pageOf(0, 2) } },
    );

    api.failMeanders("boom");
    act(() => {
      result.current.next();
    });
    rerender({ first: pageOf(3, 5) });
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 80);
    });

    expect(result.current.loadError).toBeUndefined();
    expect(result.current.range).toStrictEqual({ first: 1, last: 1 });
  });
});
