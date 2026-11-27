import { TAG_OPERATORS } from "../filtering/modules/query-building/event-filter-fields.constants";
import { EventFilterCombinator } from "../filtering/modules/rules/event-filter-combinator.entities";

import type { Preset, PresetGroup, PresetRule } from "./presets.types";

// ♟️ Constants

/** Preset the calendar opens on when its link names none. */
export const DEFAULT_PRESET_ID = "highlights";

/** Tags a Moon-free preset drops, since lunar aspects change often. */
const WITHOUT_THE_MOON: PresetRule = {
  operator: TAG_OPERATORS.isNoneOf,
  paths: ["Luminary / Moon"],
  root: "Body",
};

/** Long cycles, few enough to read without a filter, across four roots. */
const LONG_CYCLES: PresetGroup = {
  combinator: EventFilterCombinator.OR,
  rules: [
    {
      operator: TAG_OPERATORS.isAnyOf,
      paths: ["Direction", "Phase"],
      root: "Planetary",
    },
    {
      operator: TAG_OPERATORS.isAnyOf,
      paths: ["Solar", "Lunar"],
      root: "Eclipse",
    },
    {
      operator: TAG_OPERATORS.isAnyOf,
      paths: ["Monthly Cycle", "Apsides"],
      root: "Lunar",
    },
    {
      operator: TAG_OPERATORS.isAnyOf,
      paths: ["Annual Cycle"],
      root: "Solar",
    },
  ],
};

/** Major aspects, as a rule. */
const MAJOR_ASPECTS: PresetRule = {
  operator: TAG_OPERATORS.isAnyOf,
  paths: ["Simple / Major"],
  root: "Aspect",
};

/** Sign ingresses, as a rule. */
const SIGN_INGRESSES: PresetRule = {
  operator: TAG_OPERATORS.isAnyOf,
  paths: ["Ingress / Sign Ingress"],
  root: "Sign",
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
          rules: [MAJOR_ASPECTS, WITHOUT_THE_MOON],
        },
        {
          combinator: EventFilterCombinator.AND,
          rules: [SIGN_INGRESSES, WITHOUT_THE_MOON],
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
      rules: [MAJOR_ASPECTS, WITHOUT_THE_MOON],
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
          paths: ["Simple", "Compound"],
          root: "Aspect",
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
          paths: ["Compound"],
          root: "Aspect",
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
          root: "Sign",
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
          paths: ["Solar Cycle", "Lunar Cycle", "Twilight"],
          root: "Daily",
        },
      ],
    },
    id: "daily-cycles",
    name: "Daily cycles",
  },
];
