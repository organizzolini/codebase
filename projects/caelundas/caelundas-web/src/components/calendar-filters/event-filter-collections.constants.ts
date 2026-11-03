import { TAG_OPERATORS } from "./event-filters.constants";

import type {
  CollectionRule,
  EventFilterCollection,
} from "./event-filter-collections.types";

// ♟️ Constants

/**
 * The id of the collection the calendar opens on when its link names no
 * filter.
 */
export const DEFAULT_EVENT_FILTER_COLLECTION_ID = "highlights";

/**
 * The tags a "without the Moon" collection leaves out: every event the Moon
 * is part of, whose aspects change several times a day.
 */
const WITHOUT_THE_MOON: CollectionRule = {
  operator: TAG_OPERATORS.isNoneOf,
  paths: ["Moon"],
  root: "Planet",
};

/**
 * The long cycles, which are few enough to read without a filter on them.
 */
const LONG_CYCLES: CollectionRule = {
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

/**
 * The collections the calendar offers, in the order its menu lists them. A
 * collection that names tags the data lacks applies to the ones it has.
 */
export const EVENT_FILTER_COLLECTIONS: readonly EventFilterCollection[] = [
  {
    description:
      "Major aspects between the planets, sign ingresses, stations, eclipses and the long cycles, without the Moon's fast changes. About ten events a day.",
    filter: {
      combinator: "or",
      rules: [
        {
          combinator: "and",
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
    id: DEFAULT_EVENT_FILTER_COLLECTION_ID,
    name: "Highlights",
  },
  {
    description:
      "Conjunctions, sextiles, squares, trines and oppositions between planets, without the Moon.",
    filter: {
      combinator: "and",
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
      combinator: "and",
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
      combinator: "and",
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
      combinator: "and",
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
    filter: { combinator: "and", rules: [LONG_CYCLES] },
    id: "planetary-cycles",
    name: "Planetary cycles",
  },
  {
    description:
      "The Sun's and Moon's days: sunrise, transit and set, moonrise, and the twilights around them.",
    filter: {
      combinator: "and",
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
