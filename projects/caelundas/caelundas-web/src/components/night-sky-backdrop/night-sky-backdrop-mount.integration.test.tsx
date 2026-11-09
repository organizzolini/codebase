import { act, cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { readServedApi } from "../../../testing/calendar-api";
import { renderCalendarRoute } from "../../../testing/render-route";
import { setReducedMotion } from "../../../testing/viewport";
import { getRouter } from "../../router";
import { EventsCalendar } from "../events-calendar/events-calendar";

import { NightSkyBackdropMount } from "./night-sky-backdrop-mount";

import type { NightSkyInput } from "../../graphql/generated/operations";

// The route helper renders under a bare root, so the backdrop the real root
// mounts is wrapped around the router's matches here.
vi.mock(import("../../router"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    getRouter: vi.fn(() => {
      const router = original.getRouter();

      router.update({
        ...router.options,
        InnerWrap: ({ children }) => (
          <>
            <NightSkyBackdropMount />
            {children}
          </>
        ),
      });

      return router;
    }),
  };
});

// Counts how often the page renders the calendar, to show a change to the
// sky's keys leaves it alone.
vi.mock(
  import("../events-calendar/events-calendar"),
  async (importOriginal) => {
    const original = await importOriginal();

    return { ...original, EventsCalendar: vi.fn(original.EventsCalendar) };
  },
);

// Each test renders the whole route; a loaded continuous integration runner
// took 5 to 7 seconds for the slowest of them, past the default 5, so the limit
// follows the other integration suites'.
vi.setConfig({ testTimeout: 30_000 });

const WINDOW_SIZE = {
  innerHeight: globalThis.innerHeight,
  innerWidth: globalThis.innerWidth,
};

/**
 * The sky the page asked the API for last, once the first has arrived.
 */
async function findRequest(link: string): Promise<NightSkyInput> {
  await renderCalendarRoute(link);
  const api = readServedApi();

  await findSky();

  const [request] = api.requests.nightSky;

  if (request === undefined) {
    throw new Error("The page asked for no sky");
  }

  return request;
}

/**
 * The backdrop's SVG once the API has drawn the sky.
 */
async function findSky(): Promise<SVGSVGElement> {
  return waitFor(() => {
    const svg = screen.getByTestId("night-sky-backdrop").querySelector("svg");

    if (svg === null) {
      throw new Error("The backdrop holds no sky yet");
    }

    return svg;
  });
}

/**
 * The viewBox of the sky the backdrop now holds.
 */
function readViewBox(): null | string | undefined {
  return screen
    .getByTestId("night-sky-backdrop")
    .querySelector("svg")
    ?.getAttribute("viewBox");
}

