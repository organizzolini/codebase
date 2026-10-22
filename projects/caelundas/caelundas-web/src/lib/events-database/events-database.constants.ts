// Timestamps are ISO 8601 text in UTC, so comparing them as text orders them
// in time.

/**
 * The events that overlap a window, earliest first, each with the tags it was
 * given as a JSON array, read through the post-export views. Binds the window's end, then its start; ends are compared
 * inclusively so an instant at the window's first moment is still found.
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
    e."summary",
    e.timezone,
    (
      select json_group_array(
        json_object(
          'depth', t.tag_depth,
          'id', t.tag_id,
          'name', t.tag_name,
          'path', t.tag_path
        )
      )
      from (
        select t.tag_depth, t.tag_id, t.tag_name, t.tag_path
        from calendar_event_tags t
        where t.calendar_event_id = e.id and t.is_direct = 1
        order by t.tag_path
      ) t
    ) as tags
  from calendar_events_derived e
  where e."start" < ? and e."end" >= ?
  order by e."start", e."summary"
`;

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
      order by count(*) desc, z.timezone
      limit 1
    ) as timezone
  from calendar_events e
  having count(*) > 0
`;
