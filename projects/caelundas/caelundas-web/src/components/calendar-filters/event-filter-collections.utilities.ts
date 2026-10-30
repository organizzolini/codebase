import { EVENT_FILTER_COLLECTIONS } from "./event-filter-collections.constants";
import { TAG_FIELD_PREFIX } from "./event-filters.constants";

import type { EventFacet } from "../events-calendar/events-database.types";
import type {
  CollectionGroup,
  CollectionRule,
  EventFilterCollection,
  ResolveContext,
  ResolvedEventFilterCollection,
} from "./event-filter-collections.types";
import type { EventFilterNode, EventFilterQuery } from "./event-filters.types";

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
    // Resolved here rather than through `resolveEventFilterCollection`, which
    // would be one more call on every stack beneath.
    const filter = resolveGroup(collection.filter, {
      collectionId: collection.id,
      facets,
      position: "0",
    });

    if (filter !== null) {
      resolved.push({
        description: collection.description,
        filter,
        id: collection.id,
        name: collection.name,
      });
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

  // Loops rather than callbacks, which would add a frame beneath every
  // collection's call stack.
  for (const candidate of facets) {
    if (candidate.name === rule.root) {
      facet = candidate;
      break;
    }
  }

  if (facet === undefined) {
    return null;
  }

  const tagIds: string[] = [];

  for (const value of facet.values) {
    if (rule.paths.includes(value.path)) {
      tagIds.push(value.id);
    }
  }

  if (tagIds.length === 0) {
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
