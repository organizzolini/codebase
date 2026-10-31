-- Rewrites the read-model tables caelundas-web reads, from the tables a run
-- writes. The tag tree's depth, root and path take a correlated subquery per
-- tag, which every grouping and filter on a tag would pay again as a view, so
-- they are stored: every run ends by running this file again, and a database
-- built from the committed seed runs it once.

delete from calendar_event_tag_nodes;

delete from tag_nodes;

-- Every tag with its place in the tree: its depth (the number of ancestors,
-- so a root is 0), its root, and its full path from that root.
insert into tag_nodes (id, name, depth, root_id, path)
select
    t.id,
    t.name,
    (
        select count(*) - 1
        from tags_closure as c
        where c.descendant_id = t.id
    ) as depth,
    (
        select c.ancestor_id
        from tags_closure as c
        where
            c.descendant_id = t.id
            and not exists (
                select 1
                from tags_closure as p
                where p.descendant_id = c.ancestor_id and p.ancestor_id != c.ancestor_id
            )
    ) as root_id,
    (
        select
            group_concat(
                a."name", ' / '
                order by a.ancestor_depth
            )
        from (
            select
                ancestor."name",
                (
                    select count(*)
                    from tags_closure as d
                    where d.descendant_id = ancestor.id
                ) as ancestor_depth
            from tags_closure as c
            inner join tags as ancestor on c.ancestor_id = ancestor.id
            where c.descendant_id = t.id
        ) as a
    ) as path
from tags as t;

-- One row per event and tag it carries, including every ancestor of the tags
-- attached to it, so grouping or filtering on a node also finds everything
-- beneath it. `is_direct` marks the tags the event was given itself.
insert into calendar_event_tag_nodes (
    calendar_event_id, tag_id, tag_name, tag_depth, tag_root_id, tag_path, is_direct
)
select
    et.calendar_event_id,
    n.id as tag_id,
    n.name as tag_name,
    n.depth as tag_depth,
    n.root_id as tag_root_id,
    n.path as tag_path,
    max(c.ancestor_id = c.descendant_id) as is_direct
from calendar_event_tags as et
inner join tags_closure as c on et.tag_id = c.descendant_id
inner join tag_nodes as n on c.ancestor_id = n.id
group by et.calendar_event_id, n.id;
