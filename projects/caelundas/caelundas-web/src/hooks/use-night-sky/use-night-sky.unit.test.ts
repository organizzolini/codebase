import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useNightSky } from "./use-night-sky";

/**
 * The link the router reads, which each test sets.
 */
const link = vi.hoisted(() => ({
  search: {},
}));

vi.mock(import("@tanstack/react-router"), () => ({
  useRouterState: ((options: {
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => unknown;
  }) => options.select({ location: { search: link.search } })) as never,
}));

describe(useNightSky, () => {
  it("returns its result", () => {
    link.search = { sky: "off" };

    const { result } = renderHook(() => useNightSky());

    expect(result.current).toStrictEqual({ sky: undefined });
  });

  it("draws nothing for a latitude the northern view cannot show", () => {
    link.search = { "sky.lat": 0 };

    const { result } = renderHook(() => useNightSky());

    expect(result.current.sky).toBeUndefined();
  });
});
