import { setTimeout as sleep } from "node:timers/promises";

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  fixtureMeander,
  serveMeandersApi,
} from "../../../testing/meanders-api";

import { useMeanders } from "./use-meanders";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";

/** A page of fixture meanders from `start` to `end`, with more after it. */
function pageOf(
  start: number,
  end: number,
  hasNextPage: boolean,
): MeandersPage {
  return {
    edges: Array.from({ length: end - start }, (_, offset) => ({
      cursor: String(start + offset),
      node: fixtureMeander(start + offset),
    })),
    pageInfo: { endCursor: String(end - 1), hasNextPage },
    totalCount: 100,
  };
}

const QUERY = { repeats: 6 };

describe(useMeanders, () => {
  it("returns its result", () => {
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    expect(result.current).toStrictEqual({
      hasMore: true,
      loadError: undefined,
      loadMore: result.current.loadMore,
      meanders: first.edges.map(({ node }) => node),
    });
  });

  it("reads the page after the last one, by its cursor", async () => {
    const api = serveMeandersApi(5);
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(5);
    });

    expect(api.requests[0]).toMatchObject({ after: "1" });
    expect(result.current.hasMore).toBe(false);
  });

  it("reads the next page with the repeats asked for", async () => {
    const api = serveMeandersApi(5);
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() => useMeanders(first, { repeats: 3 }));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(5);
    });

    expect(api.requests[0]).toMatchObject({ repeats: 3 });
  });

  it("reads the next page in the sort the first was read in", async () => {
    const api = serveMeandersApi(5);
    const sort = { direction: "DESC", field: "rows" } as const;
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() =>
      useMeanders(first, { repeats: 6, sort }),
    );

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(5);
    });

    expect(api.requests[0]).toMatchObject({ sort });
  });

  it("reads nothing once the last page is in", () => {
    const api = serveMeandersApi(2);
    const { result } = renderHook(() =>
      useMeanders(pageOf(0, 2, false), QUERY),
    );

    act(() => {
      result.current.loadMore();
    });

    expect(api.requests).toHaveLength(0);
  });

  it("keeps the meanders and the reason when a page fails, and reads again when asked", async () => {
    const api = serveMeandersApi(4);
    api.fail("The database is down");
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() => useMeanders(first, QUERY));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadError).toBeInstanceOf(Error);
    });

    expect(result.current.meanders).toHaveLength(2);

    api.recover();
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(4);
    });

    expect(result.current.loadError).toBeUndefined();
  });

  it("drops a read begun under an old first page, and reads for the new one", async () => {
    const api = serveMeandersApi(6, 50);
    const { rerender, result } = renderHook(
      ({ first }) => useMeanders(first, QUERY),
      {
        initialProps: { first: pageOf(0, 2, true) },
      },
    );

    act(() => {
      result.current.loadMore();
    });

    const next = pageOf(2, 4, true);
    rerender({ first: next });
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(api.requests).toHaveLength(2);
    });
    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(4);
    });

    expect(result.current.meanders[0]?.code).toBe(fixtureMeander(2).code);
  });

  it("ignores the failure of a read begun under an old first page", async () => {
    const api = serveMeandersApi(6, 30);
    api.fail("The database is down");
    const { rerender, result } = renderHook(
      ({ first }) => useMeanders(first, QUERY),
      {
        initialProps: { first: pageOf(0, 2, true) },
      },
    );

    act(() => {
      result.current.loadMore();
    });
    rerender({ first: pageOf(2, 4, true) });

    await act(async () => {
      await sleep(100);
    });

    expect(api.requests).toHaveLength(1);
    expect(result.current.loadError).toBeUndefined();
  });

  it("starts over when the first page changes", async () => {
    serveMeandersApi(6);
    const { rerender, result } = renderHook(
      ({ first }) => useMeanders(first, QUERY),
      {
        initialProps: { first: pageOf(0, 2, true) },
      },
    );

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(6);
    });

    rerender({ first: pageOf(10, 12, true) });

    expect(result.current.meanders).toHaveLength(2);
  });
});
