import { type Mock, vi } from "vitest";

import {
  type Constellation,
  ConstellationLine,
  Star,
} from "@codebase/caelundas-db";

// 🌟 Stars

const VEGA: Star = {
  colorIndex: 0,
  declinationDegrees: 38.8,
  hip: 91_262,
  magnitude: 0.03,
  rightAscensionHours: 18.6,
};

const FAINT: Star = {
  colorIndex: 0.9,
  declinationDegrees: 56.4,
  hip: 62_956,
  magnitude: 5.5,
  rightAscensionHours: 12.9,
};

/**
 * A few stars, as the catalog `caelundas-cli night-sky` ingests holds them,
 * so a sky drawn without Postgres still has stars to draw, and a magnitude
 * limit still has a star to leave out.
 */
const STARS: Star[] = [
  VEGA,
  {
    colorIndex: 1.2,
    declinationDegrees: 19.2,
    hip: 69_673,
    magnitude: -0.05,
    rightAscensionHours: 14.26,
  },
  {
    colorIndex: 0.6,
    declinationDegrees: 89.3,
    hip: 11_767,
    magnitude: 2,
    rightAscensionHours: 2.5,
  },
  FAINT,
];

const LYRA: Constellation = { designation: "Lyr", name: "Lyra", zodiac: false };

/** One figure segment, from the first star to the faint one. */
const LINES: ConstellationLine[] = [
  {
    constellation: LYRA,
    constellationDesignation: "Lyr",
    fromHip: 91_262,
    fromStar: VEGA,
    toHip: 62_956,
    toStar: FAINT,
  },
];

// 🗄️ Entity manager

const READS = new Map<unknown, unknown[]>([
  [ConstellationLine, LINES],
  [Star, STARS],
]);

/**
 * What the services' entity manager answers without a database: the stars
 * and the one figure segment above, and no row of any other entity.
 */
export const NO_DATABASE_ENTITY_MANAGER = {
  getRepository: (
    target: unknown,
  ): { find: Mock<() => Promise<unknown[]>> } => ({
    find: vi
      .fn<() => Promise<unknown[]>>()
      .mockResolvedValue(READS.get(target) ?? []),
  }),
};
