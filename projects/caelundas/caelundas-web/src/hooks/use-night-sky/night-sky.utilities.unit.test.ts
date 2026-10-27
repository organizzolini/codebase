import { Horizon, Observer, SiderealTime } from "astronomy-engine";
import { describe, expect, it } from "vitest";

import {
  buildNightSky,
  computeGreenwichMeanSiderealHours,
  computeLocalSiderealDegrees,
  computeStartingSiderealDegrees,
} from "./night-sky.utilities";
import catalog from "./use-night-sky.catalog.json";
import { starCatalogSchema } from "./use-night-sky.schemas";

import type { StarRow } from "./night-sky.types";

const stars = starCatalogSchema.parse(catalog);
const LATITUDE = 40.73;
const LONGITUDE = -74;
const WIDTH = 1100;
const HEIGHT = 700;
const FIELD_OF_VIEW = 20;
const RADIANS = Math.PI / 180;

// An independent oracle for where the pole-centered projection puts a star.
// It restates the geometry from the handoff rather than reading the module.
function tangentOfHalf(degrees: number): number {
  return Math.tan((degrees * RADIANS) / 2);
}

const scale =
  HEIGHT / (tangentOfHalf(LATITUDE) - tangentOfHalf(LATITUDE - FIELD_OF_VIEW));
const poleY = -scale * tangentOfHalf(LATITUDE - FIELD_OF_VIEW);

function leftOfCenter(star: StarRow, startAngleDegrees: number): boolean {
  const { x, y } = poleFrame(star);
  const angle = startAngleDegrees * RADIANS;

  return x * Math.cos(angle) + y * Math.sin(angle) < 0;
}

function onScreen(star: StarRow, startAngleDegrees: number): boolean {
  const { x, y } = poleFrame(star);
  const angle = startAngleDegrees * RADIANS;
  const screenX = WIDTH / 2 + x * Math.cos(angle) + y * Math.sin(angle);
  const screenY = poleY - x * Math.sin(angle) + y * Math.cos(angle);

  return screenX >= 0 && screenX <= WIDTH && screenY >= 0 && screenY <= HEIGHT;
}

function poleFrame(star: StarRow): { x: number; y: number } {
  const radius = ringRadius(star);
  const angle = star[0] * 15 * RADIANS;

  return { x: radius * Math.sin(angle), y: -radius * Math.cos(angle) };
}

function ringRadius(star: StarRow): number {
  return scale * tangentOfHalf(90 - star[1]);
}

const baseOptions = {
  height: HEIGHT,
  latitudeDegrees: LATITUDE,
  localSiderealDegrees: 0,
  stars,
  width: WIDTH,
} as const;

