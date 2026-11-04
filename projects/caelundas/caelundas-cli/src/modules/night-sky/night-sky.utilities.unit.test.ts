import { describe, expect, it } from "vitest";

import { NightSkySourceError } from "./night-sky.constants";
import {
  buildNightSkyRows,
  findStar,
  indexStars,
  parseConstellations,
  parseStarCatalog,
  traceConstellationLines,
} from "./night-sky.utilities";

import type { CatalogStar } from "./night-sky.types";

const HEADER = '"id","hip","proper","ra","dec","mag","ci"';

/**
 * A HYG CSV of the rows given after its header.
 */
function createCatalog(...rows: string[]): string {
  return [HEADER, ...rows, ""].join("\n");
}

const DUBHE: CatalogStar = {
  colorIndex: 1.06,
  declinationDegrees: 61.751,
  hip: 54_061,
  magnitude: 1.8,
  rightAscensionHours: 11.0621,
};

const MERAK: CatalogStar = {
  colorIndex: 0.03,
  declinationDegrees: 56.382,
  hip: 53_910,
  magnitude: 2.3,
  rightAscensionHours: 11.0307,
};

const FAINT: CatalogStar = {
  colorIndex: 0.5,
  declinationDegrees: 10,
  hip: 1,
  magnitude: 7.2,
  rightAscensionHours: 1,
};

describe("night-sky utilities", () => {
  describe(parseStarCatalog, () => {
    it("reads every star with a Hipparcos number at -45 degrees or north", () => {
      const catalog = createCatalog(
        "0,,Sol,0.0,0.0,-26.7,0.656",
        '54060,54061,"Dubhe",11.062130,61.751033,1.81,1.061',
        '1,1,"",1.0,10.0,7.2,0.5',
        '2,,"",2.0,20.0,4.0,0.1',
        '3,3,"",3.0,-60.0,1.0,0.1',
        '4,4,"",4.0,-44.9,5.0,',
      );

      expect(parseStarCatalog(catalog)).toStrictEqual([
        DUBHE,
        FAINT,
        {
          colorIndex: 0.6,
          declinationDegrees: -44.9,
          hip: 4,
          magnitude: 5,
          rightAscensionHours: 4,
        },
      ]);
    });

    it("refuses a catalog without a column it reads", () => {
      expect(() => parseStarCatalog('"id","ra"\n1,2\n')).toThrow(
        NightSkySourceError,
      );
    });
  });

  describe(findStar, () => {
    const index = indexStars([DUBHE, MERAK]);

    it("finds the star a vertex lies on, right ascension given in degrees", () => {
      expect(findStar(index, [165.9319, 61.751])).toBe(DUBHE);
      expect(findStar(index, [165.4605 - 360, 56.3824])).toBe(MERAK);
    });

    it("finds nothing farther than the tolerance from every star", () => {
      expect(findStar(index, [165.9319, 61.9])).toBeUndefined();
      expect(findStar(index, [10, -30])).toBeUndefined();
    });
  });

  describe(parseConstellations, () => {
    it("reads a constellation drawn in two parts once, by its whole name", () => {
      const file = JSON.stringify({
        features: [
          { id: "Ser", properties: { name: "Serpens Caput" } },
          { id: "Ser", properties: { name: "Serpens Cauda" } },
        ],
      });

      expect(parseConstellations(file)).toStrictEqual([
        { designation: "Ser", name: "Serpens", zodiac: false },
      ]);
    });

    it("reads each designation and name, marking the zodiac", () => {
      const file = JSON.stringify({
        features: [
          { id: "UMa", properties: { name: "Ursa Major" } },
          { id: "Sco", properties: { name: "Scorpius" } },
        ],
      });

      expect(parseConstellations(file)).toStrictEqual([
        { designation: "UMa", name: "Ursa Major", zodiac: false },
        { designation: "Sco", name: "Scorpius", zodiac: true },
      ]);
    });
  });

  describe(traceConstellationLines, () => {
    const index = indexStars([DUBHE, MERAK]);

    it("joins each pair of vertices it finds stars for, once", () => {
      const file = JSON.stringify({
        features: [
          {
            geometry: {
              coordinates: [
                [
                  [165.9319, 61.751],
                  [165.4605, 56.3824],
                  [10, -30],
                ],
                [
                  [165.4605, 56.3824],
                  [165.9319, 61.751],
                ],
              ],
            },
            id: "UMa",
          },
        ],
      });

      expect(traceConstellationLines(file, index)).toStrictEqual([
        { constellationDesignation: "UMa", fromHip: 54_061, toHip: 53_910 },
      ]);
    });
  });

  describe(buildNightSkyRows, () => {
    it("stores the stars bright enough or in a figure, and the figures' segments", () => {
      const rows = buildNightSkyRows({
        constellations: JSON.stringify({
          features: [{ id: "UMa", properties: { name: "Ursa Major" } }],
        }),
        lines: JSON.stringify({
          features: [
            {
              geometry: {
                coordinates: [
                  [
                    [165.9319, 61.751],
                    [15, 10],
                  ],
                ],
              },
              id: "UMa",
            },
          ],
        }),
        stars: createCatalog(
          '54060,54061,"Dubhe",11.062130,61.751033,1.81,1.061',
          '1,1,"",1.0,10.0,7.2,0.5',
          '2,2,"",2.0,10.0,7.3,0.5',
        ),
      });

      expect(rows).toStrictEqual({
        constellations: [
          { designation: "UMa", name: "Ursa Major", zodiac: false },
        ],
        lines: [{ constellationDesignation: "UMa", fromHip: 54_061, toHip: 1 }],
        stars: [DUBHE, FAINT],
      });
    });
  });
});
