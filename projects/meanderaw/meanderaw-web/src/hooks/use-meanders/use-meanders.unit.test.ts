import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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

describe(useMeanders, () => {
  it("returns its result", () => {
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    expect(result.current).toStrictEqual({
      goTo: result.current.goTo,
      isLoading: false,
      loadError: undefined,
      meanders: first.edges.map(({ node }) => node),
      next: result.current.next,
      pageCount: 50,
      position: 0,
      previous: result.current.previous,
    });
  });

  it("shows nothing for no first page, as a grouped gallery has none", () => {
    const { result } = renderHook(() => useMeanders(undefined, QUERY));

    expect(result.current.meanders).toStrictEqual([]);
    expect(result.current.pageCount).toBe(0);

    act(() => {
      result.current.next();
    });

    expect(result.current.position).toBe(0);
  });

  it("reads the next page by the last one's cursor, as many meanders as the size, and shows it alone", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.next();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.requests[0]).toMatchObject({ after: "1", first: 2, repeats: 6 });
    expect(api.requests[0]?.offset).toBe(0);
    expect(result.current.position).toBe(1);
    expect(result.current.meanders.map(({ code }) => code)).toStrictEqual([
      "01x01y0002",
      "01x01y0003",
    ]);
  });

  it("jumps to a page not read before it by an offset, then steps on by cursor", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.goTo(10);
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.requests[0]).toMatchObject({ after: null, offset: 20 });
    expect(result.current.meanders[0]?.code).toBe("01x01y0020");

    act(() => {
      result.current.next();
    });
    await waitFor(() => {
      expect(result.current.position).toBe(11);
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.requests[1]).toMatchObject({ after: "21", offset: 0 });
    expect(result.current.meanders[0]?.code).toBe("01x01y0022");
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

    expect(result.current.position).toBe(0);
    expect(result.current.meanders).toStrictEqual(
      first.edges.map(({ node }) => node),
    );

    act(() => {
      result.current.next();
    });

    expect(result.current.position).toBe(1);
    expect(api.requests).toHaveLength(1);
  });

  it("ignores a page before the first and one past the last", () => {
    serveMeandersApi(3);
    const first = { ...pageOf(0, 2), totalCount: 3 };
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.previous();
      result.current.goTo(2);
    });

    expect(result.current.position).toBe(0);
    expect(result.current.pageCount).toBe(2);
  });

  it("reports a failed read, stays on the page it was on, and reads again on the next try", async () => {
    const api = serveMeandersApi(100);
    const first = pageOf(0, 2);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    api.failMeanders("boom");
    act(() => {
      result.current.next();
    });

    await waitFor(() => {
      expect(result.current.loadError).toBeInstanceOf(Error);
    });

    expect(result.current.position).toBe(0);

    api.recover();
    act(() => {
      result.current.next();
    });

    await waitFor(() => {
      expect(result.current.position).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.loadError).toBeUndefined();
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
      expect(result.current.position).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });

    const second = pageOf(3, 5);

    rerender({ first: second });

    expect(result.current.position).toBe(0);
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

    expect(result.current.position).toBe(0);
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
    expect(result.current.position).toBe(0);
  });
});
