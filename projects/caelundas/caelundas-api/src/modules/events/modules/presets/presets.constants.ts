import { EventFilterCombinator } from "../filters/event-filter-combinator.entities";
import { TAG_OPERATORS } from "../filters/event-filter-fields.constants";

import type { Preset, PresetRule } from "./presets.types";

// ♟️ Constants

/** Preset the calendar opens on when its link names none. */
export const DEFAULT_PRESET_ID = "highlights";

/** Tags a Moon-free preset drops, since lunar aspects change often. */
const WITHOUT_THE_MOON: PresetRule = {
  operator: TAG_OPERATORS.isNoneOf,
  paths: ["Moon"],
  root: "Planet",
};

/** Long cycles, few enough to read without a filter. */
const LONG_CYCLES: PresetRule = {
  operator: TAG_OPERATORS.isAnyOf,
  paths: [
    "Direction",
    "Planetary Phase",
    "Eclipse",
    "Cycle / Monthly Lunar Cycle",
    "Cycle / Annual Solar Cycle",
    "Cycle / Lunar Apsides",
  ],
  root: "Type",
};

/** Presets in menu order; missing tags are skipped, not fatal. */
export const PRESETS: readonly Preset[] = [
  {
    description:
      "Major aspects between the planets, sign ingresses, stations, eclipses and the long cycles, without the Moon's fast changes. About ten events a day.",
    filter: {
      combinator: EventFilterCombinator.OR,
      rules: [
        {
          combinator: EventFilterCombinator.AND,
          rules: [
            {
              operator: TAG_OPERATORS.isAnyOf,
              paths: [
                "Aspect / Simple Aspect / Major Aspect",
                "Ingress / Sign Ingress",
              ],
              root: "Type",
            },
            WITHOUT_THE_MOON,
          ],
        },
        LONG_CYCLES,
      ],
    },
    id: DEFAULT_PRESET_ID,
    name: "Highlights",
  },
  {
    description:
      "Conjunctions, sextiles, squares, trines and oppositions between planets, without the Moon.",
    filter: {
      combinator: EventFilterCombinator.AND,
      rules: [
        {
          operator: TAG_OPERATORS.isAnyOf,
          paths: ["Aspect / Simple Aspect / Major Aspect"],
          root: "Type",
        },
        WITHOUT_THE_MOON,
      ],
    },
    id: "major-aspects",
    name: "Major aspects",
  },
  {
    description:
      "Every aspect, minor and specialty ones included, leaving out the Moon since it changes so frequently.",
    filter: {
      combinator: EventFilterCombinator.AND,
      rules: [
        {
          operator: TAG_OPERATORS.isAnyOf,
          paths: ["Aspect"],
          root: "Type",
        },
        WITHOUT_THE_MOON,
      ],
    },
    id: "aspects-without-the-moon",
    name: "Aspects without the Moon",
  },
  {
    description:
      "Aspects among three or more bodies: grand trines, T-squares, yods, kites, grand crosses and stelliums.",
    filter: {
      combinator: EventFilterCombinator.AND,
      rules: [
        {
          operator: TAG_OPERATORS.isAnyOf,
          paths: ["Aspect / Compound Aspect"],
          root: "Type",
        },
        WITHOUT_THE_MOON,
      ],
    },
    id: "aspect-patterns",
    name: "Aspect patterns",
  },
  {
    description:
      "A planet entering a sign, a decan, or the peak of a sign: the ingresses and the transits between them.",
    filter: {
      combinator: EventFilterCombinator.AND,
      rules: [
        {
          operator: TAG_OPERATORS.isAnyOf,
          paths: ["Ingress"],
          root: "Type",
        },
      ],
    },
    id: "planet-sign-events",
    name: "Planet-sign events",
  },
  {
    description:
      "Directions, planetary phases, eclipses, and the monthly lunar, annual solar and apsis cycles.",
    filter: { combinator: EventFilterCombinator.AND, rules: [LONG_CYCLES] },
    id: "planetary-cycles",
    name: "Planetary cycles",
  },
  {
    description:
      "The Sun's and Moon's days: sunrise, transit and set, moonrise, and the twilights around them.",
    filter: {
      combinator: EventFilterCombinator.AND,
      rules: [
        {
          operator: TAG_OPERATORS.isAnyOf,
          paths: [
            "Cycle / Daily Solar Cycle",
            "Cycle / Daily Lunar Cycle",
            "Twilight",
          ],
          root: "Type",
        },
      ],
    },
    id: "daily-cycles",
    name: "Daily cycles",
  },
];
