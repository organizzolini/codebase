import { z } from "zod";

// ♟️ Constants

/**
 * The span and zone of the whole dataset, or no row when it is empty. The
 * zone is the most common one, because the app shows one observer location.
 */
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

/**
 * The events that overlap a window, earliest first, each with the tags it was
 * given as a JSON array, read through the derived-times view. Binds the
 * window's end, then its start; ends are compared inclusively so an instant
 * at the window's first moment is still found. The instants where an aspect
 * begins forming or dissolves are left out, since the event that spans the
 * aspect says as much; they stay in the data. Text sorts by bytes, as the
 * web app's SQLite did, rather than by the database's locale.
 */
export const EVENTS_IN_WINDOW_SQL = `
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
    ) as tags
  from calendar_event_derived_times e
  where e."start" < $1::timestamptz and e."end" >= $2::timestamptz
    and not exists (
      select 1
      from calendar_event_tag_nodes n
      where n.calendar_event_id = e.id
        and n.tag_path in ('Phase / Forming', 'Phase / Dissolving')
    )
  order by e."start", e."summary" collate "C", e.id
`;

/** A tag an event carries, as {@link EVENTS_IN_WINDOW_SQL} gathers it. */
export const tagSchema = z.object({
  depth: z.number(),
  id: z.string(),
  name: z.string(),
  path: z.string(),
});

/** One row of {@link EVENTS_IN_WINDOW_SQL}. */
export const eventRowSchema = z.object({
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
