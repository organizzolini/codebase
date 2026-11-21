import { toGroupLevel } from "../calendar-group-by/components/event-group-model/event-group-fields.utilities";
import { MAXIMUM_GROUP_LEVELS } from "../calendar-group-by/components/event-group-model/event-groups.constants";
import { describeTags } from "../calendar-group-by/components/group-level-row/group-level-row.utilities";

import { TAG_DEPTH } from "./calendar-group-strip.constants";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../calendar-group-by/components/event-group-model/event-groups.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * The nested choices: each field, with a tag root's tags beneath it.
 */
export function createGroupItems(
  fields: readonly EventGroupField[],
): CascaderNode[] {
  return fields.map((field) => {
    const children = nestOptions(field);

    return {
      ...(children.length === 0 ? {} : { children }),
      description: field.description,
      keywords: [field.label],
      label: field.label,
      value: field.id,
    };
  });
}

// 🌎 Public Functions

/**
 * The name a level's chip shows: its field's label, or the field's id when the data no longer has it, then the tags it goes by when it goes by some.
 */
export function labelGroupLevel(
  level: EventGroupLevel,
  fields: readonly EventGroupField[],
): string {
  const field = fields.find((candidate) => candidate.id === level.field);
  const label = field?.label ?? level.field;

  return field !== undefined && (level.tags ?? []).length > 0
    ? `${label}: ${describeTags(field, level)}`
    : label;
}

/**
 * The grouping a set of ticked values means: the levels already there stay in place, new ones follow in field order, up to the most there can be.
 */
export function toGrouping(
  value: readonly string[],
  grouping: readonly EventGroupLevel[],
  fields: readonly EventGroupField[],
): EventGroupLevel[] {
  const ticked = new Set(value);
  const levels = new Map<string, EventGroupLevel>();

  for (const field of fields) {
    const tags = field.options
      .map((option) => option.value)
      .filter((tag) => ticked.has(tag));

    if (field.options.length === 0) {
      if (ticked.has(field.id)) {
        levels.set(field.id, toGroupLevel(field));
      }
    } else if (ticked.has(field.id) || tags.length === field.options.length) {
      levels.set(field.id, toGroupLevel(field));
    } else if (tags.length > 0) {
      levels.set(field.id, { field: field.id, tags });
    }
  }

  const kept = grouping.flatMap((level) => levels.get(level.field) ?? []);
  const added = [...levels.values()].filter(
    (level) => !grouping.some((existing) => existing.field === level.field),
  );

  return [...kept, ...added].slice(0, MAXIMUM_GROUP_LEVELS);
}

/**
 * The values ticked for a grouping: a field alone, or a tag root with the tags it goes by, every one when it goes by its first level.
 */
export function toGroupValue(
  grouping: readonly EventGroupLevel[],
  fields: readonly EventGroupField[],
): string[] {
  const value: string[] = [];

  for (const level of grouping) {
    const field = fields.find((candidate) => candidate.id === level.field);
    const tags = field?.options.map((option) => option.value) ?? [];

    value.push(
      level.field,
      ...((level.tags ?? []).length > 0 ? (level.tags ?? []) : tags),
    );
  }

  return value;
}

/**
 * Nests a tag root's tags, which come depth first with their depth beneath the root, under the tag above each.
 */
function nestOptions(field: EventGroupField): CascaderNode[] {
  const roots: CascaderNode[] = [];
  // The last node seen at each depth, which the next one deeper joins.
  const parents: CascaderNode[] = [];

  for (const option of field.options) {
    const depth = TAG_DEPTH.safeParse(option.data).data?.depth ?? 0;
    const node: CascaderNode = {
      ...(option.description === undefined
        ? {}
        : { description: option.description }),
      ...(option.keywords === undefined ? {} : { keywords: option.keywords }),
      label: option.label,
      value: option.value,
    };
    const parent = parents[depth - 1];

    if (parent === undefined) {
      roots.push(node);
    } else {
      parent.children = [...(parent.children ?? []), node];
    }

    parents[depth] = node;
    parents.length = depth + 1;
  }

  return roots;
}
