import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useNightSkySettings } from "./use-night-sky-settings";

import type { CalendarSearch } from "../../../use-calendar-search/calendar-search.types";

/**
 * The link the router reads, and the navigation the hook makes.
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

describe(useNightSkySettings, () => {
  it("returns its result", () => {
    router.search = { "skyfield.lat": 51.5 };

    const { result } = renderHook(() => useNightSkySettings());

    expect(result.current).toStrictEqual({
      change: expect.any(Function),
      constellations: expect.any(Array),
      settings: expect.objectContaining({ latitudeDegrees: 51.5 }),
    });
    expect(result.current.settings.constellations).toStrictEqual(["all"]);
    expect(result.current.constellations).toHaveLength(88);
    expect(
      result.current.constellations.filter(({ zodiac }) => zodiac),
    ).toHaveLength(12);
  });

  it("writes a change over the link, replacing its history entry", () => {
    const { result } = renderHook(() => useNightSkySettings());

    act(() => {
      result.current.change({ "skyfield.lat": 60, "skyfield.top": undefined });
    });

    const [options] = router.navigate.mock.lastCall ?? [];

    expect(options?.replace).toBe(true);
    expect(
      options?.search({ date: "2026-03-01", "skyfield.top": "#102040" }),
    ).toStrictEqual({
      date: "2026-03-01",
      "skyfield.lat": 60,
      "skyfield.top": undefined,
    });
  });

  it("drops the old sky keys a link still carries when it writes", () => {
    const { result } = renderHook(() => useNightSkySettings());

    act(() => {
      result.current.change({ "skyfield.lat": 60 });
    });

    const [options] = router.navigate.mock.lastCall ?? [];

    const previous = { sky: "off", "sky.lat": 10, "skyfield.lon": 5 };

    expect(options?.search(previous)).toStrictEqual({
      "skyfield.lat": 60,
      "skyfield.lon": 5,
    });
  });
});
