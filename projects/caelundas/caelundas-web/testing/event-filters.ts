import { compileEventFilter } from "../src/lib/event-filters/event-filter-compiler";

import {
  createTestSqlExecutor,
  type TestEventsDatabaseOptions,
} from "./events-database";

import type {
  EventFilterNode,
  EventFilterQuery,
  EventFilterRule,
} from "../src/lib/event-filters/event-filters.types";

/**
 * A rule on any field by its id, complete unless a test leaves something
 * out, such as `fieldRule("hour", "between", [22, 23])`.
 */
export function fieldRule(
  field: string,
  operator: string,
  value: EventFilterRule["value"],
  overrides: Partial<EventFilterRule> = {},
): EventFilterRule {
  return {
    id: `${field}-${operator}`,
    operator,
    path: [field],
    type: "rule",
    value,
    ...overrides,
  };
}

/**
 * Nodes under one combinator.
 */
export function filterGroup(
  combinator: "and" | "or",
  ...rules: EventFilterNode[]
): EventFilterQuery {
  return { combinator, id: `group-${combinator}`, rules, type: "group" };
}

/**
 * The calendar's address for a day with a filter, written the way the router
 * writes a search parameter that holds an object.
 */
export function filterLink(date: string, filter: unknown): string {
  return `/?date=${date}&filter=${encodeURIComponent(JSON.stringify(filter))}`;
}

/**
 * A rule on a tag root's field by the seed's short names: the root "planet"
 * and the tag "mars" name `tag-planet` and `tag-mars`.
 */
export function tagRule(
  root: string,
  operator: string,
  tags: readonly string[],
): EventFilterRule {
  return {
    id: `rule-${root}-${operator}-${tags.join("-")}`,
    operator,
    path: [`tag:tag-${root}`],
    type: "rule",
    value: tags.map((tag) => `tag-${tag}`),
  };
}

const seededExecutor = createTestSqlExecutor();

/**
 * The ids of the seeded events a compiled filter keeps, in id order, from
 * the seed alone unless a test asks for more rows.
 */
export async function findMatchingEventIds(
  query: EventFilterQuery,
  options?: TestEventsDatabaseOptions,
): Promise<string[]> {
  const executor =
    options === undefined ? seededExecutor : createTestSqlExecutor(options);
  const compiled = compileEventFilter(query);
  const where = compiled === null ? "" : `where ${compiled.sql}`;
  const rows = await executor.select(
    `select e.id from calendar_events_derived e ${where} order by e.id`,
    compiled?.parameters ?? [],
  );

  return rows.map((row) => String(row["id"]));
}
