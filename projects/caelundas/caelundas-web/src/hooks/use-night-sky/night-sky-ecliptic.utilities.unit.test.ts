import { describe, expect, it } from "vitest";

import {
  formatEcliptic,
  toEclipticPoint,
  traceEcliptic,
} from "./night-sky-ecliptic.utilities";

import type { EclipticStyle, SkyGeometry } from "./night-sky.types";

const STYLE: EclipticStyle = {
  eclipticColor: "#ffb877",
  eclipticOpacity: 0.5,
  eclipticWidth: 1,
};

/**
 * A frame whose ring reaches 2000 from the pole, past every declination the
 * ecliptic takes.
 */
const WIDE: SkyGeometry = {
  fieldOfView: { clamped: false, degrees: 20, limitDegrees: 40 },
  innerRadius: 100,
  outerRadius: 2000,
  poleX: 0,
  poleY: 0,
  scale: 1000,
};

describe("night sky ecliptic", () => {
  describe(toEclipticPoint, () => {
    it("starts at the March equinox, on the equator at 0 hours", () => {
      const [rightAscension, declination] = toEclipticPoint(0);

      expect(rightAscension).toBeCloseTo(0, 6);
      expect(declination).toBeCloseTo(0, 6);
    });

    it("reaches the obliquity north at 6 hours and south at 18", () => {
      const [northHours, north] = toEclipticPoint(90);
      const [southHours, south] = toEclipticPoint(270);

      expect(northHours).toBeCloseTo(6, 6);
      expect(north).toBeCloseTo(23.44, 6);
      expect(southHours).toBeCloseTo(18, 6);
      expect(south).toBeCloseTo(-23.44, 6);
    });

    it("crosses the equator again at 12 hours", () => {
      const [rightAscension, declination] = toEclipticPoint(180);

      expect(rightAscension).toBeCloseTo(12, 6);
      expect(declination).toBeCloseTo(0, 6);
    });
  });

  describe(traceEcliptic, () => {
    it("closes the circle every five degrees of longitude", () => {
      const points = traceEcliptic();

      expect(points).toHaveLength(73);
      expect(points.at(-1)?.[1]).toBeCloseTo(points[0]?.[1] ?? Number.NaN, 6);
    });
  });

  describe(formatEcliptic, () => {
    it("draws a dashed path in its own color, opacity and width", () => {
      const markup = formatEcliptic(WIDE, STYLE);

      expect(markup).toMatch(
        /^<g data-layer="ecliptic" stroke="#ffb877" stroke-opacity="0.5" stroke-width="1"[^>]*stroke-dasharray/u,
      );
      expect(markup).toContain("<polyline");
    });

    it("draws nothing when the window never shows it", () => {
      expect(formatEcliptic({ ...WIDE, outerRadius: 400 }, STYLE)).toBe("");
    });
  });
});