describe("night sky", () => {
  describe(buildNightSky, () => {
    it.each([
      "2026-10-20T01:00:00Z",
      "2026-10-20T05:00:00Z",
      "2026-12-21T03:00:00Z",
      "2027-03-10T02:00:00Z",
    ])("agrees with astronomy-engine on which way is west at %s", (iso) => {
      const instant = new Date(iso);
      const start = computeLocalSiderealDegrees(
        instant,
        LONGITUDE,
        SiderealTime(instant),
      );
      const observer = new Observer(LATITUDE, LONGITUDE, 0);
      const visible = stars.filter(
        (star) => star[2] <= 5.5 && onScreen(star, start),
      );
      const mismatches = visible.filter((star) => {
        const horizon = Horizon(instant, observer, star[0], star[1], "normal");
        const west = horizon.azimuth > 180;
        const altitudeOff =
          horizon.altitude < -1 || horizon.altitude > FIELD_OF_VIEW + 1;

        return leftOfCenter(star, start) !== west || altitudeOff;
      });

      expect(visible.length).toBeGreaterThan(20);
      expect(mismatches).toStrictEqual([]);
    });

    it("draws every star whose ring crosses the window at its position", () => {
      const { measurements, svg } = buildNightSky({
        ...baseOptions,
        faintestMagnitude: 5.5,
      });
      const crossing = stars.filter(
        (star) =>
          star[2] <= 5.5 &&
          ringRadius(star) >= -poleY - 24 &&
          ringRadius(star) <= Math.hypot(WIDTH / 2, HEIGHT - poleY) + 24,
      );
      const missing = crossing.filter((star) => {
        const { x, y } = poleFrame(star);

        return !svg.includes(`cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"`);
      });

      expect(measurements.starsDrawn).toBe(crossing.length);
      expect(missing).toStrictEqual([]);
    });

    it("starts at minus the sidereal angle and turns one full circle", () => {
      const { svg } = buildNightSky({
        ...baseOptions,
        localSiderealDegrees: 100,
      });

      expect(svg).toContain('from="-100.000" to="-460.000"');
    });

    it("stands still at minus the sidereal angle, the animation's starting angle", () => {
      const { svg } = buildNightSky({
        ...baseOptions,
        localSiderealDegrees: 100,
        still: true,
      });

      expect(svg).toContain('<g transform="rotate(-100.000)">');
      expect(svg).not.toContain("animateTransform");
    });

    it("puts the pole above the top edge and sets the period from the speed", () => {
      const slow = buildNightSky(baseOptions).measurements;
      const fast = buildNightSky({
        ...baseOptions,
        pixelsPerSecond: 24,
      }).measurements;

      expect(slow.poleDistanceAboveScreen).toBeCloseTo(679.9, 0);
      expect(slow.periodSeconds).toBeCloseTo(539.3, 0);
      expect(fast.periodSeconds).toBeCloseTo(slow.periodSeconds / 2, 6);
    });

    it("reduces a field of view that would put the pole on screen", () => {
      const { measurements } = buildNightSky({
        ...baseOptions,
        bottomAltitudeDegrees: 5,
        latitudeDegrees: 25,
        verticalFieldOfViewDegrees: 30,
      });

      expect(measurements.fieldOfViewClamped).toBe(true);
      expect(measurements.verticalFieldOfViewDegrees).toBe(19);
      expect(measurements.poleDistanceAboveScreen).toBeGreaterThan(0);
    });

    it("colors stars along the ramp and clamps out-of-range indexes", () => {
      const sample: readonly StarRow[] = [
        [3, 55, 4, -0.4],
        [6, 55, 4, 0.4],
        [9, 55, 4, 5],
      ];
      const { svg } = buildNightSky({ ...baseOptions, stars: sample });

      expect(svg).toContain('<g fill="#9bb0ff">');
      expect(svg).toContain('<g fill="#f8f7ff">');
      expect(svg).toContain('<g fill="#ff9a55">');
    });

    it("adds a glow only behind bright stars", () => {
      const bright = buildNightSky({
        ...baseOptions,
        stars: [[3, 55, 0, 0.6]],
      });
      const faint = buildNightSky({ ...baseOptions, stars: [[3, 55, 5, 0.6]] });

      expect(bright.svg).toContain('fill="url(#star-glow)"');
      expect(faint.svg).not.toContain('fill="url(#star-glow)"');
    });

    it("draws the zoomed-out tuning view only when asked", () => {
      const tuning = buildNightSky({ ...baseOptions, debug: true }).svg;
      const backdrop = buildNightSky(baseOptions).svg;

      expect(tuning).toContain('preserveAspectRatio="xMidYMid meet"');
      expect(tuning).toContain(">pole</text>");
      expect(backdrop).toContain('preserveAspectRatio="xMidYMid slice"');
      expect(backdrop).not.toContain(">pole</text>");
    });
  });

  describe("sidereal time", () => {
    it("matches astronomy-engine to within a few seconds", () => {
      const instant = new Date("2026-10-20T01:00:00Z");

      expect(computeGreenwichMeanSiderealHours(instant)).toBeCloseTo(
        SiderealTime(instant),
        2,
      );
    });

    it("keeps local sidereal time between 0 and 360 degrees", () => {
      const instant = new Date("2026-10-20T01:00:00Z");
      const west = computeLocalSiderealDegrees(instant, -300);
      const east = computeLocalSiderealDegrees(instant, 300);

      expect(west).toBeGreaterThanOrEqual(0);
      expect(west).toBeLessThan(360);
      expect(east).toBeGreaterThanOrEqual(0);
      expect(east).toBeLessThan(360);
    });

    it("starts the sky at astronomy-engine's local sidereal angle", () => {
      const instant = new Date("2026-10-20T01:00:00Z");

      expect(computeStartingSiderealDegrees(instant, LONGITUDE)).toBeCloseTo(
        computeLocalSiderealDegrees(instant, LONGITUDE, SiderealTime(instant)),
        6,
      );
    });
  });
});
