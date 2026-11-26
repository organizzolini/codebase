# Catalog tables

The reference rows beneath the metrics: the `dimensions` events are sliced by and
their roll-up graph, the `groups` that are sets of dimensions, the `filters` that
instantiate a group, and the `measures` the facts hold. Regenerate the tables below
from a database with the facts built by running each query with `psql`, then format
the file; the queries are listed at the end.

## Dimensions

The `tag` dimension is flat, and its values are the rows of `tags` and their
closure (`tag_closures`, over the `tag_edges` graph). The `name` dimension is flat too: its values are the distinct event names.
The time dimensions are a graph. An event is base data in `calendar_events`, not a
dimension.

| slug    | name    | icon           | note                                                                                      |
| ------- | ------- | -------------- | ----------------------------------------------------------------------------------------- |
| day     | Day     | calendar-days  | One local day, the date of the events' start in their own zone.                           |
| month   | Month   | calendar       | One month of local days.                                                                  |
| name    | Name    | type           | One distinct event name, so the recurrences of an event aggregate.                        |
| quarter | Quarter | calendar-fold  | One quarter of local days.                                                                |
| tag     | Tag     | tag            | One tag of the tag tree, with its descendants; the values are the rows of the tags table. |
| week    | Week    | calendar-range | One week of local days.                                                                   |
| year    | Year    | calendar-1     | One year of local days.                                                                   |

### Dimension edges

A `@Graph` edge from a finer dimension to the coarser one it rolls up into. A day
has two parents.

| finer (source) | coarser (target) |
| -------------- | ---------------- |
| day            | month            |
| day            | week             |
| month          | quarter          |
| quarter        | year             |

## Groups

A group is a set of dimensions (`group_dimensions`). Each is one dimension for now.

| slug    | name    | icon           | dimensions | note                          |
| ------- | ------- | -------------- | ---------- | ----------------------------- |
| day     | Day     | calendar-days  | day        | One local day.                |
| month   | Month   | calendar       | month      | One month.                    |
| name    | Name    | type           | name       | One event name.               |
| quarter | Quarter | calendar-fold  | quarter    | One quarter.                  |
| tag     | Tag     | tag            | tag        | One tag with its descendants. |
| week    | Week    | calendar-range | week       | One week.                     |
| year    | Year    | calendar-1     | year       | One year.                     |

## Filters

A filter is a group instantiated, pinning a `period` for a time dimension, an
`event_name` for the name dimension or a `tag_id` for the tag dimension. There is no
filter for the default scope: the facts are its by definition, the predicate being
in the comment on the `calendar_event_facts` table.

Filters per group on the 50,113 development events:

| group | filters |
| ----- | ------- |
| day   | 365     |
| tag   | 42368   |

A sample, the filters of 14 March 2026 for a few tags: the whole day, then each tag
beneath its parent tag's filter of that day, or the day's for a root. A tag's name is
read from `tags` through `tag_id`; the filter stores none, and carries the day's
`period` as well.

| group | period     | tag    | parent         | filter id                            |
| ----- | ---------- | ------ | -------------- | ------------------------------------ |
| tag   | 2026-03-14 | Body   | day 2026-03-14 | 01a218d4-eafa-7a07-bb25-c696ed71e16a |
| tag   | 2026-03-14 | Mars   | Personal       | 01a218d4-ea9f-795d-912e-ac9ae552172a |
| tag   | 2026-03-14 | Planet | Body           | 01a218d4-ea2d-7fb0-8338-af9cf2b205c8 |
| tag   | 2026-03-14 | Sun    | Luminary       | 01a218d4-ea3e-77fb-83f7-d8179b01cf8e |
| day   | 2026-03-14 |        | none           | 01a218d4-e944-7428-a3f3-1d82b9f432e7 |

## Measures

The 18 measures. Those of the facts are `events`, `perfective-events`,
`progressive-events`, `duration`, `first-start` and `last-start`; the others do not
merge across days and are computed from the events. The unit `instant` is a point in
time, the start of an event, and is not an event kind.

