import { EventMetric } from "../inputs/event-metric.entities";

// ♟️ Constants

/** Tag path of the events that last. */
export const PROGRESSIVE_TAG_PATH = "Temporality / Progressive";

/** Minutes from an event's start to its end, 0 for an instant. */
const DURATION_MINUTES_SQL = `(extract(epoch from (e."end" - e."start")) / 60)`;

/** Only the events that last, which the duration metrics read. */
const SPAN_SQL = `filter (where e."end" > e."start")`;

/** Minutes of the period; a period of none reads null. */
const PERIOD_MINUTES_SQL = `nullif(extract(epoch from (min(e.period_end) - min(e.period_start))) / 60, 0)`;

/** Narrows an aggregate to the events carrying the progressive tag. */
const PROGRESSIVE_ONLY_SQL = `filter (where exists (
    select 1
    from calendar_event_tag_nodes n
    where n.calendar_event_id = e.id and n.tag_path = '${PROGRESSIVE_TAG_PATH}'
  ))`;

/** Percent of the period the clipped intervals add up to. */
const COUNTED_PERCENT_SQL = `coalesce(sum(extract(epoch from least(e."end", e.period_end) - greatest(e."start", e.period_start)) / 60) {scope}, 0) * 100 / ${PERIOD_MINUTES_SQL}`;

/** Percent of the period the union of the clipped intervals covers. */
const COVERED_PERCENT_SQL = `(
    select coalesce(sum(extract(epoch from upper(r) - lower(r))), 0) / 60
    from unnest(range_agg(tstzrange(greatest(e."start", e.period_start), least(e."end", e.period_end))) {scope}) r
  ) * 100 / ${PERIOD_MINUTES_SQL}`;

/** Each metric's aggregate over a group's events `e`. */
export const EVENT_METRIC_SQL: Readonly<Record<EventMetric, string>> = {
  [EventMetric.AVERAGE_DURATION_MINUTES]: `avg(${DURATION_MINUTES_SQL}) ${SPAN_SQL}`,
  [EventMetric.COVERED_MINUTES]: `(
    select coalesce(sum(extract(epoch from upper(r) - lower(r))), 0) / 60
    from unnest(range_agg(tstzrange(e."start", e."end"))) r
  )`,
  [EventMetric.COVERED_PERCENT]: COVERED_PERCENT_SQL.replace("{scope}", ""),
  [EventMetric.DAYS_WITH_EVENTS]: `count(distinct e.start_local_day)`,
  [EventMetric.EVENTS]: `count(distinct e.id)`,
  [EventMetric.FIRST_START]: `extract(epoch from min(e."start")) * 1000`,
  [EventMetric.INSTANTS]: `count(distinct e.id) filter (where e."end" = e."start")`,
  [EventMetric.LAST_START]: `extract(epoch from max(e."start")) * 1000`,
  [EventMetric.LONGEST_DURATION_MINUTES]: `max(${DURATION_MINUTES_SQL}) ${SPAN_SQL}`,
  [EventMetric.MEDIAN_DURATION_MINUTES]: `percentile_cont(0.5) within group (order by ${DURATION_MINUTES_SQL}) ${SPAN_SQL}`,
  [EventMetric.PROGRESSIVE_COVERED_PERCENT]: COVERED_PERCENT_SQL.replace(
    "{scope}",
    PROGRESSIVE_ONLY_SQL,
  ),
  [EventMetric.PROGRESSIVE_HOURS]: `coalesce(sum(${DURATION_MINUTES_SQL} / 60) ${PROGRESSIVE_ONLY_SQL}, 0)`,
  [EventMetric.PROGRESSIVE_TOTAL_PERCENT]: COUNTED_PERCENT_SQL.replace(
    "{scope}",
    PROGRESSIVE_ONLY_SQL,
  ),
  [EventMetric.SHORTEST_DURATION_MINUTES]: `min(${DURATION_MINUTES_SQL}) ${SPAN_SQL}`,
  [EventMetric.SPANS]: `count(distinct e.id) filter (where e."end" > e."start")`,
  [EventMetric.TOTAL_DURATION_MINUTES]: `coalesce(sum(${DURATION_MINUTES_SQL}), 0)`,
  [EventMetric.TOTAL_TIME_PERCENT]: COUNTED_PERCENT_SQL.replace("{scope}", ""),
  [EventMetric.UNIQUE_NAMES]: `count(distinct e."summary")`,
  [EventMetric.UNIQUE_TAGS]: `(
    select count(distinct t.tag_id)
    from calendar_event_tag_nodes t
    where t.calendar_event_id = any(array_agg(e.id)) and t.is_direct{tagRoot}
  )`,
};

/** Limits tags to those beneath `{root}`. */
export const TAG_ROOT_SQL = ` and t.tag_id <> {root}::uuid and exists (
      select 1
      from tags_closure c
      where c.ancestor_id = {root}::uuid and c.descendant_id = t.tag_id
    )`;

/** The events in the periods, a row per period. */
export const EVENT_METRICS_SQL = `
  with periods (period, period_start, period_end) as (
    values {periods}
  ),
  events_in_periods as (
    select p.period, p.period_start, p.period_end, e.*
    from calendar_event_derived_times e
    join periods p on e."start" < p.period_end and e."end" >= p.period_start
    where not exists (
      select 1
      from calendar_event_tag_nodes n
      where n.calendar_event_id = e.id
        and n.tag_path in ('Aspect / Phase / Forming', 'Aspect / Phase / Dissolving')
    )
    {filter}
  )
  select e.period{columns}
  from events_in_periods e{levels}{where}
  group by e.period{groupBy}
`;

/** One level; none of its keys is the no-key group. */
export const METRIC_LEVEL_SQL = `
  cross join lateral (
    select r."key", r.label, r."path", r."rank",
      false as skipped,
      r."key" as effective,
      {parentId} || '/{level}:' || coalesce(r."key", '') as id
    from (select 1) one
    left join lateral (
      select s."key", s.label, s."path", s."rank"
      from ({source}) s
      where s."key" is not null
    ) r on true
  ) l{level}`;

/** A level that splits only its parent tag's group. */
export const METRIC_REFINING_LEVEL_SQL = `
  cross join lateral (
    select r."key", r.label, r."path", r."rank",
      one.skipped,
      case when one.skipped then {parentEffective} else r."key" end as effective,
      case
        when one.skipped then {parentId}
        else {parentId} || '/{level}:' || coalesce(r."key", '')
      end as id
    from (select {parentEffective} is distinct from {parent}::text as skipped) one
    left join lateral (
      select s."key", s.label, s."path", s."rank"
      from ({source}) s
      where s."key" is not null and not one.skipped
    ) r on true
  ) l{level}`;
