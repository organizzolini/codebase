import { act, cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderRoute } from "../../../testing/render-route";
import { setReducedMotion } from "../../../testing/viewport";
import { EventsCalendar } from "../../components/events-calendar";
import { NightSkyBackdropMount } from "../../components/night-sky-backdrop";
import { computeStartingSiderealDegrees } from "../../components/use-night-sky.utilities";
import { getRouter } from "../../router";

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
vi.mock(import("../../components/events-calendar"), async (importOriginal) => {
  const original = await importOriginal();

  return { ...original, EventsCalendar: vi.fn(original.EventsCalendar) };
});

const WINDOW_SIZE = {
  innerHeight: globalThis.innerHeight,
  innerWidth: globalThis.innerWidth,
};

/**
 * How many stars the sky draws.
 */
function countStars(svg: SVGSVGElement): number {
  return svg.querySelectorAll("circle").length;
}

/**
 * The backdrop's SVG once the catalog has loaded and the sky is built.
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
 * The element that turns the sky, or nothing when it stands still.
 */
function queryAnimation(): Element | null {
  return screen
    .getByTestId("night-sky-backdrop")
    .querySelector("animateTransform");
}

/**
 * The seconds one turn of the sky takes.
 */
function readPeriod(svg: SVGSVGElement): number {
  return Number.parseFloat(
    svg.querySelector("animateTransform")?.getAttribute("dur") ?? "NaN",
  );
}