| slug                                 | name                                 | unit     | icon                | note                                                                                         |
| ------------------------------------ | ------------------------------------ | -------- | ------------------- | -------------------------------------------------------------------------------------------- |
| clipped-duration                     | Clipped duration                     | duration | layers-2            | The events' lengths inside the period added up, in minutes; overlaps count once per event.   |
| covered-clipped-duration             | Covered clipped duration             | duration | layers              | How long inside the period at least one event is under way, in minutes; overlaps count once. |
| covered-duration                     | Covered duration                     | duration | layers              | How long at least one progressive event is under way, in minutes; overlaps count once.       |
| days-with-events                     | Days with events                     | count    | calendar-days       | The local days an event starts on, each counted once.                                        |
| duration                             | Duration                             | duration | timer               | The lengths of the events added up, in minutes; a perfective event lasts none.               |
| events                               | Events                               | count    | hash                | Events counted, one each.                                                                    |
| first-start                          | First start                          | instant  | arrow-left-to-line  | When the earliest event starts, in epoch milliseconds.                                       |
| last-start                           | Last start                           | instant  | arrow-right-to-line | When the latest event starts, in epoch milliseconds.                                         |
| longest-progressive-duration         | Longest progressive duration         | duration | arrow-up-to-line    | The length of the longest progressive event, in minutes.                                     |
| median-progressive-duration          | Median progressive duration          | duration | scale               | The middle length of the progressive events, in minutes, half shorter and half longer.       |
| perfective-events                    | Perfective events                    | count    | circle-dot          | Events that happen at a moment and last no time.                                             |
| period-length                        | Period length                        | duration | ruler               | The length of the period measured, in minutes.                                               |
| progressive-clipped-duration         | Progressive clipped duration         | duration | layers-2            | The Progressive events' lengths inside the period added up, in minutes.                      |
| progressive-covered-clipped-duration | Progressive covered clipped duration | duration | layers              | How long inside the period at least one Progressive event is under way, in minutes.          |
| progressive-events                   | Progressive events                   | count    | move-horizontal     | Events that last a while and have a start and an end.                                        |
| shortest-progressive-duration        | Shortest progressive duration        | duration | arrow-down-to-line  | The length of the shortest progressive event, in minutes.                                    |
| unique-names                         | Unique names                         | count    | fingerprint         | The different event names, each counted once.                                                |
| unique-tags                          | Unique tags                          | count    | tags                | The different tags events carry directly, each counted once.                                 |

## Sample facts

Ten rows of `calendar_event_facts` for 14 March 2026, each with the measure's name
and unit joined; the unit is the measure's, never a column of the fact. An instant
is epoch milliseconds, a duration whole minutes.

| measure            | name               | unit     | tag       | day        | measurement   |
| ------------------ | ------------------ | -------- | --------- | ---------- | ------------- |
| duration           | Duration           | duration | whole set | 2026-03-14 | 99427         |
| events             | Events             | count    | whole set | 2026-03-14 | 92            |
| first-start        | First start        | instant  | whole set | 2026-03-14 | 1773461820000 |
| last-start         | Last start         | instant  | whole set | 2026-03-14 | 1773547020000 |
| perfective-events  | Perfective events  | count    | whole set | 2026-03-14 | 53            |
| progressive-events | Progressive events | count    | whole set | 2026-03-14 | 39            |
| duration           | Duration           | duration | Moon      | 2026-03-14 | 13612         |
| events             | Events             | count    | Moon      | 2026-03-14 | 52            |
| first-start        | First start        | instant  | Moon      | 2026-03-14 | 1773461820000 |
| last-start         | Last start         | instant  | Moon      | 2026-03-14 | 1773545460000 |

## The queries

```sql
select slug, name, icon, note from dimensions order by slug;

select s.slug, t.slug from dimension_edges e join dimensions s on s.id = e.source_node join dimensions t on t.id = e.target_node order by s.slug, t.slug;

select g.slug, g.name, g.icon, string_agg(d.slug, ' + ' order by d.slug), g.note
from "groups" g join group_dimensions gd on gd.group_id = g.id join dimensions d on d.id = gd.dimension_id
group by g.id order by g.slug;

select g.slug, count(*) from filters f join "groups" g on g.id = f.group_id group by g.slug order by g.slug;

select g.slug, f.period::text, coalesce(t.name, ''), coalesce(pt.name, case when p.id is not null then 'day ' || p.period::text else 'none' end), f.id::text
from filters f join "groups" g on g.id = f.group_id left join tags t on t.id = f.tag_id
left join filters p on p.id = f.parent_id left join tags pt on pt.id = p.tag_id
where f.period = '2026-03-14' and (t.name in ('Body', 'Planet', 'Mars', 'Sun') or t.id is null)
order by g.slug desc, t.name nulls first;

select slug, name, unit, icon, note from measures order by slug collate "C";

select m.slug, m.name, m.unit, coalesce(t.name, 'whole set'), f.period::text, r.measurement::text
from calendar_event_facts r join measures m on m.id = r.measure_id join filters f on f.id = r.filter_id left join tags t on t.id = f.tag_id
where f.period = '2026-03-14' and (t.name in ('Moon', 'Sun') or t.id is null)
order by t.name nulls first, m.slug limit 10;
```
