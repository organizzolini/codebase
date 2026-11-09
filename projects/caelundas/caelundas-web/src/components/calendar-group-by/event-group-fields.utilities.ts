import {
  createTagOptions,
  describeRoot,
} from "../calendar-filters/event-filter-fields.utilities";
import { TAG_FIELD_PREFIX } from "../calendar-filters/event-filters.constants";

import { DEFAULT_GROUP_ROOTS } from "./event-group-fields.constants";
import {
  DERIVED_GROUP_DESCRIPTIONS,
  DERIVED_GROUP_LABELS,
  DERIVED_GROUP_ORDER,
  MAXIMUM_GROUP_LEVELS,
} from "./event-groups.constants";

import type { EventFacet } from "../events-calendar/calendar-records.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupLevel,
} from "./event-groups.types";

/**
 * The fields events group by: one per tag root in facet order, then the periods and duration derived from each event.
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
      description: describeRoot(facet),
      id: `${TAG_FIELD_PREFIX}${facet.id}`,
      label: facet.name,
      levels: levels.map((names) => [...new Set(names)]),
      options: createTagOptions(facet),
    });
  }

  const derivedFields = DERIVED_GROUP_ORDER.map((id) => ({
    description: DERIVED_GROUP_DESCRIPTIONS[id],
    id,
    label: DERIVED_GROUP_LABELS[id],
    levels: [],
    options: [],
  }));

  return [...tagFields, ...derivedFields];
}

/**
 * The grouping a view starts with when the link names none, from its default roots the data has; only agenda and timeline are grouped.
 */
export function getDefaultGrouping(
  view: string,
  fields: readonly EventGroupField[],
): EventGrouping {
  const roots: readonly string[] =
    view === "agenda" || view === "timeline" ? DEFAULT_GROUP_ROOTS[view] : [];

  const grouping: EventGroupLevel[] = [];

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const root of roots) {
    for (const field of fields) {
      if (field.label === root && field.id.startsWith(TAG_FIELD_PREFIX)) {
        grouping.push({ depth: 1, field: field.id });
        break;
      }
    }
  }

  return grouping;
}

/**
 * Keeps the levels naming a field the data has, at most {@link MAXIMUM_GROUP_LEVELS} and each field once.
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
 * A field's first level: a tag root's children, or the derived value.
 */
export function toGroupLevel(field: EventGroupField): EventGroupLevel {
  return field.levels.length === 0
    ? { field: field.id }
    : { depth: 1, field: field.id };
}

/**
 * Brings one level within its field: a derived field takes no options, a tag field takes its picked tags or a depth.
 */
function resolveLevel(
  level: EventGroupLevel,
  field: EventGroupField,
): EventGroupLevel {
  if (field.levels.length === 0) {
    return { field: field.id };
  }

  const known = new Set<string>();

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const option of field.options) {
    known.add(option.value);
  }

  const tags: string[] = [];

  for (const tag of new Set(level.tags)) {
    if (known.has(tag)) {
      tags.push(tag);
    }
  }

  return tags.length > 0
    ? { field: field.id, tags }
    : {
        depth: Math.min(Math.max(level.depth ?? 1, 1), field.levels.length),
        field: field.id,
      };
}
