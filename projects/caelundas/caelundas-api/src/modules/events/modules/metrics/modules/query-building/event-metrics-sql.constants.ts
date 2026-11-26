import {
  EVENTS_LOCAL_SQL,
  PROGRESSIVE_TAG_PATH,
  TAG_INFO_SQL,
} from "../../../filtering/modules/query-building/event-filter-sql.constants";

// ♟️ Constants

/** Whether the raw event `e` carries the progressive tag. */
const PROGRESSIVE_SQL = `exists (
    select 1
    from calendar_event_tags pet
    join tags_closure pc on pc.descendant_id = pet.tag_id
    where pet.calendar_event_id = e.id
      and pc.ancestor_id in (
        select p.tag_id
        from tag_info p
        where p.tag_path = '${PROGRESSIVE_TAG_PATH}'
      )
  )`;

/** An event's whole minutes. */
const MINUTES_SQL = `floor(extract(epoch from e."end" - e."start") / 60)::integer`;

// Computed from the raw event `e` and its tags, so the raw statements read what
// the facts hold.
/** The columns of a facts event row, from the base tables. */
export const RAW_EVENT_COLUMN_SQL: Readonly<Record<string, string>> = {
  ancestor_tag_ids: `array(select distinct c.ancestor_id from calendar_event_tags t join tags_closure c on c.descendant_id = t.tag_id and c.ancestor_id <> c.descendant_id where t.calendar_event_id = e.id order by c.ancestor_id)`,
  covered_range: `tstzmultirange(tstzrange(e."start", e."end"))`,
  day: `e.start_local_day::date`,
  duration_minutes: MINUTES_SQL,
  events: `1`,
  first_start: `e."start"`,
  is_progressive: PROGRESSIVE_SQL,
  last_start: `e."start"`,
  perfective_events: `(e."start" = e."end")::int`,
  progressive_events: `(e."start" < e."end")::int`,
  tag_ids: `array(select t.tag_id from calendar_event_tags t where t.calendar_event_id = e.id order by t.tag_id)`,
};

/** The columns the raw events already hold. */
export const RAW_CARRIED_COLUMNS: ReadonlySet<string> = new Set([
  "duration_minutes",
]);

/** Limits tags to those beneath `{root}`. */
export const TAG_ROOT_SQL = ` and t.tag_id <> {root}::uuid and exists (
      select 1
      from tags_closure c
      where c.ancestor_id = {root}::uuid and c.descendant_id = t.tag_id
    )`;

/** The events in the periods, a row per period. */
export const EVENT_METRICS_SQL = `
  with ${TAG_INFO_SQL},
  periods (period, period_start, period_end) as (
    values {periods}
  ),
  events_in_periods as (
    select p.period, p.period_start, p.period_end, e.*{extra}
    from ${EVENTS_LOCAL_SQL} e
    join periods p on e."start" < p.period_end and e."end" >= p.period_start
    where {scope}
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
