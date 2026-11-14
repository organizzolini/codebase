import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  fixtureMeander,
  serveMeandersApi,
} from "../../../testing/meanders-api";

import { useMeanders } from "./use-meanders";

import type { MeandersPage } from "../../components/meander-gallery/meanders-api.types";

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

describe(useMeanders, () => {
  it("returns its result", () => {
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() => useMeanders(first));

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
    const { result } = renderHook(() => useMeanders(first));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.meanders).toHaveLength(5);
    });

    expect(api.requests[0]).toMatchObject({ after: "1" });
    expect(result.current.hasMore).toBe(false);
  });

  it("reads nothing once the last page is in", () => {
    const api = serveMeandersApi(2);
    const { result } = renderHook(() => useMeanders(pageOf(0, 2, false)));

    act(() => {
      result.current.loadMore();
    });

    expect(api.requests).toHaveLength(0);
  });

  it("keeps the meanders and the reason when a page fails, and reads again when asked", async () => {
    const api = serveMeandersApi(4);
    api.fail("The database is down");
    const first = pageOf(0, 2, true);
    const { result } = renderHook(() => useMeanders(first));

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

  it("starts over when the first page changes", async () => {
    serveMeandersApi(6);
    const { rerender, result } = renderHook(({ first }) => useMeanders(first), {
      initialProps: { first: pageOf(0, 2, true) },
    });

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
