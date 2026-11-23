import { type Mock, vi } from "vitest";

import { Constellation, Star } from "@codebase/caelundas-db";

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

/** Catalog stars, so a Postgres-free sky has stars to draw. */
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

/** Lyra, with an edge from Vega to a faint star. */
const LYRA: Constellation = {
  designation: "Lyr",
  edges: [
    {
      constellationDesignation: "Lyr",
      fromHip: 91_262,
      source: VEGA,
      target: FAINT,
      toHip: 62_956,
    },
  ],
  name: "Lyra",
  zodiac: false,
};

// 🗄️ Entity manager

const READS = new Map<unknown, unknown[]>([
  [Constellation, [LYRA]],
  [Star, STARS],
]);

/** Answers reads without a database: stars, and one constellation. */
export const NO_DATABASE_ENTITY_MANAGER = {
  getRepository: (
    target: unknown,
  ): { find: Mock<() => Promise<unknown[]>> } => ({
    find: vi
      .fn<() => Promise<unknown[]>>()
      .mockResolvedValue(READS.get(target) ?? []),
  }),
};
