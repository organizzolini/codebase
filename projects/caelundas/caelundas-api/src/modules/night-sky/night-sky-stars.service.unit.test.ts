import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { NightSkyProjectionService } from "./night-sky-projection.service";
import { NightSkyStarsService } from "./night-sky-stars.service";
import { DEFAULT_OPTIONS } from "./night-sky.constants";

import type {
  RenderedStar,
  ResolvedNightSkyOptions,
  SkyGeometry,
  StarRow,
} from "./night-sky.types";

const GEOMETRY: SkyGeometry = {
  fieldOfView: { clamped: false, degrees: 20, limitDegrees: 40 },
  innerRadius: 100,
  outerRadius: 2000,
  poleX: 0,
  poleY: 0,
  scale: 1000,
};

function optionsFor(stars: readonly StarRow[]): ResolvedNightSkyOptions {
  return {
    ...DEFAULT_OPTIONS,
    constellationSegments: [],
    height: 700,
    latitudeDegrees: 40,
    localSiderealDegrees: 0,
    stars,
    width: 1100,
  };
}

describe(NightSkyStarsService, () => {
  let service: NightSkyStarsService;

  const providers = [NightSkyProjectionService];

  beforeAll(async () => {
    const built = await buildTestingModule(NightSkyStarsService, { providers });

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(NightSkyStarsService, {
      providers,
    });

    expect(instance).toBeInstanceOf(NightSkyStarsService);
  });

  describe("select", () => {
    it("leaves out stars fainter than the faintest magnitude", () => {
      expect.hasAssertions();

      const { inCatalog, rendered } = service.select(
        GEOMETRY,
        optionsFor([
          [3, 55, 1, 0.6],
          [3, 55, DEFAULT_OPTIONS.faintestMagnitude + 1, 0.6],
        ]),
      );

      expect(inCatalog).toBe(1);
      expect(rendered).toHaveLength(1);
    });
  });

  describe("formatGlowGroup", () => {
    it("groups the glows, or answers nothing when none is bright", () => {
      expect.hasAssertions();

      const bright: RenderedStar = {
        circle: "<c/>",
        colorBucket: 3,
        glow: "<g/>",
      };
      const dim: RenderedStar = {
        circle: "<c/>",
        colorBucket: 3,
        glow: undefined,
      };

      expect(service.formatGlowGroup([bright])).toBe(
        '<g fill="url(#star-glow)"><g/></g>',
      );
      expect(service.formatGlowGroup([dim])).toBe("");
    });
  });

  describe("formatStarGroups", () => {
    it("carries each color bucket in one group", () => {
      expect.hasAssertions();

      const star: RenderedStar = {
        circle: "<c/>",
        colorBucket: 3,
        glow: undefined,
      };
      const markup = service.formatStarGroups([star, star]);

      expect(markup.match(/<g /gu)).toHaveLength(1);
      expect(markup).toContain("<c/><c/>");
    });
  });
});
