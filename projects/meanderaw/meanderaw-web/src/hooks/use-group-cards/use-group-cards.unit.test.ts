import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  fixtureMeander,
  serveMeandersApi,
} from "../../../testing/meanders-api";

import { useGroupCards } from "./use-group-cards";

describe(useGroupCards, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useGroupCards());

    expect(result.current).toStrictEqual({
      cards: {},
      load: result.current.load,
    });
  });

  it("reads a group's cards, and its next page after the first", async () => {
    const api = serveMeandersApi(60);
    const leaf = { filter: undefined, id: "all" };
    const { result } = renderHook(() => useGroupCards());

    result.current.load(leaf);

    await waitFor(() => {
      expect(result.current.cards["all"]?.meanders).toHaveLength(48);
    });

    expect(result.current.cards["all"]?.hasMore).toBe(true);

    result.current.load(leaf);

    await waitFor(() => {
      expect(result.current.cards["all"]?.meanders).toHaveLength(60);
    });

    expect(result.current.cards["all"]?.meanders[0]?.id).toBe(
      fixtureMeander(0).id,
    );
    expect(api.requests).toHaveLength(2);

    result.current.load(leaf);

    expect(api.requests).toHaveLength(2);
  });

  it("keeps a failure with the group until it is tried again", async () => {
    const api = serveMeandersApi(3);
    const leaf = { filter: undefined, id: "all" };
    const { result } = renderHook(() => useGroupCards());
    api.fail("The database is down");

    result.current.load(leaf);

    await waitFor(() => {
      expect(result.current.cards["all"]?.error).toBeInstanceOf(Error);
    });

    api.recover();
    result.current.load(leaf);

    await waitFor(() => {
      expect(result.current.cards["all"]?.meanders).toHaveLength(3);
    });

    expect(result.current.cards["all"]?.error).toBeUndefined();
  });

  it("reads a group once however many times it is asked for at once", async () => {
    const api = serveMeandersApi(3);
    const leaf = { filter: undefined, id: "all" };
    const { result } = renderHook(() => useGroupCards());

    result.current.load(leaf);
    result.current.load(leaf);
    result.current.load(leaf);

    await waitFor(() => {
      expect(result.current.cards["all"]?.meanders).toHaveLength(3);
    });

    expect(api.requests).toHaveLength(1);
  });
});
