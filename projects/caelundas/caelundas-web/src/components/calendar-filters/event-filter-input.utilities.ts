import { RANGE_OPERATORS } from "./event-filter-input.constants";

import type {
  EventFilterGroupInput,
  EventFilterRuleInput,
} from "../../graphql/generated/operations";
import type {
  EventFilterNode,
  EventFilterRule,
  EventFilterValue,
} from "./event-filters.types";

/**
 * Writes the filter tree as the API's filter input, leaving out unfinished rules and empty groups; an empty tree answers `null`.
 */
export function toEventFilterInput(
  node: EventFilterNode | undefined,
): EventFilterGroupInput | null {
  if (node === undefined) {
    return null;
  }

  if (node.type === "rule") {
    const rule = toRuleInput(node);

    return rule === null ? null : { combinator: "AND", rules: [rule] };
  }

  const groups: EventFilterGroupInput[] = [];
  const rules: EventFilterRuleInput[] = [];

  // Loops rather than mapping callbacks, which would count as one more frame
  // on every nested group's call stack.
  for (const child of node.rules) {
    if (child.type === "group") {
      pushWritten(groups, toEventFilterInput(child));
    } else {
      pushWritten(rules, toRuleInput(child));
    }
  }

  return joinInputs(node.combinator === "or" ? "OR" : "AND", groups, rules);
}

/**
 * Joins written groups and rules under a combinator, leaving out the list
 * that holds nothing, or answers `null` when both do.
 */
function joinInputs(
  combinator: EventFilterGroupInput["combinator"],
  groups: readonly EventFilterGroupInput[],
  rules: readonly EventFilterRuleInput[],
): EventFilterGroupInput | null {
  if (groups.length + rules.length === 0) {
    return null;
  }

  return {
    combinator,
    ...(groups.length === 0 ? {} : { groups: [...groups] }),
    ...(rules.length === 0 ? {} : { rules: [...rules] }),
  };
}

/**
 * Adds what was written to a list, unless nothing was.
 */
function pushWritten<TWritten>(
  list: TWritten[],
  written: null | TWritten,
): void {
  if (written !== null) {
    list.push(written);
  }
}

/**
 * Writes one rule, or answers `null` while it is not finished: a range needs
 * both its ends.
 */
function toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null {
  const values = toRuleValues(rule.value);
  const isRange = RANGE_OPERATORS.has(rule.operator);

  if (
    rule.operator === "" ||
    rule.path.length === 0 ||
    values.length === 0 ||
    (isRange && values.length !== 2)
  ) {
    return null;
  }

  return {
    ...(rule.negated === true ? { negated: true } : {}),
    operator: rule.operator,
    path: [...rule.path],
    values,
  };
}

/**
 * Writes the values a rule holds as text, dropping the empty ones.
 */
function toRuleValues(value: EventFilterValue | undefined): string[] {
  const items = Array.isArray(value) ? value : [value];
  const values: string[] = [];

  for (const item of items) {
    if (item !== null && item !== undefined && item !== "") {
      values.push(String(item));
    }
  }

  return values;
}
