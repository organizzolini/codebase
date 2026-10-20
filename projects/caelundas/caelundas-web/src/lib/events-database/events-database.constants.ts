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
 * number of events it matches, its descendants' included, roots and their
 * tags each in path order.
 */
export const FACETS_SQL = `
  select
    n.id,
    n."name",
    n.depth,
    n.root_id,
    substr(n."path", length(r."name") + length(' / ') + 1) as path_below_root,
    (
      select count(*)
      from calendar_event_tag_nodes t
      where t.tag_id = n.id
    ) as count
  from tag_nodes n
  join tag_nodes r on r.id = n.root_id
  order by n."path"
`;

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
