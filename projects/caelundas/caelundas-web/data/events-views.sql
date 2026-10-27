-- What the web app reads, created over the exported tables after every
-- export. The export copies tables only, so everything derived lives here.
-- The file is read-only once built, so the tag tree's derived rows are
-- written out as tables, once, rather than recomputed by every query as
-- views would be: the tree's depth, root and path take a correlated
-- subquery per tag, which every grouping and filter on a tag would pay again.

-- Every tag with its place in the tree: its depth (the number of ancestors,
-- so a root is 0), its root, and its full path from that root.
create table tag_nodes as
select
    t.id,
    t."name",
    (
        select count(*) - 1
        from tags_closure c
        where c.descendant_id = t.id
    ) as depth,
    (
        select c.ancestor_id
        from tags_closure c
        where
            c.descendant_id = t.id
            and not exists (
                select 1
                from tags_closure p
                where p.descendant_id = c.ancestor_id and p.ancestor_id != c.ancestor_id
            )
    ) as root_id,
    (
        select group_concat(a."name", ' / ' order by a.ancestor_depth)
        from (
            select
                ancestor."name",
                (
                    select count(*)
                    from tags_closure d
                    where d.descendant_id = ancestor.id
                ) as ancestor_depth
            from tags_closure c
            join tags ancestor on ancestor.id = c.ancestor_id
            where c.descendant_id = t.id
        ) a
    ) as "path"
from tags t;

-- One row per event and tag it carries, including every ancestor of the tags
-- attached to it, so grouping or filtering on a node also finds everything
-- beneath it. `is_direct` marks the tags the event was given itself.
create table calendar_event_tag_nodes as
select
    et.calendar_event_id,
    n.id as tag_id,
    n."name" as tag_name,
    n.depth as tag_depth,
    n.root_id as tag_root_id,
    n."path" as tag_path,
    max(c.ancestor_id = c.descendant_id) as is_direct
from calendar_event_tags et
join tags_closure c on c.descendant_id = et.tag_id
join tag_nodes n on n.id = c.ancestor_id
group by et.calendar_event_id, n.id;

-- Each event with the time and duration columns grouping and filtering read,
-- derived from its start and end. Times are UTC: SQLite has no zone data.
create view calendar_events_derived as
select
    e.*,
    (strftime('%s', e."end") - strftime('%s', e."start")) / 60 as duration_minutes,
    case when e."start" = e."end" then 'Instant' else 'Duration' end as temporality,
    cast(strftime('%Y', e."start") as integer) as start_year,
    (cast(strftime('%m', e."start") as integer) + 2) / 3 as start_quarter,
    cast(strftime('%m', e."start") as integer) as start_month,
    cast(strftime('%W', e."start") as integer) as start_week,
    date(e."start") as start_day,
    cast(strftime('%w', e."start") as integer) as start_weekday,
    cast(strftime('%H', e."start") as integer) as start_hour
from calendar_events e;

create index tag_nodes_id on tag_nodes (id);
create index calendar_event_tag_nodes_event on calendar_event_tag_nodes (calendar_event_id, tag_root_id, tag_depth);
create index calendar_event_tag_nodes_tag on calendar_event_tag_nodes (tag_id, calendar_event_id);
create index calendar_events_start_end on calendar_events ("start", "end");
create index calendar_event_tags_tag on calendar_event_tags (tag_id, calendar_event_id);
create index tags_closure_descendant on tags_closure (descendant_id, ancestor_id);
