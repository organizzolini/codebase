import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { NightSkyProjectionService } from "./night-sky-projection.service";
import { NightSkyViewService } from "./night-sky-view.service";
import { DEFAULT_OPTIONS } from "./night-sky.constants";

import type { ResolvedNightSkyOptions } from "./night-sky.types";

const OPTIONS: ResolvedNightSkyOptions = {
  ...DEFAULT_OPTIONS,
  constellationSegments: [],
  height: 700,
  latitudeDegrees: 40,
  localSiderealDegrees: 0,
  stars: [],
  width: 1100,
};

describe(NightSkyViewService, () => {
  let service: NightSkyViewService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NightSkyProjectionService, NightSkyViewService],
    }).compile();

    service = await module.resolve(NightSkyViewService);
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(service).toBeDefined();
  });

  describe("computeGeometry", () => {
    it("keeps the pole above the top edge by limiting the field of view", () => {
      expect.hasAssertions();

      const geometry = service.computeGeometry({
        ...OPTIONS,
        verticalFieldOfViewDegrees: 90,
      });

      expect(geometry.fieldOfView.clamped).toBe(true);
      expect(geometry.poleY).toBeLessThan(0);
    });
  });

  describe("computeMotion", () => {
    it("turns slower for a slower requested speed", () => {
      expect.hasAssertions();

      const geometry = service.computeGeometry(OPTIONS);
      const slow = service.computeMotion(geometry, {
        ...OPTIONS,
        pixelsPerSecond: 1,
      });
      const fast = service.computeMotion(geometry, {
        ...OPTIONS,
        pixelsPerSecond: 10,
      });

      expect(slow.periodSeconds).toBeGreaterThan(fast.periodSeconds);
    });
  });

  describe("buildViewport", () => {
    it("fits the window, or the whole ring for the tuning view", () => {
      expect.hasAssertions();

      const geometry = service.computeGeometry(OPTIONS);

      expect(service.buildViewport(geometry, OPTIONS).viewBox).toBe(
        "0 0 1100 700",
      );
      expect(
        service.buildViewport(geometry, { ...OPTIONS, debug: true }).overlay,
      ).toContain(">pole</text>");
    });
  });
});
