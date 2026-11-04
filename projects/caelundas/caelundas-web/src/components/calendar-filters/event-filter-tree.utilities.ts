import { compileEventFilter } from "./event-filter-compiler.utilities";

import type { LooseEventFilterGroup } from "./event-filter-tree.types";
import type { EventFilterNode, EventFilterQuery } from "./event-filters.types";

/**
 * Counts the rules in a tree that are finished, which are the ones the
 * query applies, however deeply they are nested.
 */
export function countActiveEventFilterRules(node: EventFilterNode): number {
  if (node.type === "rule") {
    return compileEventFilter(node) === null ? 0 : 1;
  }

  let count = 0;

  for (const child of node.rules) {
    count += countActiveEventFilterRules(child);
  }

  return count;
}

/**
 * Whether two filter trees hold the same content, whatever order their keys
 * were set in: a link is parsed into new objects on every navigation.
 */
export function isSameEventFilter(
  left: EventFilterQuery | undefined,
  right: EventFilterQuery | undefined,
): boolean {
  return (
    JSON.stringify(left && normalizeEventFilter(left)) ===
    JSON.stringify(right && normalizeEventFilter(right))
  );
}

/**
 * Rebuilds a filter tree with every node's keys in one fixed order, leaving
 * out a `negated` that was never set, so equal trees write equal JSON.
 */
export function normalizeEventFilter(
  group: LooseEventFilterGroup,
): EventFilterQuery {
  const rules: EventFilterNode[] = [];

  for (const node of group.rules) {
    rules.push(
      node.type === "group"
        ? normalizeEventFilter(node)
        : {
            id: node.id,
            ...(node.negated === undefined ? {} : { negated: node.negated }),
            operator: node.operator,
            path: [...node.path],
            type: "rule",
            value: node.value,
          },
    );
  }

  return { combinator: group.combinator, id: group.id, rules, type: "group" };
}

/**
 * The filter a link should hold for a tree. An empty tree is kept, not
 * dropped: a link with no filter opens on the default collection, so "no
 * filter at all" has to be written out.
 */
export function toLinkedEventFilter(query: EventFilterQuery): EventFilterQuery {
  return query;
}