describe("night sky backdrop", () => {
  afterEach(() => {
    vi.useRealTimers();
    Object.assign(globalThis, WINDOW_SIZE);
  });

  it("sits behind the page, out of reach of the pointer and of readers", async () => {
    await renderCalendarRoute("/?date=2026-03-01");

    const svg = await findSky();
    const backdrop = screen.getByTestId("night-sky-backdrop");

    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.className).toContain("pointer-events-none");
    expect(backdrop.className).toContain("fixed");
    expect(svg.getAttribute("viewBox")).toBe(
      `0 0 ${String(window.innerWidth)} ${String(window.innerHeight)}`,
    );
    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("asks for the sky the defaults describe, the size of the window", async () => {
    await expect(findRequest("/?date=2026-03-01")).resolves.toStrictEqual({
      backgroundBottomColor: "#0d1533",
      backgroundTopColor: "#04060f",
      bottomAltitudeDegrees: 0,
      constellations: ["zodiac"],
      debug: false,
      ecliptic: true,
      eclipticColor: "#ffffff",
      eclipticOpacity: 0.12,
      eclipticWidth: 1,
      faintestMagnitude: 6.5,
      height: window.innerHeight,
      latitudeDegrees: 90,
      lineColor: "#ffffff",
      lineOpacity: 0.24,
      lineWidth: 0.8,
      longitudeDegrees: -74,
      pixelsPerSecond: 3,
      starScale: 1,
      still: false,
      verticalFieldOfViewDegrees: 90,
      width: window.innerWidth,
    });
  });

  it("asks for the speed, the magnitude, the observer and the scale the link sets", async () => {
    await expect(
      findRequest(
        "/?date=2026-03-01&sky.pixelsPerSecond=12&sky.maxMag=3&sky.lat=60&sky.lon=10&sky.starScale=2&sky.vFov=45&sky.altBottom=-10",
      ),
    ).resolves.toMatchObject({
      bottomAltitudeDegrees: -10,
      faintestMagnitude: 3,
      latitudeDegrees: 60,
      longitudeDegrees: 10,
      pixelsPerSecond: 12,
      starScale: 2,
      verticalFieldOfViewDegrees: 45,
    });
  });

  it("asks for the figures the link names, and none for an empty list", async () => {
    await expect(
      findRequest("/?date=2026-03-01&sky.constellations=ursa_major,leo"),
    ).resolves.toMatchObject({ constellations: ["ursa_major", "leo"] });

    cleanup();

    await expect(
      findRequest("/?date=2026-03-01&sky.constellations="),
    ).resolves.toMatchObject({ constellations: ["none"] });
  });

  it("asks for the figures and the ecliptic stroked as the link says", async () => {
    await expect(
      findRequest(
        "/?date=2026-03-01&sky.ecliptic=false&sky.lineColor=%23ff8800&sky.lineOpacity=0.5&sky.lineWidth=2",
      ),
    ).resolves.toMatchObject({
      ecliptic: false,
      lineColor: "#ff8800",
      lineOpacity: 0.5,
      lineWidth: 2,
    });
  });

  it("asks for the tuning view when told to", async () => {
    await expect(
      findRequest("/?date=2026-03-01&sky.debug=true"),
    ).resolves.toMatchObject({ debug: true });
  });

  it("falls back to the defaults for values that do not parse", async () => {
    const normal = await findRequest("/?date=2026-03-01");

    cleanup();

    await expect(
      findRequest(
        "/?date=2026-03-01&sky.maxMag=banana&sky.lat=999&sky.debug=yes&sky.vFov=-4&sky.lon=east&sky.starScale=0&sky.altBottom=up&sky.pixelsPerSecond=fast",
      ),
    ).resolves.toStrictEqual(normal);
  });

  it("asks for the background gradient in the colors of the link", async () => {
    await expect(
      findRequest("/?date=2026-03-01&sky.top=ff0000&sky.bottom=%2300f"),
    ).resolves.toMatchObject({
      backgroundBottomColor: "#0000ff",
      backgroundTopColor: "#ff0000",
    });
  });

  it("never sends a color of the link unless it is hexadecimal", async () => {
    await expect(
      findRequest(
        "/?date=2026-03-01&sky.top=red%22/%3E%3Ci%3E&sky.bottom=%3Cb%3E",
      ),
    ).resolves.toMatchObject({
      backgroundBottomColor: "#0d1533",
      backgroundTopColor: "#04060f",
    });
  });

  it("draws the sky the API answers", async () => {
    await renderCalendarRoute("/?date=2026-03-01&sky.lat=60&sky.lon=10", {
      api: {
        nightSky: () => ({
          measurements: {
            bottomAltitudeDegrees: 0,
            fieldOfViewClamped: false,
            fieldOfViewLimitDegrees: 89,
            periodSeconds: 600,
            poleDistanceAboveScreen: 0,
            realTimeMultiple: 1,
            segmentsDrawn: 0,
            starsDrawn: 0,
            starsInCatalog: 0,
            svgLength: 0,
            topAltitudeDegrees: 90,
            verticalFieldOfViewDegrees: 90,
          },
          svg: '<svg data-testid="api-sky" xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>',
        }),
      },
    });

    const sky = await findSky();

    expect(sky.dataset["testid"]).toBe("api-sky");
    expect(sky.querySelectorAll("circle")).toHaveLength(1);
  });

  it("asks for a new sky when the link changes while the page is open", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    const api = readServedApi();

    const sky = await findSky();

    expect(sky.dataset["latitude"]).toBe("90");

    const router = vi.mocked(getRouter).mock.results.at(-1)?.value;

    await act(async () => {
      await router?.navigate({
        search: (previous: Record<string, unknown>) => ({
          ...previous,
          "sky.lat": 60,
        }),
        to: "/",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("svg")?.dataset[
          "latitude"
        ],
      ).toBe("60");
    });

    expect(api.requests.nightSky.at(-1)).toMatchObject({
      latitudeDegrees: 60,
    });
  });

  it("leaves the calendar alone when only the sky's keys change", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    await findSky();

    const router = vi.mocked(getRouter).mock.results.at(-1)?.value;
    const rendered = vi.mocked(EventsCalendar).mock.calls.length;

    await act(async () => {
      await router?.navigate({
        search: (previous: Record<string, unknown>) => ({
          ...previous,
          "sky.lat": 60,
        }),
        to: "/",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("svg")?.dataset[
          "latitude"
        ],
      ).toBe("60");
    });

    expect(vi.mocked(EventsCalendar)).toHaveBeenCalledTimes(rendered);
  });

  it("says nothing of the pole's own one-degree cut at the defaults", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await renderCalendarRoute("/?date=2026-03-01");
    await findSky();

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining("field of view was reduced"),
    );

    warn.mockRestore();
  });

  it("says when the API reduced a field of view that would put the pole on screen", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await renderCalendarRoute("/?date=2026-03-01&sky.lat=40&sky.vFov=90", {
      api: {
        nightSky: (input) => ({
          measurements: {
            bottomAltitudeDegrees: 0,
            fieldOfViewClamped: true,
            fieldOfViewLimitDegrees: 50,
            periodSeconds: 600,
            poleDistanceAboveScreen: 0,
            realTimeMultiple: 1,
            segmentsDrawn: 0,
            starsDrawn: 0,
            starsInCatalog: 0,
            svgLength: 0,
            topAltitudeDegrees: 50,
            verticalFieldOfViewDegrees: 50,
          },
          svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(input.width)} ${String(input.height)}"/>`,
        }),
      },
    });
    await findSky();

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("field of view was reduced"),
      );
    });
    warn.mockRestore();
  });

  it("draws nothing, and asks for nothing, for sky=off", async () => {
    await renderCalendarRoute("/?date=2026-03-01&sky=off");
    const api = readServedApi();

    await screen.findByRole("grid", { name: "March 2026" });

    expect(
      screen.getByTestId("night-sky-backdrop").querySelector("svg"),
    ).toBeNull();
    expect(api.requests.nightSky).toHaveLength(0);
  });

  it("draws nothing, and asks for nothing, at a latitude of zero or below", async () => {
    await renderCalendarRoute("/?date=2026-03-01&sky.lat=0");
    const api = readServedApi();

    await screen.findByRole("grid", { name: "March 2026" });

    expect(
      screen.getByTestId("night-sky-backdrop").querySelector("svg"),
    ).toBeNull();
    expect(api.requests.nightSky).toHaveLength(0);
  });

  it("asks for a still sky when the page asks for reduced motion, and follows the setting", async () => {
    setReducedMotion(true);

    await renderCalendarRoute("/?date=2026-03-01");
    const api = readServedApi();
    const still = await findSky();

    expect(still.dataset["still"]).toBe("true");
    expect(api.requests.nightSky.at(-1)).toMatchObject({
      still: true,
    });

    act(() => {
      setReducedMotion(false);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("svg")?.dataset[
          "still"
        ],
      ).toBe("false");
    });

    act(() => {
      setReducedMotion(true);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("night-sky-backdrop").querySelector("svg")?.dataset[
          "still"
        ],
      ).toBe("true");
    });
  });

  it("refits after the window is resized, once it settles", async () => {
    await renderCalendarRoute("/?date=2026-03-01");
    const api = readServedApi();

    const sky = await findSky();
    const before = sky.getAttribute("viewBox");
    const asked = api.requests.nightSky.length;

    vi.useFakeTimers();
    Object.assign(globalThis, { innerHeight: 600, innerWidth: 500 });
    act(() => {
      globalThis.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(100);
    });

    expect(api.requests.nightSky).toHaveLength(asked);
    expect(readViewBox()).toBe(before);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    vi.useRealTimers();

    await waitFor(() => {
      expect(readViewBox()).toBe("0 0 500 600");
    });

    expect(api.requests.nightSky).toHaveLength(asked + 1);
  });
});
