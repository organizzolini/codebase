import { describe, expect, it } from "vitest";

import { formatConstellationLines } from "./night-sky-lines.utilities";
import { projectSkyPoint } from "./night-sky-projection.utilities";

import type { ConstellationSegment, SkyGeometry } from "./night-sky.types";

const GEOMETRY: SkyGeometry = {
  fieldOfView: { clamped: false, degrees: 20, limitDegrees: 40 },
  innerRadius: 100,
  outerRadius: 2000,
  poleX: 0,
  poleY: 0,
  scale: 1000,
};

/**
 * A segment of an imaginary figure between two points.
 */
function createSegment(
  from: ConstellationSegment["from"],
  to: ConstellationSegment["to"],
): ConstellationSegment {
  return { from, name: "Test", to, zodiac: false };
}

/**
 * Every polyline's points, as [x, y] pairs.
 */
function readPolylines(markup: string): [number, number][][] {
  return Array.from(markup.matchAll(/points="([^"]+)"/gu), ([, points]) =>
    (points ?? "")
      .split(" ")
      .map((pair) => pair.split(",").map(Number) as [number, number]),
  );
}

describe(formatConstellationLines, () => {
  it("draws a segment whose stars both show from one star to the other", () => {
    const segment = createSegment([2, 60], [3, 50]);
    const { markup, segmentsDrawn } = formatConstellationLines(GEOMETRY, [
      segment,
    ]);
    const [polyline] = readPolylines(markup);
    const from = projectSkyPoint(GEOMETRY, segment.from);
    const to = projectSkyPoint(GEOMETRY, segment.to);

    expect(segmentsDrawn).toBe(1);
    expect(markup).toMatch(/^<g [^>]*stroke-opacity/u);
    expect(polyline?.at(0)).toStrictEqual([
      Number(from.x.toFixed(1)),
      Number(from.y.toFixed(1)),
    ]);
    expect(polyline?.at(-1)).toStrictEqual([
      Number(to.x.toFixed(1)),
      Number(to.y.toFixed(1)),
    ]);
  });

  it("cuts a segment where it leaves the ring the window can show", () => {
    const { markup } = formatConstellationLines(GEOMETRY, [
      createSegment([2, 40], [2, -80]),
    ]);
    const radii = (readPolylines(markup)[0] ?? []).map(([x, y]) =>
      Math.hypot(x, y),
    );

    expect(radii.length).toBeGreaterThan(1);
    expect(Math.max(...radii)).toBeLessThanOrEqual(GEOMETRY.outerRadius);
  });

  it("draws nothing of a segment whose stars the window never shows", () => {
    expect(
      formatConstellationLines(GEOMETRY, [createSegment([2, -70], [3, -75])]),
    ).toStrictEqual({ markup: "", segmentsDrawn: 0 });
  });

  it("follows a segment across 0 hours rather than around the pole", () => {
    const { markup } = formatConstellationLines(GEOMETRY, [
      createSegment([23.9, 30], [0.1, 30]),
    ]);
    const points = readPolylines(markup)[0] ?? [];
    const steps = points
      .slice(1)
      .map(([x, y], index) =>
        Math.hypot(
          x - (points[index]?.[0] ?? 0),
          y - (points[index]?.[1] ?? 0),
        ),
      );

    expect(points.length).toBeGreaterThan(2);
    expect(Math.max(...steps)).toBeLessThan(20);
  });
});
