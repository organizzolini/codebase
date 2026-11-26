import { z } from "zod";

import {
  EVENTS_LOCAL_SQL,
  TAG_INFO_SQL,
} from "./modules/filtering/modules/query-building/event-filter-sql.constants";

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

/** Events in scope overlapping a period, with tags and group keys. */
export const EVENTS_IN_PERIOD_SQL = `
  with ${TAG_INFO_SQL}
  select
    e.id,
    e.duration_minutes,
    e."end",
    e."name",
    e.note,
    e."start",
    e.start_local_day,
    e.start_local_hour,
    e.timezone,
    coalesce(
      (
        select json_agg(
          json_build_object(
            'depth', t.tag_depth,
            'id', t.tag_id,
            'name', t.tag_name,
            'path', t.tag_path,
            'slug', et_tag.slug
          )
          order by t.tag_path collate "C"
        )
        from calendar_event_tags et
        join tag_paths t on t.tag_id = et.tag_id
        join tags et_tag on et_tag.id = et.tag_id
        where et.calendar_event_id = e.id
      ),
      '[]'::json
    ) as tags {groups}
  from ${EVENTS_LOCAL_SQL} e
  where e."start" < $1::timestamptz and e."end" >= $2::timestamptz
    and {scope}
    {filter}
  order by e."start", e."name" collate "C", e.id
`;

/** A tag an event carries, as {@link EVENTS_IN_PERIOD_SQL} gathers it. */
export const tagSchema = z.object({
  depth: z.number(),
  id: z.string(),
  name: z.string(),
  path: z.string(),
  slug: z.string(),
});

/** The group keys of one level, gathered into a `group_<level>` column. */
export const groupKeysSchema = z.array(
  z.object({
    key: z.string(),
    label: z.string().nullable(),
    path: z.string().nullable(),
    rank: z.string().nullish().default(null),
  }),
);

/** One row of the events query; grouping columns are read apart. */
export const eventRowSchema = z.looseObject({
  duration_minutes: z.number(),
  end: z.date(),
  id: z.string(),
  name: z.string(),
  note: z.string(),
  start: z.date(),
  start_local_day: z.string(),
  start_local_hour: z.number(),
  tags: z.array(tagSchema),
  timezone: z.string(),
});

/** Every tag with its root, path, and count of matching events. */
export const FACETS_SQL = `
  with ${TAG_INFO_SQL},
  in_period as (
    select e.id
    from ${EVENTS_LOCAL_SQL} e
    where e."start" < coalesce($1::timestamptz, 'infinity')
      and e."end" >= coalesce($2::timestamptz, '-infinity')
      {filter}
  ),
  tag_counts as (
    select z.tag_id, count(*) as count
    from (
      select distinct c.ancestor_id as tag_id, et.calendar_event_id
      from calendar_event_tags et
      join in_period w on w.id = et.calendar_event_id
      join tag_trees c on c.descendant_id = et.tag_id
    ) z
    group by z.tag_id
  )
  select
    n.tag_id as id,
    n.tag_name as "name",
    n.tag_depth as depth,
    n.tag_root_id as root_id,
    substr(n.tag_path, length(r."name") + length(' / ') + 1) as path_below_root,
    case when n.tag_depth > 0
      then substr(n.tag_path, 1, length(n.tag_path) - length(n.tag_name) - length(' / '))
    end as parent_path,
    n.tag_rank,
    n.tag_parent_id as parent_id,
    coalesce(c.count, 0) as count,
    t.icon,
    t.is_filterable,
    t.is_groupable,
    t.is_selectable,
    t.is_sortable,
    t.note,
    t.rank,
    t.slug
  from tag_paths n
  join tags t on t.id = n.tag_id
  join tags r on r.id = n.tag_root_id
  left join tag_counts c on c.tag_id = n.tag_id
  order by n.tag_path collate "C"
`;

/** One row of {@link FACETS_SQL}; Postgres answers counts as text. */
export const facetRowSchema = z.object({
  count: z.coerce.number(),
  depth: z.coerce.number(),
  icon: z.string().nullish().default(null),
  id: z.string(),
  is_filterable: z.boolean().default(true),
  is_groupable: z.boolean().default(true),
  is_selectable: z.boolean().default(true),
  is_sortable: z.boolean().default(true),
  name: z.string(),
  note: z.string().nullish().default(null),
  parent_id: z.string().nullish().default(null),
  parent_path: z.string().nullish().default(null),
  path_below_root: z.string(),
  rank: z.coerce.number().default(0),
  root_id: z.string(),
  slug: z.string(),
  tag_rank: z.string(),
});

/** Compares text counting digits as numbers: "Harmonic 2" precedes "Harmonic 10". */
export const NATURAL_COLLATOR = new Intl.Collator("en-US", { numeric: true });
