import type { EventFacetEntity } from "./event-facet.entities";
import type { EventFilterCombinator } from "./event-filter-combinator.entities";
import type { TAG_OPERATORS } from "./event-filter-fields.constants";
import type { EventFilterGroupEntity } from "./event-filter.entities";

/**
 * Conditions joined under one combinator, nested groups included.
 */
export interface CollectionGroup {
  combinator: EventFilterCombinator;
  rules: readonly (CollectionGroup | CollectionRule)[];
}

/**
 * Keeps events carrying any listed tag path under a root, or drops them for
 * `is_none_of`. Paths join tag names with " / ".
 */
export interface CollectionRule {
  operator: typeof TAG_OPERATORS.isAnyOf | typeof TAG_OPERATORS.isNoneOf;
  paths: readonly string[];
  root: string;
}

/**
 * A named set of filters applied in one step, written by tag names so it
 * works on any database.
 */
export interface EventFilterCollection {
  description: string;
  filter: CollectionGroup;
  id: string;
  name: string;
}

/**
 * What a group is resolved against.
 */
export interface ResolveContext {
  facets: readonly EventFacetEntity[];
}

/**
 * A collection with its names resolved to the tags of one database.
 */
export interface ResolvedEventFilterCollection {
  description: string;
  filter: EventFilterGroupEntity;
  id: string;
  name: string;
}
