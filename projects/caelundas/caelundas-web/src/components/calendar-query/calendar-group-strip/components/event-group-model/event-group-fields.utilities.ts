import { createElement } from "react";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";
import {
  createRootIcon,
  createTagOptions,
  describeRoot,
  listOfferedValues,
} from "../../../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { TAG_FIELD_PREFIX } from "../../../calendar-filters/components/event-filter-model/event-filters.constants";
import { readDepth } from "../../../filter-tag-editor/event-filter-tag-tree.utilities";
import { TagIcon } from "../../../tag-icon/tag-icon";

import { ALL_MENUS, ALL_TAGS_FIELD } from "./event-group-fields.constants";
import {
  DERIVED_GROUP_DESCRIPTIONS,
  DERIVED_GROUP_ICONS,
  DERIVED_GROUP_LABELS,
  DERIVED_GROUP_ORDER,
} from "./event-groups.constants";

import type {
  EventFacet,
  EventFacetValue,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupLevel,
  GroupNodeOption,
  ResolvedGroupLevel,
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
      icon: createRootIcon(facet),
      id: `${TAG_FIELD_PREFIX}${facet.id}`,
      label: facet.name,
      levels: levels.map((names) => [...new Set(names)]),
      menus: {
        isFilterable: facet.isFilterable !== false,
        isGroupable: facet.isGroupable !== false,
        isSelectable: facet.isSelectable !== false,
        isSortable: facet.isSortable !== false,
      },
      nodes: listGroupNodes(facet.values),
      options: createTagOptions(facet, listOfferedValues(facet.values)),
      values: facet.values,
    });
  }

  const derivedFields = DERIVED_GROUP_ORDER.map((id) => ({
    description: DERIVED_GROUP_DESCRIPTIONS[id],
    icon: createElement(TagIcon, { name: DERIVED_GROUP_ICONS[id] }),
    id,
    label: DERIVED_GROUP_LABELS[id],
    levels: [],
    menus: ALL_MENUS,
    nodes: [],
    options: [],
    values: [],
  }));

  return [...tagFields, ...derivedFields];
}

/**
 * The grouping every view starts with when the link names none: the tag roots, then each depth of tags beneath them.
 */
export function getDefaultGrouping(
  fields: readonly EventGroupField[],
): EventGrouping {
  const roots: string[] = [];
  // The tags at each depth beneath a root, across every root; depth 1 first.
  const beneath: string[][] = [];

  // Loops rather than filter callbacks keep the call stacks shallow.
  for (const field of fields) {
    if (field.id.startsWith(TAG_FIELD_PREFIX)) {
      roots.push(field.id.slice(TAG_FIELD_PREFIX.length));

      for (const option of field.options) {
        const depth = readDepth(option);

        beneath[depth] = [...(beneath[depth] ?? []), option.value];
      }
    }
  }

  if (roots.length === 0) {
    return [];
  }

  const grouping: EventGroupLevel[] = [{ field: ALL_TAGS_FIELD, tags: roots }];

  for (const [index, tags] of beneath.entries()) {
    grouping.push({ depth: index + 1, field: ALL_TAGS_FIELD, tags });
  }

  return grouping;
}

/**
 * Every tag root as a level of its own, in order: what the Group menu ticks while the link names none.
 */
export function getRootGrouping(
  fields: readonly EventGroupField[],
): EventGrouping {
  const grouping: EventGroupLevel[] = [];

  // A loop rather than a filter callback keeps the call stacks shallow.
  for (const field of fields) {
    if (field.id.startsWith(TAG_FIELD_PREFIX)) {
      grouping.push({ field: field.id });
    }
  }

  return grouping;
}

/**
 * Keeps the levels that make sense: a field the data has, repeating only straight after itself one tag deeper.
 */
export function resolveEventGrouping(
  grouping: EventGrouping,
  fields: readonly EventGroupField[],
): EventGroupLevel[] {
  const resolved: EventGroupLevel[] = [];

  for (const level of grouping) {
    const field = fields.find((candidate) => candidate.id === level.field);
    const next = field === undefined ? undefined : resolveLevel(level, field);

    if (next !== undefined && isAllowed(next, resolved)) {
      resolved.push(next.level);
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
 * Whether a level may follow those kept: not a repeat, and a field used before only straight after itself.
 */
function isAllowed(
  next: ResolvedGroupLevel,
  resolved: readonly EventGroupLevel[],
): boolean {
  let used = false;
  // Whether the run of the field ending the kept levels holds a level whose
  // tag the new one sits beneath, siblings included; another field ends a run.
  let refines = false;

  // One loop rather than helpers or callbacks, each of which would count as
  // one more frame.
  for (const kept of resolved) {
    if (kept.field !== next.level.field) {
      refines = false;
      continue;
    }

    used = true;

    if (kept.parent === next.level.parent) {
      return false;
    }

    refines ||= (kept.parent ?? null) === next.above;
  }

  return !used || refines;
}

/**
 * The tags with tags beneath them, from a root's tags in tree order, each with the note and icon to show.
 */
function listGroupNodes(values: readonly EventFacetValue[]): GroupNodeOption[] {
  const nodes: GroupNodeOption[] = [];
  // The last tag seen at each depth, which the next one deeper sits beneath.
  const above: string[] = [];

  for (const [index, value] of values.entries()) {
    above[value.depth] = value.id;

    if ((values[index + 1]?.depth ?? 0) > value.depth) {
      nodes.push({
        count: value.count,
        depth: value.depth,
        icon: createElement(TagLead, {
          icon: value.icon ?? undefined,
          id: value.id,
          label: value.name,
        }),
        id: value.id,
        name: value.name,
        ...(typeof value.note === "string" ? { note: value.note } : {}),
        parentId: above[value.depth - 1] ?? null,
        path: value.path,
      });
    }
  }

  return nodes;
}

/**
 * Brings a level within its field: a derived field takes no parent, a tag field a parent it has.
 */
function resolveLevel(
  level: EventGroupLevel,
  field: EventGroupField,
): ResolvedGroupLevel | undefined {
  if (field.levels.length === 0 || level.parent === undefined) {
    return {
      above: undefined,
      level: {
        field: field.id,
        ...(level.tags === undefined || field.levels.length === 0
          ? {}
          : { tags: level.tags }),
      },
    };
  }

  // A loop rather than a callback, which would count as one more frame.
  for (const node of field.nodes) {
    if (node.id === level.parent) {
      return {
        above: node.parentId,
        level: { field: field.id, parent: level.parent },
      };
    }
  }

  return undefined;
}
