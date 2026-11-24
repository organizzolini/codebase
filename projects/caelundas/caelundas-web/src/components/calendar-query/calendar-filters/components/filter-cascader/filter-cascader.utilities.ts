import { flattenFilterRules } from "@codebase/presentation";

import { describeTagOption } from "../event-filter-model/event-filter-fields.utilities";

import {
  COMBINATOR,
  OPTION_DEPTH,
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
 * The attributes to filter by, each with the values it takes beneath it.
 */
export function createFilterItems(
  fields: readonly EventFilterField[],
): CascaderNode[] {
  const items: CascaderNode[] = [];

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const field of listPickFields(fields)) {
    items.push({
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

  return items;
}

/**
 * Whether a row is a value that can be ticked, not an attribute, which only opens.
 */
export function isValue(node: CascaderNode): boolean {
  return !node.value.startsWith(`field${VALUE_SEPARATOR}`);
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
 * What to tick for a filter: each value a rule picking among a field's values holds.
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
      for (const picked of rule.value) {
        value.push(`${field.id}${VALUE_SEPARATOR}${String(picked)}`);
      }
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
  const description = describeTagOption(option);

  return {
    ...(description === undefined ? {} : { description }),
    ...(option.icon === undefined ? {} : { icon: option.icon }),
    ...(option.keywords === undefined ? {} : { keywords: option.keywords }),
    label: option.label,
    value: `${field.id}${VALUE_SEPARATOR}${option.value}`,
  };
}
