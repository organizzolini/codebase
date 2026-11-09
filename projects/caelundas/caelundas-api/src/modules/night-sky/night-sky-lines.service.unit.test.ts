import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyLinesService } from "./night-sky-lines.service";
import { NightSkyProjectionService } from "./night-sky-projection.service";

import type {
  ConstellationSegment,
  LineStyle,
  SkyGeometry,
} from "./night-sky.types";

const STYLE: LineStyle = {
  lineColor: "#ffffff",
  lineOpacity: 0.28,
  lineWidth: 0.8,
};

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

describe(NightSkyLinesService, () => {
  let service: NightSkyLinesService;
  let projection: NightSkyProjectionService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NightSkyColorsService,
        NightSkyLinesService,
        NightSkyProjectionService,
      ],
    }).compile();

    service = await module.resolve(NightSkyLinesService);
    projection = await module.resolve(NightSkyProjectionService);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  it("draws a segment whose stars both show from one star to the other", () => {
    const segment = createSegment([2, 60], [3, 50]);
    const { markup, segmentsDrawn } = service.formatConstellationLines(
      GEOMETRY,
      [segment],
      STYLE,
    );
    const [polyline] = readPolylines(markup);
    const from = projection.project(GEOMETRY, segment.from);
    const to = projection.project(GEOMETRY, segment.to);

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
    const { markup } = service.formatConstellationLines(
      GEOMETRY,
      [createSegment([2, 40], [2, -80])],
      STYLE,
    );
    const radii = (readPolylines(markup)[0] ?? []).map(([x, y]) =>
      Math.hypot(x, y),
    );

    expect(radii.length).toBeGreaterThan(1);
    expect(Math.max(...radii)).toBeLessThanOrEqual(GEOMETRY.outerRadius);
  });

  it("strokes the figures in the color, opacity and width it is given", () => {
    const { markup } = service.formatConstellationLines(
      GEOMETRY,
      [createSegment([2, 60], [3, 50])],
      { lineColor: "#FF8800", lineOpacity: 0.5, lineWidth: 2 },
    );

    expect(markup).toMatch(
      /^<g [^>]*stroke="#ff8800" stroke-opacity="0.5" stroke-width="2"/u,
    );
  });

  it("never lets a color that is not hexadecimal into the markup", () => {
    const { markup } = service.formatConstellationLines(
      GEOMETRY,
      [createSegment([2, 60], [3, 50])],
      { ...STYLE, lineColor: '"/><script>' },
    );

    expect(markup).toContain('stroke="#ffffff"');
    expect(markup).not.toContain("<script>");
  });

  it("draws nothing of a segment whose stars the window never shows", () => {
    expect(
      service.formatConstellationLines(
        GEOMETRY,
        [createSegment([2, -70], [3, -75])],
        STYLE,
      ),
    ).toStrictEqual({ markup: "", segmentsDrawn: 0 });
  });

  it("follows a segment across 0 hours rather than around the pole", () => {
    const { markup } = service.formatConstellationLines(
      GEOMETRY,
      [createSegment([23.9, 30], [0.1, 30])],
      STYLE,
    );
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
