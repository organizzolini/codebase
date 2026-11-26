import { FACTS_EVENT_COLUMN_SQL } from "../facts/event-metrics-facts.constants";

import type {
  AggregateKind,
  ExpressionOperator,
} from "../catalog/event-metrics-catalog.types";
import type {
  EmptyValue,
  MeasureGrain,
  MeasureSpec,
  RolledMeasure,
} from "./event-metrics-measures.types";

// ♟️ Constants

/** The union of ranges in minutes, over `{ranges}`. */
const UNION_MINUTES_SQL = `(select coalesce(sum(extract(epoch from upper(r) - lower(r))), 0) / 60 from unnest({ranges}) r)`;

/** A progressive event clipped to its period, as a range. */
const CLIPPED_RANGE_SQL = `tstzrange(greatest({a}."start", {a}.period_start), least({a}."end", {a}.period_end))`;

/** Narrows an aggregate to the events that last. */
const PROGRESSIVE_FILTER_SQL = `filter (where {a}."end" > {a}."start"{and})`;

/** The columns of an event row a measure may read. */
export const EVENT_ROW_COLUMNS: ReadonlySet<string> = new Set([
  ...Object.keys(FACTS_EVENT_COLUMN_SQL),
  "ancestor_tag_ids",
  "day",
  "duration_minutes",
  "end",
  "hour",
  "name",
  "start",
  "tag_ids",
]);

/** Where the measures that merge across days are read. */
const MERGEABLE_GRAINS: readonly MeasureGrain[] = ["day", "event"];

/** Where the measures that do not merge are read: the events. */
const EVENT_GRAIN: readonly MeasureGrain[] = ["event"];

/** The columns every event row of the facts statements carries. */
export const EVENT_BASE_COLUMNS: ReadonlySet<string> = new Set([
  "duration_minutes",
  "end",
  "start",
  "tag_ids",
]);

/** Event-row columns no view column holds: computed from the row's tags. */
export const DERIVED_EVENT_COLUMNS: ReadonlySet<string> = new Set([
  "is_progressive",
]);

/** The kinds that read their measure's own column from an event row. */
export const EVENT_COLUMN_KINDS: ReadonlySet<AggregateKind> = new Set([
  "clipped-sum",
  "clipped-union",
  "count-distinct",
  "maximum",
  "minimum",
  "sum",
  "union",
]);

// Over the event rows `{a}` of a group, `{c}` being the measure's column and
// `{filter}` its condition, if any. Tags are counted apart.
/** Each kind's aggregate over a group's event rows. */
export const EVENT_AGGREGATE_SQL: Readonly<Record<AggregateKind, string>> = {
  "clipped-sum": `coalesce(sum(extract(epoch from least({a}."end", {a}.period_end) - greatest({a}."start", {a}.period_start)) / 60){filter}, 0)`,
  "clipped-union": UNION_MINUTES_SQL.replace(
    "{ranges}",
    `range_agg(${CLIPPED_RANGE_SQL}){filter}`,
  ),
  "count-distinct": `count(distinct {c}){filter}`,
  "distinct-names": `count(distinct {a}."name"){filter}`,
  "distinct-tags": `(select count(distinct t.tag_id) from calendar_event_tags t where t.calendar_event_id = any(array_agg({a}.id)){tagRoot})`,
  maximum: `max({c}){filter}`,
  minimum: `min({c}){filter}`,
  period: `extract(epoch from (min({a}.period_end) - min({a}.period_start))) / 60`,
  "progressive-max": `max({a}.duration_minutes) ${PROGRESSIVE_FILTER_SQL}`,
  "progressive-min": `min({a}.duration_minutes) ${PROGRESSIVE_FILTER_SQL}`,
  "progressive-percentile": `percentile_cont({argument}) within group (order by {a}.duration_minutes) ${PROGRESSIVE_FILTER_SQL}`,
  sum: `coalesce(sum({c}){filter}, 0)`,
  union: UNION_MINUTES_SQL.replace("{ranges}", `range_agg({c}){filter}`),
};

// A count, a sum or a union reads 0 over no events; a least, a greatest or a
// progressive extreme reads none; the period is never empty, so it reads a positive 1.
/** What each kind of aggregate reads over no events. */
export const EMPTY_VALUES: Readonly<Record<AggregateKind, EmptyValue>> = {
  "clipped-sum": 0,
  "clipped-union": 0,
  "count-distinct": 0,
  "distinct-names": 0,
  "distinct-tags": 0,
  maximum: null,
  minimum: null,
  period: 1,
  "progressive-max": null,
  "progressive-min": null,
  "progressive-percentile": null,
  sum: 0,
  union: 0,
};

/** The values of an operator's operands read as Postgres reads them. */
export const EMPTY_OPERATORS: Readonly<
  Record<
    ExpressionOperator,
    (left: EmptyValue, right: EmptyValue) => EmptyValue
  >
