# Metrics rollups: the pre-aggregation contract

The Charts and Totals layouts measure events over a date window, optionally
grouped by tag nodes, with a previous-period comparison. Four materialized
views hold everything those queries need, so a metric over a window is a scan
of a few thousand narrow rows, not of every event and every tag it carries.
Storage is spent freely: every view is denormalized, and every column a query
filters, groups or joins on is indexed.

`refreshReadModel(manager)` rebuilds `tag_nodes` and `calendar_event_tag_nodes`
and then refreshes the four views, concurrently, in the caller's transaction,
so an ingest needs nothing more. `CaelundasDatabaseService.refreshMetrics(manager)`
refreshes only the views, and `nx run caelundas-cli:start:refresh-metrics` does
the same from a shell (about 4.5 seconds on the 50,000 development events).

## Rules every view shares

- **The event set.** Events tagged `Aspect / Phase / Forming` or
  `Aspect / Phase / Dissolving` are left out of `calendar_event_facts` and so of
  every rollup: it is the standing exclusion the API already applies. Events
  with no tag at all are kept and appear in the whole-set views only.
- **A day is the event's local start day,** `(start at time zone timezone)::date`.
  A window is `local_day >= from and local_day < to`, so an event belongs to the
  window its start falls in. This differs from the raw overlap test
  (`start < to and end >= from`) only for an event that starts before the window
  and reaches into it; read those with the `calendar_event_facts.extent`
  overlap index when exact overlap is needed (see below).
- **Durations are whole seconds** (`bigint`); divide by 60 for minutes and by
  3600 for hours. Instants have a duration of 0.
- **Every period is a column:** `local_week` (the Monday), `local_month`,
  `local_quarter` (each the first day), `local_year`. A per-period chart is a
  `group by` on one of them over the window's rows.
- **`tag_id` is a node of the tag tree** (`tag_nodes.id`); a node's rows count
  every event carrying it directly or through a descendant, so a parent's
  figures already include its children's. `tag_depth` is 0 for a root, and a
  root's rows are the per-dimension rollup.
- **Previous period** is the same query over the previous `[from, to)`.
- **Indexes carry the unique key a concurrent refresh needs** and the lookups
  below; none is partial.

## The views

### `calendar_event_facts` (entity `CalendarEventFact`)

One row per counted event: the raw material for any query the rollups cannot
answer, with the local periods precomputed so none of them needs
`at time zone`, which Postgres cannot index.

| Column              | Type          | Meaning                                         |
| ------------------- | ------------- | ----------------------------------------------- |
| `calendar_event_id` | `uuid`        | the event; unique key                           |
| `name`              | `text`        | the event's summary                             |
| `start`, `end`      | `timestamptz` | as stored                                       |
| `local_day`         | `date`        | local start day                                 |
| `local_week`        | `date`        | Monday of the local week                        |
| `local_month`       | `date`        | first day of the month                          |
| `local_quarter`     | `date`        | first day of the quarter                        |
| `local_year`        | `bigint`      | local year                                      |
| `local_weekday`     | `bigint`      | 0 for Sunday                                    |
| `local_hour`        | `bigint`      | 0 to 23                                         |
| `duration_seconds`  | `bigint`      | whole seconds, 0 for an instant                 |
| `is_instant`        | `boolean`     | `start = end`                                   |
| `is_progressive`    | `boolean`     | carries `Temporality / Progressive`             |
| `span`              | `tstzrange`   | `[start, end)`, empty for an instant            |
| `extent`            | `tstzrange`   | `[start, end]`, so overlap is `extent && range` |
| `tag_ids`           | `uuid[]`      | every tag node carried, ancestors included      |
| `direct_tag_ids`    | `uuid[]`      | tag nodes the event was given directly          |

Indexes: unique `(calendar_event_id)`; `(local_day)`; `(local_day, local_hour)`;
`(local_weekday, local_day)`; `(start)`; `(name, local_day)`; GiST `(extent)`;
GIN `(tag_ids)`; GIN `(direct_tag_ids)`.

### `calendar_event_day_tag_rollups` (entity `CalendarEventDayTagRollup`)

Grain: one row per `(local_day, tag_id)` that has events. For one tag node on
one day it keeps the additive figures and the exact raw material of the rest.

