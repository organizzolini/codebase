import {
  DEFAULT_REPEATS,
  MAXIMUM_REPEATS,
  MINIMUM_REPEATS,
} from "../../../../../hooks/use-gallery-search/use-gallery-search.constants";
import {
  isWithinLimits,
  normalizeRule,
} from "../filter-model/filter-limits.utilities";
import {
  OPERATORS_BY_TYPE,
  REPEATS_FILTER_FIELD,
  ROWS_FILTER_FIELD,
} from "../filter-model/filter-model.constants";
import { countRules } from "../filter-model/filter-model.utilities";
import { sanitizeRows } from "../filter-model/filter-rows.utilities";

import {
  DEFAULT_FILTER_LINK,
  NUMBER_SCHEMAS,
  REPEATS_FIELDS,
  ROOT_ID,
  ROWS_FIELDS,
} from "./filter-query.constants";

import type {
  FilterField,
  FilterGroup,
  FilterNode,
  FilterOperator,
  FilterRule,
  FilterValue,
  RowsFilter,
} from "../filter-model/filter-model.types";
import type {
  FilterLink,
  GalleryFilterNode,
  GalleryFilterQuery,
  GalleryFilterRule,
  GalleryFilterValue,
} from "./filter-query.types";

// 🔏 Private Functions

/**
 * Counts the finished rules of a tree the link would hold, rows and repeats aside.
 */
export function countActiveRules(
  query: GalleryFilterQuery,
  fields: readonly FilterField[],
): number {
  const { filter } = fromFilterQuery(query, fields);

  return filter === undefined ? 0 : countRules(filter);
}

/**
 * Puts rows and repeats back at the head of a tree that lost them, at their
 * defaults, each once.
 */
export function ensureRequiredRules(
  query: GalleryFilterQuery,
): GalleryFilterQuery {
  const [defaultRows, defaultRepeats] = toRequiredNodes(
    DEFAULT_FILTER_LINK.rows,
    DEFAULT_FILTER_LINK.repeats,
  );
  const rows = query.rules.find(
    (node) =>
      isRequiredNode(node) && node.path.at(-1) === ROWS_FILTER_FIELD.key,
  );
  const repeats = query.rules.find(
    (node) =>
      isRequiredNode(node) && node.path.at(-1) === REPEATS_FILTER_FIELD.key,
  );

  return {
    ...query,
    rules: [
      rows ?? defaultRows,
      repeats ?? defaultRepeats,
      ...query.rules.filter((node) => !isRequiredNode(node)),
    ].filter((node) => node !== undefined),
  };
}

/**
 * Reads the Filters tree as the link holds it, rows and repeats at their defaults when unfinished.
 */
export function fromFilterQuery(
  query: GalleryFilterQuery,
  fields: readonly FilterField[],
): FilterLink {
  const [rowsNode, repeatsNode] = findRequired(query.rules);
  const rows =
    rowsNode === undefined ? undefined : toLinkRule(rowsNode, ROWS_FIELDS);
  const repeats =
    repeatsNode === undefined
      ? undefined
      : toLinkRule(repeatsNode, REPEATS_FIELDS);
  const rules = toLinkNodes(
    query.rules.filter((node) => !isRequiredNode(node)),
    toFieldMap(fields),
  );
  const filter: FilterGroup = { combinator: query.combinator, rules };

  return {
    filter: rules.length === 0 || !isWithinLimits(filter) ? undefined : filter,
    repeats: readRepeats(repeats?.value),
    rows: sanitizeRows(
      rows === undefined
        ? undefined
        : { operator: rows.operator, value: rows.value },
    ),
  };
}

/**
 * Whether an edit may land: rows and repeats once each, no negated rule,
 * and finished rules within the nesting and size the API allows.
 */
export function isQueryAllowed(
  query: GalleryFilterQuery,
  fields: readonly FilterField[],
): boolean {
  const countOf = (field: FilterField): number =>
    query.rules.filter(
      (node) => isRequiredNode(node) && node.path.at(-1) === field.key,
    ).length;
  const rules = toLinkNodes(
    query.rules.filter((node) => !isRequiredNode(node)),
    toFieldMap(fields),
  );

  return (
    countOf(ROWS_FILTER_FIELD) === 1 &&
    countOf(REPEATS_FILTER_FIELD) === 1 &&
    !query.rules.some((node) => hasNegation(node)) &&
    isWithinLimits({ combinator: query.combinator, rules })
  );
}

/**
 * Whether two links hold the same filter, rows rule and repeats.
 */
export function isSameFilterLink(left: FilterLink, right: FilterLink): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Builds the Filters tree the link stands for: rows, repeats, then the
 * tree's rules under its combinator.
 */
export function toFilterQuery(
  link: FilterLink,
  fields: readonly FilterField[],
): GalleryFilterQuery {
  const categories = new Map<string, string>();

  for (const field of fields) {
    categories.set(field.key, field.category);
  }

  const { filter, repeats, rows } = link;

  return {
    combinator: filter?.combinator ?? "and",
    id: ROOT_ID,
    rules: [
      ...toRequiredNodes(rows, repeats),
      ...toQueryNodes(filter?.rules ?? [], ROOT_ID, categories),
    ],
    type: "group",
  };
}

/**
 * The operator a node names, if the field takes it.
 */
