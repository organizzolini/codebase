import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { serveCalendarApi } from "../../../testing/calendar-api";
import { serveGraphqlApi } from "../../../testing/graphql-api";
import { mockNightSkyQuery } from "../../graphql/generated/mocks";

import { useNightSky } from "./use-night-sky";

/**
 * The link the router reads, which each test sets, and the last state a select returned, as the router keeps it.
 */
const router = vi.hoisted(() => {
  const state: {
    previous: string | undefined;
    search: Record<string, unknown>;
    shared: unknown;
  } = { previous: undefined, search: {}, shared: undefined };

  return state;
});

vi.mock(import("@tanstack/react-router"), () => ({
  useRouterState: ((options: {
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => unknown;
  }) => {
    const selected = options.select({ location: { search: router.search } });
    const written = JSON.stringify(selected);

    if (written !== router.previous) {
      router.previous = written;
      router.shared = selected;
    }

    return router.shared;
  }) as never,
}));

/**
 * Renders the hook for a link and waits for the sky the API draws.
 */
async function renderSky(
  search: Readonly<Record<string, unknown>>,
): Promise<string> {
  router.search = { ...search };
  router.previous = undefined;

  const { result } = renderHook(() => useNightSky());

  return waitFor(() => {
    if (result.current.sky === undefined) {
      throw new Error("The sky is not drawn yet");
    }

    return result.current.sky;
  });
}

describe(useNightSky, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns its result", () => {
    serveCalendarApi();
    router.search = { sky: "off" };

    const { result } = renderHook(() => useNightSky());

    expect(result.current).toStrictEqual({ sky: undefined });
  });

  it("draws nothing for a latitude the northern view cannot show", () => {
    const api = serveCalendarApi();
    router.search = { "sky.lat": 0 };

    const { result } = renderHook(() => useNightSky());

    expect(result.current.sky).toBeUndefined();
    expect(api.requests.nightSky).toHaveLength(0);
  });

  it("asks the API for the sky the link describes, the size of the window", async () => {
    const api = serveCalendarApi();

    const sky = await renderSky({ "sky.lat": 51.5, "sky.pixelsPerSecond": 9 });

    expect(sky).toContain("<svg");
    expect(api.requests.nightSky).toHaveLength(1);
    expect(api.requests.nightSky[0]).toMatchObject({
      constellations: ["zodiac"],
      height: window.innerHeight,
      latitudeDegrees: 51.5,
      pixelsPerSecond: 9,
      still: false,
      width: window.innerWidth,
    });
  });

  it("asks for none when the link names no figure", async () => {
    const api = serveCalendarApi();

    await renderSky({ "sky.constellations": "" });

    expect(api.requests.nightSky[0]?.constellations).toStrictEqual(["none"]);
  });

  it("says why when the API cannot draw the sky, and leaves the page without one", async () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    const api = serveCalendarApi();

    api.fail("The sky answered 500");
    router.search = {};

    const { result } = renderHook(() => useNightSky());

    await waitFor(() => {
      expect(report).toHaveBeenCalledWith(
        "The night sky could not be loaded",
        expect.any(Error),
      );
    });

    expect(result.current.sky).toBeUndefined();
  });

  it("warns once of each name it has no figure for", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    serveCalendarApi();
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

  it("warns once of a line style it cannot read, and asks for the default", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const api = serveCalendarApi();

    await renderSky({ "sky.lineColor": "pink" });

    expect(api.requests.nightSky[0]?.lineColor).toBe("#ffffff");
    expect(
      warn.mock.calls.filter(([message]) =>
        String(message).includes("sky.lineColor"),
      ),
    ).toStrictEqual([
      ["The night sky ignored sky.lineColor, whose value does not parse"],
    ]);
  });

  it("says when the API reduced a field of view that would put the pole on screen", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    serveGraphqlApi(
      mockNightSkyQuery(({ variables }) =>
        HttpResponse.json({
          data: {
            nightSky: {
              measurements: {
                bottomAltitudeDegrees: 0,
                fieldOfViewClamped: true,
                fieldOfViewLimitDegrees: 60,
                periodSeconds: 600,
                poleDistanceAboveScreen: 0,
                realTimeMultiple: 1,
                segmentsDrawn: 0,
                starsDrawn: 0,
                starsInCatalog: 0,
                svgLength: 5,
                topAltitudeDegrees: 60,
                verticalFieldOfViewDegrees: variables.input.height,
              },
              svg: "<svg />",
            },
          },
        }),
      ),
    );
    await renderSky({ "sky.vFov": 90 });

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        "The night sky's field of view was reduced to 60.0 degrees to keep the pole off screen",
      );
    });
  });

  it("stands still when the page asks for reduced motion", async () => {
    const api = serveCalendarApi();

    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      (query) =>
        ({
          addEventListener: () => {},
          matches: true,
          media: query,
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    await renderSky({});

    expect(api.requests.nightSky[0]?.still).toBe(true);
  });

  it("sets nothing when the page has gone before the API answers", async () => {
    const api = serveCalendarApi();

    router.search = {};

    const { unmount } = renderHook(() => useNightSky());

    unmount();
    await waitFor(() => {
      expect(api.requests.nightSky).toHaveLength(1);
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(api.requests.nightSky).toHaveLength(1);
  });
});
