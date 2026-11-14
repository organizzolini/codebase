import { isWithinLimits, normalizeRule } from "./filter-limits.utilities";
import {
  OPERATOR_INPUTS,
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
  SHAPE_FILTER_FIELDS,
} from "./gallery-filter-builder.constants";

import type {
  MeanderFilterGroupInput,
  MeanderFilterRuleInput,
} from "../../graphql/generated/operations";
import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";
import type {
  FilterEdit,
  FilterField,
  FilterFieldType,
  FilterGroup,
  FilterNode,
  FilterOperator,
  FilterRule,
  FilterRuleEntry,
  FilterValue,
} from "./gallery-filter-builder.types";

// 🔏 Private Functions

/**
 * Adds a node to the end of the group at a path.
 */
export function addNode(path: readonly number[], node: FilterNode): FilterEdit {
  return (root) =>
    updateGroup(root, path, (group) => ({
      ...group,
      rules: [...group.rules, node],
    }));
}

/**
 * Moves a rule to another field, keeping its operator and value when the
 * new field takes them.
 */
export function changeRuleField(
  rule: FilterRule,
  field: FilterField,
): FilterRule {
  if (typeOfValue(rule.value) !== field.type) {
    return createRule(field);
  }

  const { value } = rule;

  // A number field's value, which may be fractional, moves to a whole-number
  // field by dropping its fraction.
  if (field.isInteger && typeof value === "number") {
    return { ...rule, field: field.key, value: Math.trunc(value) };
  }

  if (field.isInteger && Array.isArray(value)) {
    return {
      ...rule,
      field: field.key,
      value: [Math.trunc(value[0]), Math.trunc(value[1])],
    };
  }

  return { ...rule, field: field.key };
}

/**
 * Moves a rule to another operator, turning its value into a range or a
 * single number as the operator needs.
 */
export function changeRuleOperator(
  rule: FilterRule,
  operator: FilterOperator,
): FilterRule {
  const { value } = rule;

  if (operator === "between" && typeof value === "number") {
    return { ...rule, operator, value: [value, value] };
  }

  if (operator !== "between" && Array.isArray(value)) {
    return { ...rule, operator, value: value[0] };
  }

  return { ...rule, operator };
}

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

/**
 * Builds a group holding one fresh rule on a field.
 */
export function createGroup(field: FilterField): FilterGroup {
  return { combinator: "and", rules: [createRule(field)] };
}

/**
 * Builds the rule a field starts with: its first operator and 0, or no text
 * yet for a text field.
 */
export function createRule(field: FilterField): FilterRule {
  const operator = OPERATORS_BY_TYPE[field.type][0] ?? "eq";

  if (field.type === "boolean") {
    return { field: field.key, operator, value: true };
  }

  return { field: field.key, operator, value: field.type === "text" ? "" : 0 };
}

/**
 * Words a field for its picker: what it measures, where, its kind and how
 * many meanders hold each of its first values.
 */
export function describeField(field: FilterField): string {
  const parts = [
    field.description,
    field.category,
    field.type,
    ...(field.isPattern ? ["pattern"] : []),
  ];
  const counts: string[] = [];

  for (const { meanderCount, value } of field.valueCounts.slice(0, 6)) {
    counts.push(`${String(value)}: ${meanderCount.toLocaleString("en-US")}`);
  }

  if (counts.length === 0) {
    return parts.join(" · ");
  }

  const more = field.valueCounts.length > counts.length ? ", …" : "";

  return `${parts.join(" · ")} · meanders by value ${counts.join(", ")}${more}`;
}

// 🌎 Public Functions

/**
 * Words a rule for a chip: its field's label, the operator and the value.
 */
export function describeRule(
  rule: FilterRule,
  fields: readonly FilterField[],
): string {
  const label =
    fields.find(({ key }) => key === rule.field)?.label ?? rule.field;
  const { value } = normalizeRule(rule);
  const shown =
    typeof value === "object"
      ? `${String(value[0])} and ${String(value[1])}`
      : String(value);

  return `${label} ${OPERATOR_LABELS[rule.operator]} ${shown}`;
}

/**
 * Lists every rule in a tree with its path, in reading order.
 */
export function listRules(
  group: FilterGroup,
  parent: readonly number[] = [],
): FilterRuleEntry[] {
  const entries: FilterRuleEntry[] = [];

  for (const [index, node] of group.rules.entries()) {
    const path = [...parent, index];

    if ("rules" in node) {
      entries.push(...listRules(node, path));
    } else if (isFinished(node)) {
      entries.push({ path, rule: node });
    }
  }

  return entries;
}

/**
 * Removes the node at a path, then the groups that leaves empty.
 */
export function removeNode(path: readonly number[]): FilterEdit {
  const index = path.at(-1);

  return (root) =>
    pruneGroup(
      updateGroup(root, path.slice(0, -1), (group) => ({
        ...group,
        rules: group.rules.filter((_, position) => position !== index),
      })),
    );
}

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
 * Sets how the group at a path joins what is in it.
 */
export function setCombinator(
  path: readonly number[],
  combinator: FilterGroup["combinator"],
): FilterEdit {
  return (root) =>
    updateGroup(root, path, (group) => ({ ...group, combinator }));
}

/**
 * Replaces the rule at a path.
 */
export function setRule(path: readonly number[], rule: FilterRule): FilterEdit {
  const index = path.at(-1);

  return (root) =>
    updateGroup(root, path.slice(0, -1), (group) => ({
      ...group,
      rules: group.rules.map((node, position) =>
        position === index ? normalizeRule(rule) : node,
      ),
    }));
}

/**
 * Words a tree as the API's filter argument, or none when it holds no rule.
 */
export function toFilterInput(
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

    const nested = toFilterInput(node);

    if (nested !== undefined) {
      groups.push(nested);
    }
  }

  return toGroupInput(group, rules, groups);
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
 * The kind of field a value belongs to.
 */
function typeOfValue(value: FilterValue): FilterFieldType {
  if (typeof value === "boolean") {
    return "boolean";
  }

  return typeof value === "string" ? "text" : "number";
}

/**
 * Changes the group at a path, leaving every other node as it was.
 */
function updateGroup(
  group: FilterGroup,
  path: readonly number[],
  update: (found: FilterGroup) => FilterGroup,
): FilterGroup {
  const [head, ...rest] = path;

  if (head === undefined) {
    return update(group);
  }

  return {
    ...group,
    rules: group.rules.map((node, index) =>
      index === head && "rules" in node
        ? updateGroup(node, rest, update)
        : node,
    ),
  };
}