function findOperator(
  field: FilterField | undefined,
  operator: string,
): FilterOperator | undefined {
  // A loop rather than a callback keeps the call stacks shallow.
  for (const candidate of OPERATORS_BY_TYPE[field?.type ?? "text"]) {
    if (candidate === operator) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * The rule nodes on rows and on repeats, if the tree holds them.
 */
function findRequired(
  nodes: readonly GalleryFilterNode[],
): [GalleryFilterRule | undefined, GalleryFilterRule | undefined] {
  const rules = nodes.filter((candidate): candidate is GalleryFilterRule =>
    isRequiredNode(candidate),
  );

  return [
    rules.find((rule) => rule.path.at(-1) === ROWS_FILTER_FIELD.key),
    rules.find((rule) => rule.path.at(-1) === REPEATS_FILTER_FIELD.key),
  ];
}

// 🌎 Public Functions

/**
 * Whether a node, or one beneath it, is negated, which the link cannot hold.
 */
function hasNegation(node: GalleryFilterNode): boolean {
  return node.type === "rule"
    ? node.negated === true
    : node.rules.some((child) => hasNegation(child));
}

/**
 * Whether a node is a rule on rows or repeats.
 */
function isRequiredNode(node: GalleryFilterNode): node is GalleryFilterRule {
  return (
    node.type === "rule" &&
    (node.path.at(-1) === ROWS_FILTER_FIELD.key ||
      node.path.at(-1) === REPEATS_FILTER_FIELD.key)
  );
}

/**
 * Reads a number rule's value: a finite number, whole where the field counts, or a pair of them for a range.
 */
function readNumbers(
  node: GalleryFilterRule,
  field: FilterField,
): FilterValue | undefined {
  const schemas = NUMBER_SCHEMAS[field.isInteger ? "whole" : "fractional"];
  const parsed = (
    node.operator === "between" ? schemas.range : schemas.single
  ).safeParse(node.value);

  return parsed.success ? parsed.data : undefined;
}

/**
 * Reads a flag or a text rule's value: a flag, or text with something in it.
 */
function readOther(
  node: GalleryFilterRule,
  field: FilterField,
): FilterValue | undefined {
  const { value } = node;

  if (field.type === "boolean") {
    return typeof value === "boolean" ? value : undefined;
  }

  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/**
 * Reads the repeats a rule holds: a whole number from the least to the most, else the default.
 */
function readRepeats(value: unknown): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MINIMUM_REPEATS &&
    value <= MAXIMUM_REPEATS
    ? value
    : DEFAULT_REPEATS;
}

/**
 * The fields by key.
 */
function toFieldMap(
  fields: readonly FilterField[],
): ReadonlyMap<string, FilterField> {
  const byKey = new Map<string, FilterField>();

  for (const field of fields) {
    byKey.set(field.key, field);
  }

  return byKey;
}

/**
 * Reads the finished rules and groups under a group, leaving out the empty.
 */
function toLinkNodes(
  nodes: readonly GalleryFilterNode[],
  fields: ReadonlyMap<string, FilterField>,
): FilterNode[] {
  const kept: FilterNode[] = [];

  for (const node of nodes) {
    if (node.type === "rule") {
      const rule = toLinkRule(node, fields);

      if (rule !== undefined) {
        kept.push(rule);
      }

      continue;
    }

    const rules = toLinkNodes(node.rules, fields);

    if (rules.length > 0) {
      kept.push({ combinator: node.combinator, rules });
    }
  }

  return kept;
}

/**
 * Reads one rule as the link holds it, or none while it is unfinished,
 * negated, or on a field the catalog lacks.
 */
function toLinkRule(
  node: GalleryFilterRule,
  fields: ReadonlyMap<string, FilterField>,
): FilterRule | undefined {
  const key = node.path.at(-1) ?? "";
  const field = fields.get(key);
  const operator = findOperator(field, node.operator);

  if (field === undefined || operator === undefined || node.negated === true) {
    return undefined;
  }

  const value =
    field.type === "number" ? readNumbers(node, field) : readOther(node, field);

  return value === undefined
    ? undefined
    : normalizeRule({ field: key, operator, value });
}

/**
 * The Filters tree's nodes for link nodes, each id drawn from its place under its parent's.
 */
function toQueryNodes(
  nodes: readonly FilterNode[],
  parentId: string,
  categories: ReadonlyMap<string, string>,
): GalleryFilterNode[] {
  const built: GalleryFilterNode[] = [];

  for (const [index, node] of nodes.entries()) {
    const id = `${parentId}-${String(index)}`;

    built.push(
      "rules" in node
        ? {
            combinator: node.combinator,
            id,
            rules: toQueryNodes(node.rules, id, categories),
            type: "group",
          }
        : {
            id,
            operator: node.operator,
            path: [categories.get(node.field) ?? "shape", node.field],
            type: "rule",
            value: node.value,
          },
    );
  }

  return built;
}

/**
 * The two rules every filter holds, rows then repeats.
 */
function toRequiredNodes(
  rows: RowsFilter,
  repeats: GalleryFilterValue,
): GalleryFilterNode[] {
  return [
    {
      id: ROWS_FILTER_FIELD.key,
      operator: rows.operator,
      path: [ROWS_FILTER_FIELD.category, ROWS_FILTER_FIELD.key],
      type: "rule",
      value: rows.value,
    },
    {
      id: REPEATS_FILTER_FIELD.key,
      operator: "eq",
      path: [REPEATS_FILTER_FIELD.category, REPEATS_FILTER_FIELD.key],
      type: "rule",
      value: repeats,
    },
  ];
}
