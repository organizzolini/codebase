import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import { useNightSky } from "./use-night-sky";

import type { EventsDatabase } from "../../components/events-calendar/events-database.types";

/**
 * The link the router reads, and the database its context holds, which each
 * test sets.
 */
const router = vi.hoisted(() => {
  const context: { eventsDatabase?: EventsDatabase } = {};

  return { context, search: {} };
});

vi.mock(import("@tanstack/react-router"), () => ({
  useRouter: (() => ({ options: { context: router.context } })) as never,
  useRouterState: ((options: {
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => unknown;
  }) => options.select({ location: { search: router.search } })) as never,
}));

/**
 * Renders the hook for a link and waits for the sky it builds.
 */
async function renderSky(
  search: Readonly<Record<string, unknown>>,
): Promise<string> {
  router.context.eventsDatabase = createTestEventsDatabase();
  router.search = search;

  const { result } = renderHook(() => useNightSky());

  return waitFor(() => {
    if (result.current.sky === undefined) {
      throw new Error("The sky is not built yet");
    }

    return result.current.sky;
  });
}

describe(useNightSky, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns its result", () => {
    router.context.eventsDatabase = createTestEventsDatabase();
    router.search = { sky: "off" };

    const { result } = renderHook(() => useNightSky());

    expect(result.current).toStrictEqual({ sky: undefined });
  });

  it("draws nothing for a latitude the northern view cannot show", () => {
    router.context.eventsDatabase = createTestEventsDatabase();
    router.search = { "sky.lat": 0 };

    const { result } = renderHook(() => useNightSky());

    expect(result.current.sky).toBeUndefined();
  });

  it("draws no figure unless the link asks for one", async () => {
    await expect(renderSky({})).resolves.not.toContain("<polyline");
  });

  it("draws the figures the link asks for beneath the stars", async () => {
    const sky = await renderSky({ "sky.constellations": "all" });

    expect(sky).toContain("<polyline");
    expect(sky.indexOf("<polyline")).toBeLessThan(sky.indexOf("<circle"));
  });

  it("warns once of each name it has no figure for", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await renderSky({ "sky.constellations": "zodiac,narnia,narnia" });

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        "The night sky has no constellation named narnia",
      );
    });

    expect(
      warn.mock.calls.filter(([message]) => String(message).includes("narnia")),
    ).toHaveLength(1);
  });

  it("warns once of a line style it cannot read, and draws the default", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const sky = await renderSky({
      "sky.constellations": "all",
      "sky.lineColor": "pink",
    });

    expect(sky).toContain('stroke="#c8d4ff"');
    expect(
      warn.mock.calls.filter(([message]) =>
        String(message).includes("sky.lineColor"),
      ),
    ).toStrictEqual([
      ["The night sky ignored sky.lineColor, whose value does not parse"],
    ]);
  });
});
