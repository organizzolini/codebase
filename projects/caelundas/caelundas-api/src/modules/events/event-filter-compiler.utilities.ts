import { bindParameter } from "./event-filter-binder.utilities";
import { compileDerivedRule } from "./event-filter-derived.utilities";
import {
  TAG_FIELD_PREFIX,
  TAG_OPERATOR_NAMES,
  TAG_OPERATORS,
} from "./event-filter-fields.constants";
import {
  compileDerivedNumberRule,
  compileTagNumberRule,
  isDerivedNumberRule,
  isNumberOperator,
} from "./event-filter-numbers.utilities";
import { EVENT_TAGS_MATCHING_SQL } from "./event-filter-sql.constants";
import { UUID_PATTERN } from "./event-filter-values.constants";
import { readTexts } from "./event-filter-values.utilities";

import type {
  CompiledEventFilter,
  EventFilterBinder,
  EventFilterGroup,
  EventFilterRule,
} from "./event-filter.types";

/**
 * Compiles a filter tree to one parameterized SQL expression, numbering
 * placeholders after `offset`. Unfinished rules are left out; nothing left
 * yields `null`.
 */
export function compileEventFilter(
  filter: EventFilterGroup | null | undefined,
  offset: number,
): CompiledEventFilter | null {
  if (filter === null || filter === undefined) {
    return null;
  }

  const binder: EventFilterBinder = { offset, parameters: [] };
  const sql = compileGroup(filter, binder);

  return sql === null ? null : { parameters: binder.parameters, sql };
}

/**
 * Joins a group's compiled parts under its combinator, in parentheses so
 * nesting keeps its meaning; `null` when none is finished.
 */
function compileGroup(
  group: EventFilterGroup,
  binder: EventFilterBinder,
): null | string {
  const parts: string[] = [];

  // Loops rather than mapping callbacks, which would count as one more
  // frame on every nested group's call stack.
  for (const rule of group.rules) {
    const part = compileRule(rule, binder);

    if (part !== null) {
      parts.push(part);
    }
  }

  for (const child of group.groups) {
    const part = compileGroup(child, binder);

    if (part !== null) {
      parts.push(part);
    }
  }

  return parts.length === 0 ? null : `(${parts.join(` ${group.combinator} `)})`;
}

/**
 * Compiles one rule by its field, flipping it when the rule is negated.
 */
function compileRule(
  rule: EventFilterRule,
  binder: EventFilterBinder,
): null | string {
  const fieldId = rule.path.join(".");
  let compiled: null | string;

  // A rule that compares a number reads it straight away; any other picks
  // from a list, so each kind compiles through its own function.
  if (fieldId.startsWith(TAG_FIELD_PREFIX)) {
    compiled = isNumberOperator(rule.operator)
      ? compileTagNumberRule(
          fieldId.slice(TAG_FIELD_PREFIX.length),
          rule,
          binder,
        )
      : compileTagRule(rule.operator, readTexts(rule.values), binder);
  } else {
    compiled = isDerivedNumberRule(fieldId, rule.operator)
      ? compileDerivedNumberRule(rule, fieldId, binder)
      : compileDerivedRule(rule, binder);
  }

  return compiled === null || !rule.negated ? compiled : `(not ${compiled})`;
}

/**
 * Each picked tag also matches tags beneath it, since the tag view lists
 * ancestors too; a non-UUID pick matches nothing.
 */
function compileTagRule(
  operator: string,
  tagIds: readonly string[],
  binder: EventFilterBinder,
): null | string {
  if (tagIds.length === 0 || !TAG_OPERATOR_NAMES.includes(operator)) {
    return null;
  }

  const known: string[] = [];

  for (const tagId of tagIds) {
    if (UUID_PATTERN.test(tagId)) {
      known.push(tagId);
    }
  }

  const matching = EVENT_TAGS_MATCHING_SQL.replace("{tags}", () =>
    bindParameter(binder, known),
  );

  if (operator === TAG_OPERATORS.hasAllOf) {
    const count = bindParameter(binder, tagIds.length);

    return `((select count(distinct m.tag_id) from (${matching}) m) = ${count}::integer)`;
  }

  return operator === TAG_OPERATORS.isAnyOf
    ? `(exists (${matching}))`
    : `(not exists (${matching}))`;
}
