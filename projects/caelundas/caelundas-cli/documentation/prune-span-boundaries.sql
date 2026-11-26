-- Instants a stored span starts or ends on, no longer stored.
-- An upsert never deletes rows it stops generating, so earlier runs' instants
-- stay. This lists them in the temporary table `excess_events`, prints how many
-- each family would remove, and changes no stored row.

-- Run it after the run that stores the spans: an instant stays unless a span of
-- its family, for the same observer, starts or ends on its minute.
--
--   psql ... -f prune-span-boundaries.sql

-- To delete them, in one transaction (the tag links go with them):
--
--   psql ... -1 -f prune-span-boundaries.sql \
--     -c "delete from calendar_events where id in (select id from excess_events)"

-- Then refresh the facts: nx run caelundas-cli:start:refresh-metrics

-- The families are `SPAN_BOUNDARY_RULES` in `progressive.constants.ts`, by the
-- tag paths the raw tags classify under. The edge is the end of the span the
-- instant sits on: `start`, `end` or `either`.
set search_path to caelundas;

create temporary table excess_events as
with recursive tag_paths (id, tag_path) as (
    select
        t.id,
        t."name"::text
    from tags as t
    where
        not exists (
            select 1 from tag_edges as e
            where e.target_node = t.id
        )
    union all
    select
        t.id,
        p.tag_path || ' / ' || t."name"
    from tag_paths as p
    inner join tag_edges as e on p.id = e.source_node
    inner join tags as t on e.target_node = t.id
),

rules (rule_family, instant_paths, edge, span_paths) as (
    values
    ('aspect forming', array['Aspect / Phase / Forming'], 'start', array['Aspect / Simple', 'Aspect / Compound']),
    ('aspect dissolving', array['Aspect / Phase / Dissolving'], 'end', array['Aspect / Simple', 'Aspect / Compound']),
    ('moon phase', array['Lunar / Monthly Cycle'], 'either', array['Lunar / Monthly Cycle']),
    ('lunar apsis', array['Lunar / Apsides'], 'either', array['Lunar / Apsides']),
    (
        'planetary rise, set, elongation, opposition',
        array[
            'Planetary / Synodic Stage / Rise and set',
            'Planetary / Synodic Stage / Elongation',
            'Planetary / Synodic Stage / Opposition'
        ],
        'either',
        array['Planetary / Phase']
    ),
    ('eclipse beginning', array['Eclipse / Phase / Beginning'], 'start', array['Eclipse / Frame']),
    ('eclipse ending', array['Eclipse / Phase / Ending'], 'end', array['Eclipse / Frame']),
    (
        'station',
        array['Planetary / Direction / Station Retrograde', 'Planetary / Direction / Station Direct'],
        'either',
        array['Planetary / Direction / Retrograde Period', 'Planetary / Direction / Direct Period']
    ),
    ('ingress', array['Zodiac'], 'either', array['Zodiac']),
    ('solar year point', array['Solar / Annual Cycle'], 'either', array['Solar / Annual Cycle']),
    ('moonrise', array['Daily / Lunar Cycle / Rise'], 'start', array['Daily / Lunar Cycle']),
    ('moonset', array['Daily / Lunar Cycle / Set'], 'end', array['Daily / Lunar Cycle']),
    ('twilight boundary', array['Daily / Twilight'], 'either', array['Daily / Twilight'])
),

span_edges as (
    select distinct
        r.rule_family,
        s.latitude,
        s.longitude,
        x.side,
        x.edge_at
    from rules as r
    inner join tag_paths as sp on sp.tag_path = any(r.span_paths)
    inner join tag_trees as sc on sp.id = sc.ancestor_id
    inner join calendar_event_tags as st on sc.descendant_id = st.tag_id
    inner join calendar_events as s on st.calendar_event_id = s.id
    cross join lateral (values ('start', s."start"), ('end', s."end")) as x (side, edge_at)
    where s."start" < s."end"
)

select distinct
    r.rule_family,
    i.id
from rules as r
inner join tag_paths as ip on ip.tag_path = any(r.instant_paths)
inner join tag_trees as ic on ip.id = ic.ancestor_id
inner join calendar_event_tags as it on ic.descendant_id = it.tag_id
inner join calendar_events as i on it.calendar_event_id = i.id
inner join span_edges as e
    on
        r.rule_family = e.rule_family
        and i.latitude = e.latitude
        and i.longitude = e.longitude
        and i."start" = e.edge_at
        and (r.edge = 'either' or r.edge = e.side)
where i."start" = i."end";

select
    rule_family,
    count(*) as events
from excess_events
group by rule_family
order by rule_family;

select count(distinct id) as excess_events
from excess_events;
