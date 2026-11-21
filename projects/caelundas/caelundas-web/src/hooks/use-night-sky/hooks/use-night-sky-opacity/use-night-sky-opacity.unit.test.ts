import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useNightSkyOpacity } from "./use-night-sky-opacity";

/**
 * The link the router reads, which each test sets.
 */
const router = vi.hoisted(() => ({ search: {} }));

vi.mock(import("@tanstack/react-router"), () => ({
  useRouterState: ((options: {
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => unknown;
  }) => options.select({ location: { search: router.search } })) as never,
}));

describe(useNightSkyOpacity, () => {
  it("returns its result", () => {
    router.search = {};

    const { result } = renderHook(() => useNightSkyOpacity());

    expect(result.current).toStrictEqual({
      skyOpacity: 0.6,
      surfaceOpacity: 0.7,
    });
  });

  it("returns what the link sets", () => {
    router.search = { "sky.opacity": 0.2, "sky.surfaceOpacity": 0.4 };

    const { result } = renderHook(() => useNightSkyOpacity());

    expect(result.current).toStrictEqual({
      skyOpacity: 0.2,
      surfaceOpacity: 0.4,
    });
  });
});
