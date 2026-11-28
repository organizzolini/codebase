import { flattenFilterRules } from "@codebase/presentation";

import { isOfferedRow } from "../../../calendar-group-strip/calendar-group-strip-items.utilities";
import { SHARED_SEPARATOR } from "../../../calendar-group-strip/calendar-group-strip.constants";
import { createTagParent } from "../../../calendar-group-strip/calendar-group-strip.utilities";
import {
  TAG_ALSO_UNDER,
  TAG_FOLDER,
} from "../../../filter-tag-editor/filter-tag-editor.constants";
import { describeTagOption } from "../event-filter-model/event-filter-fields.utilities";
import { TAG_FIELD_PREFIX } from "../event-filter-model/event-filters.constants";

import {
  COMBINATOR,
  OPTION_DEPTH,
  TAG_PARENT_VALUE,
  VALUE_SEPARATOR,
} from "./filter-cascader.constants";

import type {
  EventFilterField,
  EventFilterQuery,
  EventFilterRule,
} from "../event-filter-model/event-filters.types";
import type { CascaderNode, FilterOption } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * The attributes to filter by, each with the values it takes beneath it; the tag roots sit under a Tag row.
 */
export function createFilterItems(
  fields: readonly EventFilterField[],
): CascaderNode[] {
  const roots: CascaderNode[] = [];
  const others: CascaderNode[] = [];

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const field of listPickFields(fields)) {
    (field.id.startsWith(TAG_FIELD_PREFIX) ? roots : others).push({
      children: nestOptions(field, field.options ?? []),
      ...(field.description === undefined
        ? {}
        : { description: field.description }),
      ...(field.icon === undefined ? {} : { icon: field.icon }),
      keywords: [field.label],
      label: field.label,
      value: `field${VALUE_SEPARATOR}${field.id}`,
    });
  }

  return roots.length === 0
    ? others
    : [{ ...createTagParent(roots), value: TAG_PARENT_VALUE }, ...others];
}

/**
 * Whether a row is a value that can be ticked, not an attribute or a folder, which only open.
 */
export function isValue(node: CascaderNode): boolean {
  return (
    !node.value.startsWith(`field${VALUE_SEPARATOR}`) && isOfferedRow(node)
  );
}

// 🌎 Public Functions

/** The filter ticked values mean: one rule per field with picks, all must hold, after the rules the list does not edit. */
export function toFilterQuery(
  ticked: readonly string[],
  fields: readonly EventFilterField[],
  query: EventFilterQuery,
): EventFilterQuery {
  const pickFields = listPickFields(fields);
  const kept: EventFilterRule[] = [];
  const picked: EventFilterRule[] = [];

  for (const rule of flattenFilterRules(query)) {
    const isPicked = pickFields.some(
      (field) =>
        field.id === rule.path[0] && field.defaultOperator === rule.operator,
    );

    if (!isPicked) {
      kept.push(rule);
    }
  }

  for (const field of pickFields) {
    const prefix = `${field.id}${VALUE_SEPARATOR}`;
    const values = ticked
      .filter((leaf) => leaf.startsWith(prefix))
      .map((leaf) => leaf.slice(prefix.length));

    if (values.length > 0) {
      picked.push({
        id: `${field.id}-picked`,
        operator: field.defaultOperator ?? "",
        path: [field.id],
        type: "rule",
        value: values,
      });
    }
  }

  return {
    combinator: COMBINATOR,
    id: query.id,
    rules: [...kept, ...picked],
    type: "group",
  };
}

/**
 * What to tick for a filter: each value its rules pick, every row of a tag under several parents.
 */
export function toFilterValue(
  fields: readonly EventFilterField[],
  query: EventFilterQuery,
): string[] {
  const value: string[] = [];

  for (const rule of flattenFilterRules(query)) {
    const field = listPickFields(fields).find(
      (candidate) =>
        candidate.id === rule.path[0] &&
        candidate.defaultOperator === rule.operator,
    );

    if (field !== undefined && Array.isArray(rule.value)) {
      value.push(...toPickedValues(field, rule.value.map(String)));
    }
  }

  return value;
}

/**
 * The fields a list can filter by: those that pick among a set of values.
 */
function listPickFields(
  fields: readonly EventFilterField[],
): EventFilterField[] {
  return fields.filter(
    (field) => field.type === "multiselect" && field.options !== undefined,
  );
}

/**
 * A field's values as nodes, nested by depth where they carry one, such as a tag root's tags.
 */
function nestOptions(
  field: EventFilterField,
  options: readonly FilterOption[],
): CascaderNode[] {
  const roots: CascaderNode[] = [];
  // The last node seen at each depth, which the next one deeper joins.
  const parents: CascaderNode[] = [];

  for (const option of options) {
    const depth = OPTION_DEPTH.safeParse(option.data).data?.depth ?? 0;
    const node = toCascaderNode(field, option);
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

/**
 * One option as a node: its note and count beneath its name, its icon and keywords, and its value under the field's.
 */
function toCascaderNode(
  field: EventFilterField,
  option: FilterOption,
): CascaderNode {
  const description = describeTagOption(option) ?? option.description;
  const isFolder = TAG_FOLDER.safeParse(option.data).data?.folder === true;

  return {
    ...(isFolder ? { data: { folder: true } } : {}),
    ...(description === undefined ? {} : { description }),
    ...(option.icon === undefined ? {} : { icon: option.icon }),
    ...(option.keywords === undefined ? {} : { keywords: option.keywords }),
    label: option.label,
    value: toRowValue(field, option),
  };
}

/**
 * The rows to tick for a field's picked tags: every row of each, a bare value for one no row lists.
 */
function toPickedValues(
  field: EventFilterField,
  picked: readonly string[],
): string[] {
  const rows = new Set<string>();
  const values: string[] = [];

  for (const option of field.options ?? []) {
    if (picked.includes(option.value)) {
      rows.add(option.value);
      values.push(toRowValue(field, option));
    }
  }

  for (const id of picked) {
    if (!rows.has(id)) {
      values.push(`${field.id}${VALUE_SEPARATOR}${id}`);
    }
  }

  return values;
}

/**
 * One row's value: the field and tag ids, plus the path for a tag under several parents.
 */
function toRowValue(field: EventFilterField, option: FilterOption): string {
  const shared =
    (TAG_ALSO_UNDER.safeParse(option.data).data?.alsoUnder ?? []).length > 0;
  const path = option.keywords?.[1];

  return `${field.id}${VALUE_SEPARATOR}${option.value}${
    shared && path !== undefined ? `${SHARED_SEPARATOR}${path}` : ""
  }`;
}
