import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCalendarDisplay } from "./use-calendar-display";

import type { CalendarSearch } from "../use-calendar-search/calendar-search.types";

/**
 * The link the router reads, and the navigation the hooks make.
 */
const router = vi.hoisted(() => ({
  navigate:
    vi.fn<
      (options: {
        replace: boolean;
        search: (previous: CalendarSearch) => CalendarSearch;
      }) => Promise<void>
    >(),
  search: {},
}));

vi.mock(import("@tanstack/react-router"), () => ({
  useNavigate: () => router.navigate as never,
  useRouterState: ((options: {
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => unknown;
  }) => options.select({ location: { search: router.search } })) as never,
}));

describe(useCalendarDisplay, () => {
  beforeEach(() => {
    router.search = {};
  });

  it("fills in every default when the link says nothing", () => {
    const { result } = renderHook(() => useCalendarDisplay("UTC"));

    expect(result.current.state).toStrictEqual({
      clusters: true,
      colors: true,
      scale: "month",
      symbols: "glyphs",
    });
    expect(result.current.sky.off).toBe(false);
  });

  it("reads what the link sets", () => {
    router.search = {
      clusters: false,
      colors: false,
      scale: "week",
      symbols: "emojis",
    };

    const { result } = renderHook(() => useCalendarDisplay("UTC"));

    expect(result.current.state).toStrictEqual({
      clusters: false,
      colors: false,
      scale: "week",
      symbols: "emojis",
    });
  });

  it("returns its result", () => {
    const { result } = renderHook(() => useCalendarDisplay("UTC"));

    expect(result.current).toStrictEqual({
      change: expect.any(Function),
      constellations: expect.any(Array),
      handlers: {
        handleClustersChange: expect.any(Function),
        handleColorByChange: expect.any(Function),
        handleColorsChange: expect.any(Function),
        handleScaleChange: expect.any(Function),
        handleSymbolsChange: expect.any(Function),
        handleViewChange: expect.any(Function),
      },
      sky: expect.objectContaining({ off: false }),
      state: {
        clusters: true,
        colors: true,
        scale: "month",
        symbols: "glyphs",
      },
    });
  });
});
