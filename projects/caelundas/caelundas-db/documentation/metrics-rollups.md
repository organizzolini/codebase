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

## Where the time went: profile of the real web requests

The Charts and Totals layouts send one `eventMetrics` call each. Captured from
the browser: a three-part tag filter (nine rules), and the default Tags grouping
of **four levels that each pick tags** (9 roots, then the 34, 150 and 67 tags at
depths 1 to 3; no `parent`). Picked levels cross: a group is the events that
carry one tag from every level, so a 30-day window of 175 filtered events makes
**6,973 groups and a 5.8 MB response** (23,000 groups and 19 MB with no filter).
Charts asks 3 metrics, Totals 8. Measured on the 50,113-event development
database before any change (the API ran a statement per level, in parallel):

| Cost                      | Finding                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which path                | Filter, picked levels and percents never used a rollup: all of it ran on the base tables.                                                                                                         |
| Statements                | 5 (total + 4 levels) at once, each re-running the event filter and every earlier level. Wall time is the slowest: level 3, 1.3 to 2.7 s.                                                          |
| JIT                       | Planner estimates (700,000 rows against 26,000) tripped JIT: level 0 took 789 ms with it and 76 ms without; level 3, 2.7 s against 1.3 s. Pure overhead.                                          |
| Group order keys          | The ordering key of each group row was a correlated subquery over the tag closure, run per row: 26,151 times in level 3, about 500 ms.                                                            |
| Rows scanned              | Level 3 expands 175 events to 26,151 rows, then a 13 MB disk sort. The filter's `exists` subqueries hashed 30,000 tag rows each, in every statement (45 to 96 ms).                                |
| Per metric                | `UNIQUE_TAGS` is a correlated subquery per group (5,586 of them, 100 ms). The others are cheap beside the expansion.                                                                              |
| Compare                   | One statement already; it doubles events and groups (about 1.9 times the time), not the statements.                                                                                               |
| Serialization             | 5.8 MB, 6,973 groups: about 150 to 250 ms of the request, and unavoidable while the contract returns the whole tree.                                                                              |
| Floor: one pass           | All of it from the event facts with array operations in one pass: **116 ms** (`EXPLAIN ANALYZE`).                                                                                                 |

The profile settles the design: the cost is not a missing aggregate over days but
(a) per-level recomputation, (b) per-row subqueries and (c) JIT. A day × tag
rollup cannot answer these requests at all: a filter and a four-level crossing
need the events that carry several tags together, which no per-tag day row
holds. A pair rollup would not help either (the crossing is four deep, so a
group has a four-tag key; the 30 days alone make 6,973 groups). The event grain
with a GIN index on the tag ids, which `calendar_event_facts` already is, is the
right pre-aggregate for these, and the day rollups keep serving the unfiltered
whole-set and one-level shapes.

## The design as built

**Measures** (additive or exact per group, selected by SQL; `modules/measures`
in the API): `events`, `instants`, `spans`, `seconds`, `progressiveSeconds`,
`firstStart`, `lastStart`, `days`, `names`, `tags`, `coveredSeconds`,
`longestSeconds`, `shortestSeconds`, `medianSeconds`, and the percent measures
`clippedSeconds`, `coveredClippedSeconds`, their progressive twins and
`periodSeconds`. The clipped ones clip each event to its period, so a percent
needs no midnight alignment.

**Metrics** are one declarative table (`METRIC_DEFINITIONS`): each is a
calculation over measures and other metrics, evaluated in the service (average
duration is total minutes over spans; each percent is clipped seconds over
`periodSeconds`). The statement selects only the measures the metrics asked for
need (`findMeasures`).

**Statement** (`modules/facts`): periods (current and previous) join the facts by
overlap (`extent && [from, to)`, the events' own test, so any period works). The
filter compiles as before, but its tag rules read the fact's `tag_ids` array
instead of a tag-node lookup. Each level's keys per event are an array (picked
tags intersected with `tag_ids`, or a calendar key); a step per level expands
each event by its keys (an event with none is the group of no key), and each
level aggregates from its own step, so no level re-runs another. `UNIQUE_TAGS`
counts distinct direct tags per group in a side CTE that hashes (it multiplies
rows). The names, label, path and order keys come from a small dimension CTE for
the picked tags only, joined after aggregating.

**Routing.** Unfiltered requests the rollups wholly cover (whole set, a calendar
level, a root's first level, no percent) still use them. Everything else that is
only calendar levels and picked-tag levels uses the facts. A tag level with a
`parent` or no picks, the one thing left, keeps the statement per level on the
base tables, which also stay the reference every test compares against.

**Every metrics statement** runs in a transaction with `jit = off` and
`work_mem = 64MB` (`EventsService.selectTuned`).

**Not built, and why.** New day-grain views for the clipped hours and the
counted-overlap minutes would only serve unfiltered, midnight-aligned requests,
which the day rollups plus the facts already answer in tens of milliseconds, and
the web's requests carry filters. A day × node × filter-node pair rollup was
sized and dropped: the grouping crosses four levels deep. Distinct counts keep
exact sets (arrays in the day rollups, `count(distinct)` over the facts); no
bitmap or HyperLogLog extension is installed in the Postgres image, and none is
needed. The median keeps `percentile_cont` over the group's spans. A result
cache was left out: with answers of a few hundred milliseconds it adds a
staleness rule (the API cannot see the CLI's refresh) for little, and identical
requests would otherwise defeat the tests that compare two paths. No new
materialized view and no migration change were needed, so the unreleased
migration `1795568633626` is untouched.

## Benchmarks: the real web requests, before and after

Wall time of the GraphQL call from the API, on the development database, three to
five runs each, medians (the machine was about 1.3 times slower for the after
runs on the unfiltered cases, after Docker restarted). Results are identical,
group by group, to the previous API's (6,973, 6,955, 8,329, 6,891, 22,586 groups
compared, no difference at 1e-6).

| Request                                      | Before       | After          | Times faster   |
| -------------------------------------------- | ------------ | -------------- | -------------- |
| Charts default (filter, 4 levels, 3 metrics) | 2.0 to 3.1 s | 0.22 to 0.27 s | about 10       |
| Charts, compare                              | 2.5 to 4.7 s | 0.42 to 0.5 s  | about 7        |
| Totals default (filter, 4 levels, 8 metrics) | 1.3 to 2.5 s | 0.65 to 0.7 s  | about 2.5 to 3 |
| Totals without `UNIQUE_TAGS`                 | n/a          | 0.25 s         | n/a            |
| Totals, compare                              | 1.9 to 3.8 s | 1.4 to 1.7 s   | about 1.5      |
| Totals, single-rule filter, compare          | 3.8 to 5.3 s | 1.7 to 2.0 s   | about 2.5      |
| Charts, no filter (22,586 groups, 11.9 MB)   | 6.9 to 13 s  | 2.2 s          | 3 to 6         |
| Totals, no filter (22,988 groups, 19 MB)     | 10 to 11 s   | 6.0 to 6.4 s   | about 1.7      |

Honest limits: Totals stays slow because of `UNIQUE_TAGS` (distinct direct tags
per group, 280 ms of 500 ms in the default case and the lion's share without a
filter) and the unfiltered crossing is simply 23,000 groups, about 1.4 million
expanded rows for the deepest level. Both could shrink further by interning keys
as small integers, which was measured to be worth less than the added code. The
statement itself is 116 to 400 ms; the rest of a request is serialization of a
multi-megabyte tree the contract returns whole.

Profile run: `log_min_duration_statement = 0` on the development database, the
five statements replayed with `EXPLAIN (ANALYZE, BUFFERS)`.
