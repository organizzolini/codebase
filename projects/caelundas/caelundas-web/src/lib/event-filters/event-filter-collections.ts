import { TAG_FIELD_PREFIX, TAG_OPERATORS } from "./event-filters.constants";

import type { EventFacet } from "../events-database/events-database.types";
import type { EventFilterNode, EventFilterQuery } from "./event-filters.types";

// 🔖 Type

/**
 * A named set of filters the calendar applies in one step.
 */
export interface EventFilterCollection {
  description: string;
  /**
   * The conditions, written by tag names rather than ids, so the collection
   * does not depend on the database it is applied to.
   */
  filter: CollectionGroup;
  id: string;
  name: string;
}

/**
 * A collection with its names resolved to the tags of one database.
 */
export interface ResolvedEventFilterCollection {
  description: string;
  filter: EventFilterQuery;
  id: string;
  name: string;
}

/**
 * Conditions joined under one combinator, nested groups included.
 */
interface CollectionGroup {
  combinator: "and" | "or";
  rules: readonly (CollectionGroup | CollectionRule)[];
}

/**
 * Keeps, or with `is_none_of` drops, the events carrying any of the tags
 * whose paths beneath a root are listed, each path written as the tag names
 * joined by " / ".
 */
interface CollectionRule {
  operator: typeof TAG_OPERATORS.isAnyOf | typeof TAG_OPERATORS.isNoneOf;
  paths: readonly string[];
  root: string;
}

// 🔖 Constants

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
    "Station",
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
      "Stations, planetary phases, eclipses, and the monthly lunar, annual solar and apsis cycles.",
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

// 🧩 Functions

/**
 * Where a group sits in a collection and what it is resolved against, which
 * also gives each node of the tree it builds an id.
 */
interface ResolveContext {
  collectionId: string;
  facets: readonly EventFacet[];
  position: string;
}

/**
 * Resolves one collection against a database's tags, answering `null` when
 * none of the tags it names exist there.
 */
export function resolveEventFilterCollection(
  collection: EventFilterCollection,
  facets: readonly EventFacet[],
): null | ResolvedEventFilterCollection {
  const filter = resolveGroup(collection.filter, {
    collectionId: collection.id,
    facets,
    position: "0",
  });

  if (filter === null) {
    return null;
  }

  return {
    description: collection.description,
    filter,
    id: collection.id,
    name: collection.name,
  };
}

/**
 * Resolves every collection the database's tags can serve, in menu order.
 */
export function resolveEventFilterCollections(
  facets: readonly EventFacet[],
): ResolvedEventFilterCollection[] {
  const resolved: ResolvedEventFilterCollection[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const collection of EVENT_FILTER_COLLECTIONS) {
    const next = resolveEventFilterCollection(collection, facets);

    if (next !== null) {
      resolved.push(next);
    }
  }

  return resolved;
}

/**
 * Resolves a group's rules and nested groups, leaving out any that name no
 * tag the data has and any group left with nothing in it.
 */
function resolveGroup(
  group: CollectionGroup,
  context: ResolveContext,
): EventFilterQuery | null {
  const { collectionId, facets, position } = context;
  const rules: EventFilterNode[] = [];
  let dropped = false;

  for (const [index, node] of group.rules.entries()) {
    const next =
      "combinator" in node
        ? resolveGroup(node, {
            collectionId,
            facets,
            position: `${position}-${String(index)}`,
          })
        : resolveRule(
            node,
            facets,
            `${collectionId}-${position}-${String(index)}`,
          );

    if (next === null) {
      dropped = true;
    } else {
      rules.push(next);
    }
  }

  // An "and" with a condition missing would keep more than it was written
  // to, so it is left out whole; an "or" simply offers what is there.
  if (rules.length === 0 || (dropped && group.combinator === "and")) {
    return null;
  }

  return {
    combinator: group.combinator,
    id: `${collectionId}-${position}`,
    rules,
    type: "group",
  };
}

/**
 * Resolves one rule to the tags of the data that its paths name, or `null`
 * when the data has no such root or none of the paths.
 */
function resolveRule(
  rule: CollectionRule,
  facets: readonly EventFacet[],
  id: string,
): EventFilterNode | null {
  let facet: EventFacet | undefined;
  const tagIds: string[] = [];

  for (const candidate of facets) {
    if (candidate.name === rule.root) {
      facet = candidate;
      break;
    }
  }

  for (const value of facet?.values ?? []) {
    if (rule.paths.includes(value.path)) {
      tagIds.push(value.id);
    }
  }

  if (facet === undefined || tagIds.length === 0) {
    return null;
  }

  return {
    id,
    operator: rule.operator,
    path: [`${TAG_FIELD_PREFIX}${facet.id}`],
    type: "rule",
    value: tagIds,
  };
}