| Column                       | Type             | Meaning                                                          |
| ---------------------------- | ---------------- | ---------------------------------------------------------------- |
| `local_day`                  | `date`           | key                                                              |
| `tag_id`                     | `uuid`           | key                                                              |
| `tag_name`                   | `text`           | the node's label                                                 |
| `tag_path`                   | `text`           | names from the root, joined with ` / `                           |
| `tag_depth`                  | `bigint`         | 0 for a root                                                     |
| `tag_root_id`                | `uuid`           | the node's dimension root                                        |
| `tag_order_key`              | `text`           | `00000:Name / 00002:Child`, sorts siblings by `order`, then name |
| `local_week` .. `local_year` | `date`, `bigint` | the day's periods                                                |
| `events`                     | `bigint`         | events carrying the node                                         |
| `direct_events`              | `bigint`         | of those, tagged with the node itself                            |
| `instants`, `spans`          | `bigint`         | `start = end`, `end > start`                                     |
| `duration_seconds`           | `bigint`         | sum of durations                                                 |
| `progressive_seconds`        | `bigint`         | sum of durations of the Progressive events                       |
| `first_start`, `last_start`  | `timestamptz`    | earliest and latest start                                        |
| `covered_range`              | `tstzmultirange` | union of the events' `[start, end)`                              |
| `span_duration_seconds`      | `bigint[]`       | every span's duration, ascending                                 |
| `direct_tag_ids`             | `uuid[]`         | tags given directly to events that carry this node, distinct     |

Indexes: unique `(local_day, tag_id)`; `(tag_id, local_day)`;
`(tag_root_id, local_day)`; `(tag_depth, local_day)`; and `(local_week |
local_month | local_quarter | local_year, tag_id)`.

### `calendar_event_day_tag_name_rollups` (entity `CalendarEventDayTagNameRollup`)

Grain: one row per `(local_day, tag_id, name)`. A distinct count of `name`
over a window is a tag's unique names, from far fewer rows than the events.

Columns: `local_day date`, `tag_id uuid`, `name text`, `tag_root_id uuid`,
`local_week`, `local_month`, `local_quarter` (`date`), `local_year bigint`,
`events bigint`.

Indexes: unique `(local_day, tag_id, name)`; `(tag_id, local_day, name)`;
`(tag_root_id, local_day, name)`; `(name, local_day)`.

### `calendar_event_day_rollups` (entity `CalendarEventDayRollup`)

Grain: one row per `local_day` that has events, with no tag: the whole set.
Its columns are those of the day × tag rollup without the `tag_*` and
`direct_events` columns, plus `event_names text[]` (the day's distinct event names,
ascending) and `direct_tag_ids uuid[]` (every tag given directly that day).
Untagged events are counted here and nowhere else.

Indexes: unique `(local_day)`; `(local_week)`; `(local_month)`;
`(local_quarter)`; `(local_year)`.

### Base table indexes added

`calendar_events`: `(end)` and `(latitude, longitude, start)`, beside the
existing `(start, end)`. `calendar_event_tag_nodes`: `(tag_path,
calendar_event_id)`, `(tag_root_id, tag_id)`, and a partial `(tag_id,
calendar_event_id) where is_direct`. `tag_nodes`: `(root_id, depth)` and
`(path)`.

## Computing each metric

Below, `:from` and `:to` are the window's local days. Replace
`calendar_event_day_tag_rollups` with `calendar_event_day_rollups` (and drop
`tag_id` from every `group by`) for the whole set; a statement that runs one
way and not the other says so. Group by a period by adding its column, such as
`local_month`, to the select and `group by`.

Unique counts of a group are computed as a `select distinct` and then a count,
which Postgres hashes: it is twice as fast as `count(distinct ...)` on these
rows. The whole-set and per-tag statements are exercised against the raw events
in `calendar-event-rollup.entity.integration.test.ts`, which keeps every one exact.

```sql
-- the window's rows, per tag node (the whole set uses calendar_event_day_rollups)
with w as not materialized (
    select * from calendar_event_day_tag_rollups
    where local_day >= :from and local_day < :to
)
```

| Metric                      | Per tag node (`w` above, `group by tag_id`)                                                                       | Whole set (`calendar_event_day_rollups`)           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `EVENTS`                    | `sum(events)`                                                                                                     | `sum(events)`                                      |
| `INSTANTS`                  | `sum(instants)`                                                                                                   | `sum(instants)`                                    |
| `SPANS`                     | `sum(spans)`                                                                                                      | `sum(spans)`                                       |
| `TOTAL_DURATION_MINUTES`    | `sum(duration_seconds) / 60.0`                                                                                    | same                                               |
| `PROGRESSIVE_HOURS`         | `sum(progressive_seconds) / 3600.0`                                                                               | same                                               |
| `FIRST_START`               | `extract(epoch from min(first_start)) * 1000`                                                                     | same                                               |
| `LAST_START`                | `extract(epoch from max(last_start)) * 1000`                                                                      | same                                               |
| `DAYS_WITH_EVENTS`          | `count(*)` (one row per day with events)                                                                          | `count(*)`                                         |
| `COVERED_MINUTES`           | `(select coalesce(sum(extract(epoch from upper(g) - lower(g))), 0) / 60 from unnest(range_agg(covered_range)) g)` | same                                               |
| `UNIQUE_NAMES`              | the name rollup, below                                                                                            | `count(distinct n) ... unnest(event_names)`, below |
| `UNIQUE_TAGS`               | `select distinct tag_id, k.id ... unnest(direct_tag_ids)`, below                                                  | `count(distinct k.id) ... unnest(direct_tag_ids)`  |
| `AVERAGE_DURATION_MINUTES`  | duration statement below, `avg(u.seconds / 60.0)`                                                                 | same over the day rollups                          |
| `MEDIAN_DURATION_MINUTES`   | `percentile_cont(0.5) within group (order by u.seconds / 60.0)`                                                   | same                                               |
| `LONGEST_DURATION_MINUTES`  | `max(u.seconds) / 60.0`                                                                                           | same                                               |
| `SHORTEST_DURATION_MINUTES` | `min(u.seconds) / 60.0`                                                                                           | same                                               |

