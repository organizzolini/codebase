import { createTagOptions } from "../event-filters/event-filter-fields";
import { TAG_FIELD_PREFIX } from "../event-filters/event-filters.constants";

import {
  DERIVED_GROUP_LABELS,
  DERIVED_GROUP_ORDER,
  MAXIMUM_GROUP_LEVELS,
} from "./event-groups.constants";

import type { EventFacet } from "../events-database/events-database.types";
import type {
  DerivedGroupId,
  EventGroupField,
  EventGrouping,
  EventGroupLevel,
} from "./event-groups.types";

/**
 * The tag roots, by name, a view groups by when the link names no grouping:
 * the agenda by type, the timeline by type and then planet.
 */
const DEFAULT_GROUP_ROOTS = {
  agenda: ["Type"],
  timeline: ["Type", "Planet"],
} as const;

/**
 * The fields the events can be grouped by: one per tag root, in the facets'
 * order, then the periods and the duration derived from each event.
 */
export function createEventGroupFields(
  facets: readonly EventFacet[],
): EventGroupField[] {
  const tagFields: EventGroupField[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const facet of facets) {
    const levels: string[][] = [];

    for (const value of facet.values) {
      const names = levels[value.depth - 1] ?? [];

      names.push(value.name);
      levels[value.depth - 1] = names;
    }

    tagFields.push({
      id: `${TAG_FIELD_PREFIX}${facet.id}`,
      label: facet.name,
      levels: levels.map((names) => [...new Set(names)]),
      options: createTagOptions(facet),
    });
  }

  const derivedFields = DERIVED_GROUP_ORDER.map((id) => ({
    id,
    label: DERIVED_GROUP_LABELS[id],
    levels: [],
    options: [],
  }));

  return [...tagFields, ...derivedFields];
}

/**
 * The grouping a view starts with when the link names none, built from
 * whichever of its default roots the data has; views other than the agenda
 * and the timeline are never grouped.
 */
export function getDefaultGrouping(
  view: string,
  fields: readonly EventGroupField[],
): EventGrouping {
  const roots: readonly string[] =
    view === "agenda" || view === "timeline" ? DEFAULT_GROUP_ROOTS[view] : [];

  return roots.flatMap((root) => {
    const field = fields.find(
      (candidate) =>
        candidate.label === root && candidate.id.startsWith(TAG_FIELD_PREFIX),
    );

    return field === undefined ? [] : [{ depth: 1, field: field.id }];
  });
}

/**
 * Whether a field id names one of the derived fields.
 */
export function isDerivedGroupId(id: string): id is DerivedGroupId {
  return (DERIVED_GROUP_ORDER as readonly string[]).includes(id);
}

/**
 * Keeps the levels of a grouping that name a field the data has, at most
 * {@link MAXIMUM_GROUP_LEVELS} of them, each field once. A tag level keeps the
 * tags it picks that the root still has, or with none its depth brought within
 * the root's tree; a derived level keeps neither, so a stale link groups by
 * what still exists rather than failing.
 */
export function resolveEventGrouping(
  grouping: EventGrouping,
  fields: readonly EventGroupField[],
): EventGroupLevel[] {
  const resolved: EventGroupLevel[] = [];

  for (const level of grouping) {
    const field = fields.find((candidate) => candidate.id === level.field);

    if (
      field !== undefined &&
      resolved.length < MAXIMUM_GROUP_LEVELS &&
      !resolved.some((kept) => kept.field === field.id)
    ) {
      resolved.push(resolveLevel(level, field));
    }
  }

  return resolved;
}

/**
 * Brings one level within its field: a derived field takes no options, and a
 * tag field takes the picked tags it has or else a depth within its tree.
 */
function resolveLevel(
  level: EventGroupLevel,
  field: EventGroupField,
): EventGroupLevel {
  if (field.levels.length === 0) {
    return { field: field.id };
  }

  const known = new Set(field.options.map((option) => option.value));
  const tags = [...new Set(level.tags)].filter((tag) => known.has(tag));

  return tags.length > 0
    ? { field: field.id, tags }
    : {
        depth: Math.min(Math.max(level.depth ?? 1, 1), field.levels.length),
        field: field.id,
      };
}
