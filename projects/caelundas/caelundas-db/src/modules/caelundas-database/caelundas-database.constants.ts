// ♟️ Constants

/** The project whose `CAELUNDAS_POSTGRES_*` variables, database, schema, and role every connection uses. */
export const CAELUNDAS_PROJECT = "caelundas";

/** Lat/long column digits: nine in all, six after the point. */
export const COORDINATE_PRECISION = 9;

/** The digits after the point in a latitude or longitude. */
export const COORDINATE_SCALE = 6;

/** Statements rebuilding derived tag tables, in run order; names unqualified. */
export const READ_MODEL_STATEMENTS = [
  "delete from calendar_event_tag_nodes",
  "delete from tag_nodes",
  // Each tag with its depth (ancestor count, so a root is 0), root, and full path.
  // Its root is the ancestor at closure level 1.
  `insert into tag_nodes (id, name, depth, root_id, path)
with levels as (
    select
        descendant_id as id,
        count(*) as level
    from tags_closure
    group by descendant_id
)
select
    t.id,
    t.name,
    own.level - 1 as depth,
    (array_agg(a.id order by ancestor_level.level))[1] as root_id,
    string_agg(a.name, ' / ' order by ancestor_level.level) as path
from tags as t
inner join levels as own on t.id = own.id
inner join tags_closure as c on t.id = c.descendant_id
inner join tags as a on c.ancestor_id = a.id
inner join levels as ancestor_level on a.id = ancestor_level.id
group by t.id, t.name, own.level`,
  // One row per event and tag it carries, including every ancestor of the
  // tags attached to it, so grouping or filtering on a node also finds
  // everything beneath it. `is_direct` marks the tags the event was given
  // itself.
  `insert into calendar_event_tag_nodes (
    calendar_event_id, tag_id, tag_name, tag_depth, tag_root_id, tag_path, is_direct
)
select
    et.calendar_event_id,
    n.id,
    n.name,
    n.depth,
    n.root_id,
    n.path,
    count(*) filter (where c.ancestor_id = c.descendant_id) > 0
from calendar_event_tags as et
inner join tags_closure as c on et.tag_id = c.descendant_id
inner join tag_nodes as n on c.ancestor_id = n.id
group by et.calendar_event_id, n.id, n.name, n.depth, n.root_id, n.path`,
] as const;
