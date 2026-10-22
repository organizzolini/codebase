// Timestamps are ISO 8601 text in UTC, so comparing them as text orders them
// in time.

/**
 * The events that overlap a window, earliest first, each with the tags it was
 * given as a JSON array, read through the post-export views. Binds the
 * group sources that replace `{groups}`, then the window's end, then its
 * start, then whatever condition replaces `{filter}`; ends are compared
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
        from calendar_event_tag_nodes t
        where t.calendar_event_id = e.id and t.is_direct = 1
        order by t.tag_path
      ) t
    ) as tags {groups}
  from calendar_events_derived e
  where e."start" < ? and e."end" >= ? {filter}
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

/**
 * Every tag in the tree with its root, its path beneath that root, and the
 * number of events it matches among those that overlap a window, its
 * descendants' included, roots and their tags each in path order. Binds the
 * window's end, then its start.
 */
export const FACETS_SQL = `
  with in_window as (
    select e.id
    from calendar_events e
    where e."start" < ? and e."end" >= ?
  ),
  tag_counts as (
    select t.tag_id, count(*) as count
    from calendar_event_tag_nodes t
    join in_window w on w.id = t.calendar_event_id
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
  order by n."path"
`;

/**
 * The window that holds every event, for counting the tags over the whole
 * dataset.
 */
export const WHOLE_DATASET_WINDOW = {
  end: new Date("9999-12-31T23:59:59.999Z"),
  start: new Date("0000-01-01T00:00:00.000Z"),
} as const;

/**
 * Gathers one level's group rows into a JSON array column, in place of
 * `{source}`, named by `{column}`.
 */
export const GROUP_COLUMN_SQL = `,
    (
      select json_group_array(
        json_object('key', g."key", 'label', g.label, 'path', g."path")
      )
      from ({source}) g
    ) as {column}`;