`COVERED_MINUTES` is the length of the union of the events' spans, which sums
no per-day figure: store the multirange per day and union them with `range_agg`
over the multiranges. The duration metrics read only spans, as the raw formulas
do; the arrays hold spans only. The remaining statements:

```sql
-- the four duration metrics, per tag node: one pass over the unnested arrays
select w.tag_id,
       avg(u.seconds / 60.0)                                    as average,
       max(u.seconds) / 60.0                                    as longest,
       percentile_cont(0.5) within group (order by u.seconds / 60.0) as median,
       min(u.seconds) / 60.0                                    as shortest
from w cross join lateral unnest(w.span_duration_seconds) as u (seconds)
group by w.tag_id;

-- UNIQUE_NAMES per tag node
select z.tag_id, count(*) as names
from (select distinct tag_id, name
      from calendar_event_day_tag_name_rollups
      where local_day >= :from and local_day < :to) z
group by z.tag_id;

-- UNIQUE_NAMES, whole set
select count(distinct u.name)
from calendar_event_day_rollups r cross join lateral unnest(r.event_names) as u (name)
where r.local_day >= :from and r.local_day < :to;

-- UNIQUE_TAGS per tag node, every tag given directly to the node's events
select z.tag_id, count(*) as unique_tags
from (select distinct w.tag_id, k.id
      from w cross join lateral unnest(w.direct_tag_ids) as k (id)) z
group by z.tag_id;
```

To count only the tags beneath one root (`UNIQUE_TAGS` with a `tagRoot`), join the
distinct tag ids to `tags_closure`:
`join tags_closure c on c.descendant_id = z.id and c.ancestor_id = :root and z.id <> :root`.

The four percent metrics are not read from the rollups: they clip each event to the
period, which a day grain cannot do, so the API computes them from the base tables.

### Grouped by a tag node, nested by another

Charts that nest one tag dimension inside another, or filter on a tag while
grouping by another, need the events that carry both nodes, which no day rollup
holds. Use the facts view, with the tag arrays and their GIN indexes:

```sql
select n.tag_id, count(*) as events, sum(f.duration_seconds) / 60.0 as minutes
from calendar_event_facts f
cross join lateral unnest(f.tag_ids) as n (tag_id)
where f.local_day >= :from and f.local_day < :to
  and f.tag_ids @> array[:filter_tag]::uuid[]
group by n.tag_id;
```

Any filter on the facts' own columns (`name`, `duration_seconds`, `local_hour`,
`local_weekday`, `is_instant`) is cheap there too. For events that overlap a
window rather than start in it, `f.extent && tstzrange(:from, :to, '[)')`
uses the GiST index, and the events that start before `:from` and reach into it
are the extra rows the day rollups cannot see.

## Measured on the development data

50,113 events, 28,877 of them counted, 776,571 event-tag rows. Timings are
`EXPLAIN (ANALYZE)` execution times before (raw events and
`calendar_event_derived_times`) and after (the rollups), events, unique names
and total minutes per tag node:

| Query                                                               | Before     | After           |
| ------------------------------------------------------------------- | ---------- | --------------- |
| events, unique names, minutes per tag node, 30 days                 | 268 ms     | 33 ms           |
| events, unique names, minutes per tag node, 365 days                | 832 ms     | 160 ms          |
| all 15 metrics per tag node (and the whole set, raw only), 30 days  | 450-500 ms | 46-50 ms        |
| all 15 metrics per tag node (and the whole set, raw only), 365 days | 4.8-6.4 s  | 0.3-0.5 s       |
| whole set, 15 metrics, 30 days / 365 days                           | n/a        | 4 ms / 30-48 ms |
| whole set: events, names, days, covered, median, 365 days           | 115 ms     | 21 ms           |

The `w` CTE is `not materialized` on purpose: materializing it copied every
array once per reference and doubled the time.

Storage added: about 22 MB for the facts, 32 MB for the day × tag rollups,
99 MB for the name rollups and 2 MB for the day rollups, with their indexes.
