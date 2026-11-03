import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import { useNightSkySettings } from "./use-night-sky-settings";

import type { CalendarSearch } from "../use-calendar-search/calendar-search.types";

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
  useRouter: (() => ({
    options: { context: { eventsDatabase: createTestEventsDatabase() } },
  })) as never,
  useRouterState: ((options: {
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => unknown;
  }) => options.select({ location: { search: router.search } })) as never,
}));

describe(useNightSkySettings, () => {
  it("returns its result", async () => {
    router.search = { "sky.lat": 51.5 };

    const { result } = renderHook(() => useNightSkySettings());

    expect(result.current).toStrictEqual({
      change: expect.any(Function),
      constellations: [],
      settings: expect.objectContaining({ latitudeDegrees: 51.5 }),
    });
    expect(result.current.settings.constellations).toStrictEqual(["zodiac"]);

    await waitFor(() => {
      expect(result.current.constellations).toHaveLength(88);
    });
  });

  it("writes a change over the link, replacing its history entry", () => {
    const { result } = renderHook(() => useNightSkySettings());

    act(() => {
      result.current.change({ "sky.lat": 60, "sky.top": undefined });
    });

    const [options] = router.navigate.mock.lastCall ?? [];

    expect(options?.replace).toBe(true);
    expect(
      options?.search({ date: "2026-03-01", "sky.top": "#102040" }),
    ).toStrictEqual({
      date: "2026-03-01",
      "sky.lat": 60,
      "sky.top": undefined,
    });
  });
});
