import { EVENT_FILTER_COLLECTIONS } from "./event-filter-collections.constants";
import { EventFilterCombinator } from "./event-filter-combinator.entities";
import { TAG_FIELD_PREFIX } from "./event-filter-fields.constants";

import type { EventFacetEntity } from "./event-facet.entities";
import type {
  CollectionGroup,
  CollectionRule,
  ResolveContext,
  ResolvedEventFilterCollection,
} from "./event-filter-collections.types";
import type { EventFilterRuleEntity } from "./event-filter-rule.entities";
import type { EventFilterGroupEntity } from "./event-filter.entities";

/**
 * Resolves every collection the data's tags can serve, in menu order, each
 * written by tag ids. A collection none of whose tags the data has is left
 * out, and one that names tags the data lacks applies to the ones it has.
 */
export function resolveEventFilterCollections(
  facets: readonly EventFacetEntity[],
): ResolvedEventFilterCollection[] {
  const resolved: ResolvedEventFilterCollection[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const collection of EVENT_FILTER_COLLECTIONS) {
    const filter = resolveGroup(collection.filter, { facets });

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
): EventFilterGroupEntity | null {
  const groups: EventFilterGroupEntity[] = [];
  const rules: EventFilterRuleEntity[] = [];
  let dropped = false;

  for (const node of group.rules) {
    const next =
      "combinator" in node
        ? resolveGroup(node, context)
        : resolveRule(node, context.facets);

    if (next === null) {
      dropped = true;
    } else if ("combinator" in next) {
      groups.push(next);
    } else {
      rules.push(next);
    }
  }

  // An "and" with a condition missing would keep more than it was written
  // to, so it is left out whole; an "or" simply offers what is there.
  if (
    groups.length + rules.length === 0 ||
    (dropped && group.combinator === EventFilterCombinator.AND)
  ) {
    return null;
  }

  return { combinator: group.combinator, groups, rules };
}

/**
 * Resolves one rule to the tags of the data that its paths name, or `null`
 * when the data has no such root or none of the paths.
 */
function resolveRule(
  rule: CollectionRule,
  facets: readonly EventFacetEntity[],
): EventFilterRuleEntity | null {
  let facet: EventFacetEntity | undefined;

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
    negated: false,
    operator: rule.operator,
    path: [`${TAG_FIELD_PREFIX}${facet.id}`],
    values: tagIds,
  };
}