> = {
  add: (left, right) => (left === null || right === null ? null : left + right),
  coalesce: (left, right) => left ?? right,
  divide: (left, right) =>
    left === null || right === null || right === 0 ? null : left / right,
  greatest: (left, right) =>
    left === null || right === null ? (left ?? right) : Math.max(left, right),
  least: (left, right) =>
    left === null || right === null ? (left ?? right) : Math.min(left, right),
  multiply: (left, right) =>
    left === null || right === null ? null : left * right,
  percent: (left, right) =>
    left === null || right === null || right === 0
      ? null
      : (100 * left) / right,
  subtract: (left, right) =>
    left === null || right === null ? null : left - right,
};

/** The picker's order by metric slug; others follow by slug. */
export const METRIC_ORDER: readonly string[] = [
  "events",
  "unique-names",
  "unique-tags",
  "days-with-events",
  "perfective-events",
  "progressive-events",
  "duration",
  "covered-duration",
  "average-duration",
  "median-duration",
  "longest-duration",
  "shortest-duration",
  "covered-percent",
  "total-time-percent",
  "progressive-covered-percent",
  "progressive-total-percent",
  "first-start",
  "last-start",
];

// Each measure's aggregate, column, narrowing column and grains, by its row's
// slug. The catalog load checks every column against the real view, so no row
// can inject SQL.
/** How each of the 18 measures is computed from the facts. */
export const MEASURE_REGISTRY: Readonly<Record<string, MeasureSpec>> = {
  "clipped-duration": {
    aggregate: "clipped-sum",
    column: null,
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "covered-clipped-duration": {
    aggregate: "clipped-union",
    column: null,
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "covered-duration": {
    aggregate: "union",
    column: "covered_range",
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "days-with-events": {
    aggregate: "count-distinct",
    column: "day",
    grains: MERGEABLE_GRAINS,
    unit: "count",
  },
  duration: {
    aggregate: "sum",
    column: "duration_minutes",
    grains: MERGEABLE_GRAINS,
    unit: "duration",
  },
  events: {
    aggregate: "sum",
    column: "events",
    grains: MERGEABLE_GRAINS,
    unit: "count",
  },
  "first-start": {
    aggregate: "minimum",
    column: "first_start",
    grains: MERGEABLE_GRAINS,
    unit: "instant",
  },
  "last-start": {
    aggregate: "maximum",
    column: "last_start",
    grains: MERGEABLE_GRAINS,
    unit: "instant",
  },
  "longest-progressive-duration": {
    aggregate: "progressive-max",
    column: null,
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "median-progressive-duration": {
    aggregate: "progressive-percentile",
    argument: 0.5,
    column: null,
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "perfective-events": {
    aggregate: "sum",
    column: "perfective_events",
    grains: MERGEABLE_GRAINS,
    unit: "count",
  },
  "period-length": {
    aggregate: "period",
    column: null,
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "progressive-clipped-duration": {
    aggregate: "clipped-sum",
    column: null,
    condition: "is_progressive",
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "progressive-covered-clipped-duration": {
    aggregate: "clipped-union",
    column: null,
    condition: "is_progressive",
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "progressive-events": {
    aggregate: "sum",
    column: "progressive_events",
    grains: MERGEABLE_GRAINS,
    unit: "count",
  },
  "shortest-progressive-duration": {
    aggregate: "progressive-min",
    column: null,
    grains: EVENT_GRAIN,
    unit: "duration",
  },
  "unique-names": {
    aggregate: "distinct-names",
    column: null,
    grains: EVENT_GRAIN,
    unit: "count",
  },
  "unique-tags": {
    aggregate: "distinct-tags",
    column: null,
    grains: EVENT_GRAIN,
    unit: "count",
  },
};

// Over the rollup rows `w`: the kinds that merge across days. The instants
// are already epoch milliseconds there.
/** Each mergeable kind's aggregate over the rollup rows. */
export const ROLLED_AGGREGATE_SQL: Readonly<
  Partial<Record<AggregateKind, RolledMeasure>>
> = {
  "count-distinct": { sql: "count(distinct {c})" },
  maximum: { sql: "max({c})" },
  minimum: { sql: "min({c})" },
  sum: { sql: "sum({c})" },
};

/** The operators of an expression, over the SQL of `{a}` and `{b}`. */
export const OPERATOR_SQL: Readonly<Record<string, string>> = {
  add: "({a} + {b})",
  coalesce: "coalesce({a}, {b})",
  divide: "({a} / nullif({b}, 0))",
  greatest: "greatest({a}, {b})",
  least: "least({a}, {b})",
  multiply: "({a} * {b})",
  percent: "(100.0 * {a} / nullif({b}, 0))",
  subtract: "({a} - {b})",
};