describe("night sky backdrop", () => {
  afterEach(() => {
    vi.useRealTimers();
    Object.assign(globalThis, WINDOW_SIZE);
  });

  it("sits behind the page, out of reach of the pointer and of readers", async () => {
    await renderRoute("/?date=2026-03-01");

    const svg = await findSky();
    const backdrop = screen.getByTestId("night-sky-backdrop");

    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.className).toContain("pointer-events-none");
    expect(backdrop.className).toContain("fixed");
    expect(countStars(svg)).toBeGreaterThan(100);
    expect(readPeriod(svg)).toBeGreaterThan(0);
    await expect(
      screen.findByRole("grid", { name: "March 2026" }),
    ).resolves.toBeDefined();
  });

  it("turns slower or faster with the speed the link sets", async () => {
    await renderRoute("/?date=2026-03-01");

    const normalSky = await findSky();
    const normal = readPeriod(normalSky);

    cleanup();
    await renderRoute("/?date=2026-03-01&sky.pixelsPerSecond=24");

    const fastSky = await findSky();

    expect(readPeriod(fastSky)).toBeCloseTo(normal / 2, 0);
  });

  it("shows fewer stars when the link lowers the faintest magnitude", async () => {
    await renderRoute("/?date=2026-03-01");

    const normalSky = await findSky();
    const normal = countStars(normalSky);

    cleanup();
    await renderRoute("/?date=2026-03-01&sky.maxMag=3");

    const fewerSky = await findSky();

    expect(countStars(fewerSky)).toBeLessThan(normal);
  });

  it("draws the tuning view when asked", async () => {
    await renderRoute("/?date=2026-03-01");

    const normalSky = await findSky();
    const normal = normalSky.getAttribute("viewBox");

    cleanup();
    await renderRoute("/?date=2026-03-01&sky.debug=true");

    const tuningSky = await findSky();

    expect(tuningSky.getAttribute("viewBox")).not.toBe(normal);
  });

  it("falls back to the defaults for values that do not parse", async () => {
    await renderRoute("/?date=2026-03-01");

    const normalSky = await findSky();
    const normal = countStars(normalSky);

    cleanup();
    await renderRoute(
      "/?date=2026-03-01&sky.maxMag=banana&sky.lat=999&sky.debug=yes&sky.vFov=-4&sky.lon=east&sky.starScale=0&sky.altBottom=up&sky.pixelsPerSecond=fast",
    );

    const fallbackSky = await findSky();

    expect(countStars(fallbackSky)).toBe(normal);
  });

  it("paints the background gradient in the colors of the link", async () => {
    await renderRoute("/?date=2026-03-01&sky.top=ff0000&sky.bottom=%2300f");

    const sky = await findSky();

    expect(sky.innerHTML).toContain('offset="0" stop-color="#ff0000"');
    expect(sky.innerHTML).toContain('offset="1" stop-color="#0000ff"');
  });

  it("never lets a color of the link into the markup unless it is hexadecimal", async () => {
    await renderRoute(
      "/?date=2026-03-01&sky.top=red%22/%3E%3Ci%3E&sky.bottom=%3Cb%3E",
    );

    const sky = await findSky();

    expect(sky.querySelector("i, b")).toBeNull();
    expect(sky.innerHTML).not.toContain("<i>");
    expect(sky.innerHTML).toContain('offset="0" stop-color="#04060f"');
    expect(sky.innerHTML).toContain('offset="1" stop-color="#0d1533"');
  });

  it("moves the observer with the link", async () => {
    await renderRoute("/?date=2026-03-01");

    const normalSky = await findSky();
    const normal = normalSky.innerHTML;

    cleanup();
    await renderRoute("/?date=2026-03-01&sky.lat=60&sky.lon=10");

    const movedSky = await findSky();

    expect(movedSky.innerHTML).not.toBe(normal);
  });

  it("rebuilds the sky when the link changes while the page is open", async () => {
    await renderRoute("/?date=2026-03-01");

    const sky = await findSky();
    const normal = sky.innerHTML;
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
      expect(readInner()).not.toBe(normal);
    });
  });

  it("leaves the calendar alone when only the sky's keys change", async () => {
    await renderRoute("/?date=2026-03-01");

    const sky = await findSky();
    const normal = sky.innerHTML;
    const router = vi.mocked(getRouter).mock.results.at(-1)?.value;
    const rendered = vi.mocked(EventsCalendar).mock.calls.length;

    await act(async () => {
      await router?.navigate({
        search: (previous: Record<string, unknown>) => ({
          ...previous,
          "sky.maxMag": 3,
        }),
        to: "/",
      });
    });

    await waitFor(() => {
      expect(readInner()).not.toBe(normal);
    });

    expect(vi.mocked(EventsCalendar)).toHaveBeenCalledTimes(rendered);
  });

  it("says when it reduces a field of view that would put the pole on screen", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await renderRoute("/?date=2026-03-01&sky.vFov=90");
    await findSky();

    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("field of view was reduced"),
      );
    });
    warn.mockRestore();
  });

  it("draws nothing for sky=off", async () => {
    await renderRoute("/?date=2026-03-01&sky=off");

    await screen.findByRole("grid", { name: "March 2026" });

    expect(
      screen.getByTestId("night-sky-backdrop").querySelector("svg"),
    ).toBeNull();
  });

  it("draws nothing at a latitude of zero or below", async () => {
    await renderRoute("/?date=2026-03-01&sky.lat=0");

    await screen.findByRole("grid", { name: "March 2026" });

    expect(
      screen.getByTestId("night-sky-backdrop").querySelector("svg"),
    ).toBeNull();
  });

  it("stands still when the page asks for reduced motion, and follows the setting", async () => {
    setReducedMotion(true);
    await renderRoute("/?date=2026-03-01");
    const still = await findSky();

    expect(queryAnimation()).toBeNull();
    // It stands at the angle the turning sky starts from, not at zero.
    expect(readRotation(still)).toBeCloseTo(
      -computeStartingSiderealDegrees(new Date(), -74),
      0,
    );

    act(() => {
      setReducedMotion(false);
    });

    await waitFor(() => {
      expect(queryAnimation()).not.toBeNull();
    });

    act(() => {
      setReducedMotion(true);
    });

    await waitFor(() => {
      expect(queryAnimation()).toBeNull();
    });
  });

  it("refits after the window is resized, once it settles", async () => {
    await renderRoute("/?date=2026-03-01");

    const sky = await findSky();
    const before = sky.getAttribute("viewBox");

    vi.useFakeTimers();
    Object.assign(globalThis, { innerHeight: 600, innerWidth: 500 });
    act(() => {
      globalThis.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(100);
    });

    expect(readViewBox()).toBe(before);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(readViewBox()).toBe("0 0 500 600");
  });
});

/**
 * The markup of the sky the backdrop now holds.
 */
function readInner(): string | undefined {
  return screen.getByTestId("night-sky-backdrop").querySelector("svg")
    ?.innerHTML;
}

/**
 * The angle the sky's star group stands at, when it is not animated.
 */
function readRotation(svg: SVGSVGElement): number {
  const transform = svg
    .querySelector("g[transform^='rotate']")
    ?.getAttribute("transform");

  return Number.parseFloat(transform?.slice("rotate(".length) ?? "NaN");
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
