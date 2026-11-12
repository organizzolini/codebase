import type { EventFacetEntity } from "../event-facet.entities";
import type { EventFilterCombinator } from "../filters/event-filter-combinator.entities";
import type { TAG_OPERATORS } from "../filters/event-filter-fields.constants";
import type { EventFilterGroupEntity } from "../filters/event-filter.entities";

/** A named filter set, written by tag names, not ids. */
export interface Preset {
  description: string;
  filter: PresetGroup;
  id: string;
  name: string;
}

/**
 * Conditions joined under one combinator, nested groups included.
 */
export interface PresetGroup {
  combinator: EventFilterCombinator;
  rules: readonly (PresetGroup | PresetRule)[];
}

/** Events tagged with a listed tag path; is_none_of negates. */
export interface PresetRule {
  operator: typeof TAG_OPERATORS.isAnyOf | typeof TAG_OPERATORS.isNoneOf;
  paths: readonly string[];
  root: string;
}

/**
 * What a group is resolved against.
 */
export interface ResolveContext {
  facets: readonly EventFacetEntity[];
}

/**
 * A preset with its names resolved to the tags of one database.
 */
export interface ResolvedPreset {
  description: string;
  filter: EventFilterGroupEntity;
  id: string;
  name: string;
}
