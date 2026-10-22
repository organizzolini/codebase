import { compileDerivedRule } from "./event-filter-derived";
import { readTexts } from "./event-filter-values";
import {
  EVENT_TAGS_MATCHING_SQL,
  TAG_FIELD_PREFIX,
  TAG_OPERATORS,
} from "./event-filters.constants";

import type {
  CompiledEventFilter,
  EventFilterNode,
  EventFilterRule,
} from "./event-filters.types";

/**
 * Compiles the ReUI filter tree to one parameterized boolean expression over
 * the derived events view, aliased `e`. A rule that is not finished, such as
 * one with no operator, no values, or a field this calendar does not know,
 * is left out rather than failing, and so is a group left with nothing in
 * it; a tree with nothing left compiles to `null`, meaning no filter.
 */
export function compileEventFilter(
  node: EventFilterNode | undefined,
): CompiledEventFilter | null {
  if (node === undefined) {
    return null;
  }

  if (node.type === "rule") {
    return compileRule(node);
  }

  const parts: CompiledEventFilter[] = [];

  // A loop rather than a mapping callback, which would count as one more
  // frame on every nested group's call stack.
  for (const child of node.rules) {
    const part = compileEventFilter(child);

    if (part !== null) {
      parts.push(part);
    }
  }

  return combine(parts, node.combinator);
}

/**
 * Joins compiled parts under one combinator, in parentheses so that nesting
 * keeps its meaning.
 */
function combine(
  parts: readonly CompiledEventFilter[],
  combinator: "and" | "or",
): CompiledEventFilter | null {
  if (parts.length === 0) {
    return null;
  }

  return {
    parameters: parts.flatMap((part) => part.parameters),
    sql: `(${parts.map((part) => part.sql).join(` ${combinator} `)})`,
  };
}

/**
 * Compiles one rule by its field, flipping it when the rule is negated.
 */
function compileRule(rule: EventFilterRule): CompiledEventFilter | null {
  const fieldId = rule.path.join(".");
  const compiled = fieldId.startsWith(TAG_FIELD_PREFIX)
    ? compileTagRule(rule.operator, readTexts(rule.value))
    : compileDerivedRule(rule);

  if (compiled === null || rule.negated !== true) {
    return compiled;
  }

  return { parameters: compiled.parameters, sql: `not ${compiled.sql}` };
}

/**
 * Compiles a rule on a tag field. Each picked tag also matches every tag
 * beneath it, because the tag view lists each event's ancestors too.
 */
function compileTagRule(
  operator: string,
  tagIds: readonly string[],
): CompiledEventFilter | null {
  if (tagIds.length === 0) {
    return null;
  }

  const placeholders = Array.from({ length: tagIds.length })
    .fill("?")
    .join(", ");
  const matching = EVENT_TAGS_MATCHING_SQL.replace(
    "{placeholders}",
    () => placeholders,
  );

  switch (operator) {
    case TAG_OPERATORS.hasAllOf: {
      return {
        parameters: [...tagIds, tagIds.length],
        sql: `((select count(distinct m.tag_id) from (${matching}) m) = ?)`,
      };
    }
    case TAG_OPERATORS.isAnyOf: {
      return { parameters: [...tagIds], sql: `(exists (${matching}))` };
    }
    case TAG_OPERATORS.isNoneOf: {
      return { parameters: [...tagIds], sql: `(not exists (${matching}))` };
    }
    default: {
      return null;
    }
  }
}
