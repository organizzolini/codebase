import type { EventFacet } from "../events-calendar/events-database.types";
import type { TAG_OPERATORS } from "./event-filters.constants";
import type { EventFilterQuery } from "./event-filters.types";

// 🏷️ Types

/**
 * Conditions joined under one combinator, nested groups included.
 */
export interface CollectionGroup {
  combinator: "and" | "or";
  rules: readonly (CollectionGroup | CollectionRule)[];
}

/**
 * Keeps, or with `is_none_of` drops, the events carrying any of the tags
 * whose paths beneath a root are listed, each path written as the tag names
 * joined by " / ".
 */
export interface CollectionRule {
  operator: typeof TAG_OPERATORS.isAnyOf | typeof TAG_OPERATORS.isNoneOf;
  paths: readonly string[];
  root: string;
}

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
 * Where a group sits in a collection and what it is resolved against, which
 * also gives each node of the tree it builds an id.
 */
export interface ResolveContext {
  collectionId: string;
  facets: readonly EventFacet[];
  position: string;
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
