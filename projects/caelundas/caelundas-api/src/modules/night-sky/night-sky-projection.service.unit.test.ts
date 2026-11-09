import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkyProjectionService } from "./night-sky-projection.service";

import type { SkyGeometry } from "./night-sky.types";

const GEOMETRY: SkyGeometry = {
  fieldOfView: { clamped: false, degrees: 20, limitDegrees: 40 },
  innerRadius: 100,
  outerRadius: 500,
  poleX: 0,
  poleY: 0,
  scale: 1000,
};

describe(NightSkyProjectionService, () => {
  let service: NightSkyProjectionService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkyProjectionService],
    }).compile();

    service = await module.resolve(NightSkyProjectionService);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  describe("project", () => {
    it("puts the pole at the center and 0 hours straight up", () => {
      expect.hasAssertions();

      const pole = service.project(GEOMETRY, [0, 90]);
      const top = service.project(GEOMETRY, [0, 45]);

      expect(pole.radius).toBeCloseTo(0, 6);
      expect(top.x).toBeCloseTo(0, 6);
      expect(top.y).toBeLessThan(0);
    });

    it("turns right ascension clockwise on screen", () => {
      expect.hasAssertions();

      expect(service.project(GEOMETRY, [6, 45]).x).toBeGreaterThan(0);
    });
  });

  describe("splitIntoRuns", () => {
    it("cuts a line where it leaves the visible ring and drops short runs", () => {
      expect.hasAssertions();

      const runs = service.splitIntoRuns(GEOMETRY, [
        [0, 60],
        [0, 62],
        [0, 85],
        [0, 61],
        [0, 61.5],
      ]);

      expect(runs).toHaveLength(2);
    });
  });

  describe("formatPolyline", () => {
    it("writes the run's points to a tenth of a pixel", () => {
      expect.hasAssertions();

      expect(
        service.formatPolyline([
          { radius: 1, x: 1.04, y: 2.06 },
          { radius: 1, x: 3, y: 4 },
        ]),
      ).toBe('<polyline points="1.0,2.1 3.0,4.0"/>');
    });
  });
});
