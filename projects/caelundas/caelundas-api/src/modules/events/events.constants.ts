import { z } from "zod";

// ♟️ Constants

/** What a filter argument keeps, written once for both queries. */
export const EVENT_FILTER_ARGUMENT_DESCRIPTION =
  "Keeps only the events that meet this nested AND/OR filter; rules that are not finished are left out.";

/** What the grouping argument reads, written once. */
export const EVENT_GROUPING_ARGUMENT_DESCRIPTION =
  "The levels to read each event's group keys for, and the field it is colored by; each event comes back with one list of keys per level, so an event with two planets is under both and one with no key at a level has an empty list there.";

/** Dataset span and its common zone; the app shows one place. */
export const DATASET_SQL = `
  select
    count(*) as count,
    min(e."start") as "start",
    max(e."end") as "end",
    (
      select z.timezone
      from calendar_events z
      group by z.timezone
      order by count(*) desc, z.timezone collate "C"
      limit 1
    ) as timezone
  from calendar_events e
  having count(*) > 0
`;

/** One row of {@link DATASET_SQL}; Postgres answers a count as text. */
export const datasetRowSchema = z.object({
  count: z.coerce.number(),
  end: z.date(),
  start: z.date(),
  timezone: z.string(),
});

/** Events overlapping a period, minus aspect forming and dissolving instants. */
export const EVENTS_IN_PERIOD_SQL = `
  select
    e.id,
    e.color,
    e.description,
    e.duration_minutes,
    e."end",
    e."location",
    e."start",
    e.start_local_day,
    e.start_local_hour,
    e."summary",
    e.timezone,
    coalesce(
      (
        select json_agg(
          json_build_object(
            'depth', t.tag_depth,
            'id', t.tag_id,
            'name', t.tag_name,
            'path', t.tag_path
          )
          order by t.tag_path collate "C"
        )
        from calendar_event_tag_nodes t
        where t.calendar_event_id = e.id and t.is_direct
      ),
      '[]'::json
    ) as tags {groups}
  from calendar_event_derived_times e
  where e."start" < $1::timestamptz and e."end" >= $2::timestamptz
    and not exists (
      select 1
      from calendar_event_tag_nodes n
      where n.calendar_event_id = e.id
        and n.tag_path in ('Phase / Forming', 'Phase / Dissolving')
    )
    {filter}
  order by e."start", e."summary" collate "C", e.id
`;

/** A tag an event carries, as {@link EVENTS_IN_PERIOD_SQL} gathers it. */
export const tagSchema = z.object({
  depth: z.number(),
  id: z.string(),
  name: z.string(),
  path: z.string(),
});

/** The group keys of one level, gathered into a `group_<level>` column. */
export const groupKeysSchema = z.array(
  z.object({
    key: z.string(),
    label: z.string().nullable(),
    path: z.string().nullable(),
  }),
);

/** One row of the events query; grouping columns are read apart. */
export const eventRowSchema = z.looseObject({
  color: z.string().nullable(),
  description: z.string(),
  duration_minutes: z.number(),
  end: z.date(),
  id: z.string(),
  location: z.string().nullable(),
  start: z.date(),
  start_local_day: z.string(),
  start_local_hour: z.number(),
  summary: z.string(),
  tags: z.array(tagSchema),
  timezone: z.string(),
});

/** Every tag with its root, path, and count of matching events. */
export const FACETS_SQL = `
  with in_period as (
    select e.id
    from calendar_event_derived_times e
    where e."start" < coalesce($1::timestamptz, 'infinity')
      and e."end" >= coalesce($2::timestamptz, '-infinity')
      {filter}
  ),
  tag_counts as (
    select t.tag_id, count(*) as count
    from calendar_event_tag_nodes t
    join in_period w on w.id = t.calendar_event_id
    group by t.tag_id
  )
  select
    n.id,
    n."name",
    n.depth,
    n.root_id,
    substr(n."path", length(r."name") + length(' / ') + 1) as path_below_root,
    coalesce(c.count, 0) as count
  from tag_nodes n
  join tag_nodes r on r.id = n.root_id
  left join tag_counts c on c.tag_id = n.id
  order by n."path" collate "C"
`;

/** One row of {@link FACETS_SQL}; Postgres answers counts as text. */
export const facetRowSchema = z.object({
  count: z.coerce.number(),
  depth: z.coerce.number(),
  id: z.string(),
  name: z.string(),
  path_below_root: z.string(),
  root_id: z.string(),
});
