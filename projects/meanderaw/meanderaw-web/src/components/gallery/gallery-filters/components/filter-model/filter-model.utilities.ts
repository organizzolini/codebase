import { isWithinLimits, normalizeRule } from "./filter-limits.utilities";
import {
  OPERATOR_INPUTS,
  OPERATORS_BY_TYPE,
  SHAPE_FILTER_FIELDS,
} from "./filter-model.constants";
import { toRowsRule } from "./filter-rows.utilities";

import type {
  MeanderFilterGroupInput,
  MeanderFilterRuleInput,
} from "../../../../../graphql/generated/operations";
import type { GalleryCharacteristic } from "../../../meander-gallery/meanders-api.types";
import type {
  FilterField,
  FilterFieldType,
  FilterGroup,
  FilterNode,
  FilterRule,
  FilterValue,
  RowsFilter,
} from "./filter-model.types";

// 🔏 Private Functions

/**
 * Counts the rules in a tree, however deeply nested.
 */
export function countRules(group: FilterGroup): number {
  let count = 0;

  for (const node of group.rules) {
    if ("rules" in node) {
      count += countRules(node);
    } else if (isFinished(node)) {
      count += 1;
    }
  }

  return count;
}

/**
 * Builds the picker's fields: the shape fields, then the catalog.
 */
export function createFilterFields(
  characteristics: readonly GalleryCharacteristic[],
): FilterField[] {
  const fields = [...SHAPE_FILTER_FIELDS];

  for (const characteristic of characteristics) {
    fields.push({
      category: characteristic.category,
      description: characteristic.description,
      isInteger: false,
      isPattern: characteristic.isPattern,
      key: characteristic.key,
      label: characteristic.name,
      type: characteristic.valueType === "boolean" ? "boolean" : "number",
      valueCounts: characteristic.valueCounts,
    });
  }

  return fields;
}

// 🌎 Public Functions

/**
 * Drops from a filter a link carried every rule the catalog cannot answer,
 * and the groups that leaves empty; none when nothing is left.
 */
export function sanitizeFilter(
  group: FilterGroup | undefined,
  fields: readonly FilterField[],
): FilterGroup | undefined {
  if (group === undefined) {
    return undefined;
  }

  const clean = pruneGroup({
    ...group,
    rules: keepUsableNodes(group.rules, fields),
  });

  return clean.rules.length === 0 || !isWithinLimits(clean) ? undefined : clean;
}

/**
 * Words the rows rule and the tree as the API's filter argument: the rows
 * rule ANDed with the tree, whatever the tree's own combinator.
 */
export function toFilterInput(
  group: FilterGroup | undefined,
  rows: RowsFilter,
): MeanderFilterGroupInput {
  const tree = toTreeInput(group);

  return {
    combinator: "AND",
    rules: [toRuleInput(toRowsRule(rows))],
    ...(tree !== undefined && { groups: [tree] }),
  };
}

/**
 * Whether every number a rule carries is finite, and whole where the field
 * takes whole numbers only.
 */
function hasSoundNumbers(rule: FilterRule, field: FilterField): boolean {
  const { value } = rule;
  const numbers = typeof value === "number" ? [value] : [];

  if (Array.isArray(value)) {
    numbers.push(...value);
  }

  return numbers.every((number) =>
    field.isInteger ? Number.isSafeInteger(number) : Number.isFinite(number),
  );
}

/**
 * Whether a rule is complete; a lattice rule awaiting its text is kept, yet neither counts nor reaches the API.
 */
function isFinished(rule: FilterRule): boolean {
  return typeof rule.value !== "string" || rule.value.trim() !== "";
}

/**
 * Keeps the nodes the catalog can answer: known fields with an operator and value they take.
 */
function keepUsableNodes(
  nodes: readonly FilterNode[],
  fields: readonly FilterField[],
): FilterNode[] {
  const kept: FilterNode[] = [];

  for (const node of nodes) {
    if ("rules" in node) {
      kept.push({ ...node, rules: keepUsableNodes(node.rules, fields) });
      continue;
    }

    const field = fields.find(({ key }) => key === node.field);

    if (
      field !== undefined &&
      OPERATORS_BY_TYPE[field.type].includes(node.operator) &&
      typeOfValue(node.value) === field.type &&
      (node.operator === "between") === Array.isArray(node.value) &&
      hasSoundNumbers(node, field)
    ) {
      kept.push(normalizeRule(node));
    }
  }

  return kept;
}

/**
 * Drops every group left with nothing in it, the root excepted.
 */
function pruneGroup(group: FilterGroup): FilterGroup {
  const rules: FilterNode[] = [];

  for (const node of group.rules) {
    if (!("rules" in node)) {
      rules.push(node);
      continue;
    }

    const pruned = pruneGroup(node);

    if (pruned.rules.length > 0) {
      rules.push(pruned);
    }
  }

  return { ...group, rules };
}

/**
 * Builds a group's input from its combinator, rules and nested groups.
 */
function toGroupInput(
  group: FilterGroup,
  rules: MeanderFilterRuleInput[],
  groups: MeanderFilterGroupInput[],
): MeanderFilterGroupInput | undefined {
  if (rules.length === 0 && groups.length === 0) {
    return undefined;
  }

  return {
    combinator: group.combinator === "and" ? "AND" : "OR",
    ...(groups.length > 0 && { groups }),
    ...(rules.length > 0 && { rules }),
  };
}

/**
 * Words a rule's value as the API's input holds it.
 */
function toRuleInput(rule: FilterRule): MeanderFilterRuleInput {
  const { field, operator, value } = rule;
  const input = { field, operator: OPERATOR_INPUTS[operator] };

  if (typeof value === "boolean") {
    return { ...input, flag: value };
  }

  if (typeof value === "string") {
    return { ...input, text: value };
  }

  return {
    ...input,
    numbers:
      typeof value === "number" ? [value] : value.toSorted((a, b) => a - b),
  };
}

/**
 * Words a tree as the API's group input, or none when it holds no rule.
 */
function toTreeInput(
  group: FilterGroup | undefined,
): MeanderFilterGroupInput | undefined {
  if (group === undefined) {
    return undefined;
  }

  const rules: MeanderFilterRuleInput[] = [];
  const groups: MeanderFilterGroupInput[] = [];

  for (const node of group.rules) {
    if (!("rules" in node)) {
      if (isFinished(node)) {
        rules.push(toRuleInput(node));
      }

      continue;
    }

    const nested = toTreeInput(node);

    if (nested !== undefined) {
      groups.push(nested);
    }
  }

  return toGroupInput(group, rules, groups);
}

/**
 * The kind of field a value belongs to.
 */
function typeOfValue(value: FilterValue): FilterFieldType {
  if (typeof value === "boolean") {
    return "boolean";
  }

  return typeof value === "string" ? "text" : "number";
}
