# Metrics facts: the one pre-aggregation table

The Charts, Totals, Table and Timeline layouts measure events over a date window,
optionally grouped by tag nodes, with a previous-period comparison. One
materialized view, `calendar_event_facts`, holds everything those queries need, so
a metric over a window is a scan of a few thousand narrow rows, not of every event
and every tag it carries. Storage is spent freely: the view is denormalized, and
every column a query filters, groups or joins on is indexed.

`CaelundasDatabaseService.refreshMetrics(manager)` refreshes it concurrently, in
the caller's transaction when it has one, so an ingest needs nothing more, and
`nx run caelundas-cli:start:refresh-metrics` does the same from a shell (about 8.6
seconds on the 50,000 development events). There are no derived tag tables: the view
reads a tag's depth, root, path and rank from `tags` and `tags_closure`, and an
event's tags from `calendar_event_tags`, once per refresh.

## One table, five grains

The view is built with `GROUPING SETS` over the events expanded to one row per
carried tag (ancestors included) plus one row with no tag. Every dimension and
measure column is nullable; the `filter` column says which grain a row answers, and
**every query pins it** (`filter = 'day-tag'`), so grains never mix and the planner
leads with the `filter` index.

| `filter`       | One row per                        | Reads it                                               |
| -------------- | ---------------------------------- | ------------------------------------------------------ |
| `event`        | event                              | filtered, picked-tag and percent statements; the Table |
| `day`          | local day (no tag): the whole set  | unfiltered whole-set and calendar-level statements     |
| `day-tag`      | local day and tag node             | unfiltered first level of a root's children            |
| `day-tag-name` | local day, tag node and event name | `UNIQUE_NAMES` per tag node                            |

Row counts on the 50,113-event development set: 50,113 `event`, 730 `day`, 69,620
`day-tag`, 623,911 `day-tag-name` (744,374 in all; 189 MB, and 175 MB of indexes).

`is_phase_boundary` is in the key of every grain, so a day or tag row is split by it.
A statement that sums rows sums over both values, which every metric supports
(distinct counts, `range_agg` and array unions are not additive per row, and are
taken over the window's rows).

## The exclusion default

Events tagged `Aspect / Phase / Forming` or `Aspect / Phase / Dissolving` are the
boundary instants the CLI pairs into Progressive events. They are **kept** in the
view and flagged `is_phase_boundary = true`; they are left out at query time by one
default, `DEFAULT_EVENT_SCOPE` (`includePhaseBoundaries: false`) in `caelundas-api`,
applied to the events list, the raw metrics statements and every facts read
(`is_phase_boundary = false`). A caller that wants them sets the flag, and the
predicate disappears. Events with no tag at all are kept and appear in the `event`
and `day` grains only.

## Rules every grain shares

- **A day is the event's local start day,** `(start at time zone timezone)::date`.
  A window is `local_day >= from and local_day < to`, so an event belongs to the
  window its start falls in. This differs from the raw overlap test
  (`start < to and end >= from`) only for an event that starts before the window
  and reaches into it; read those from the `event` grain with the `extent` overlap
  index when exact overlap is needed.
- **Durations are whole seconds** (`bigint`); divide by 60 for minutes and by 3600
  for hours. Instants have a duration of 0.
- **Every period is a column:** `local_week` (the Monday), `local_month`,
  `local_quarter` (each the first day), `local_year`.
- **`tag_id` is a node of the tag tree;** a node's rows count every event carrying
  it directly or through a descendant, so a parent's figures include its children's.
  `tag_depth` is 0 for a root.
- **Previous period** is the same query over the previous `[from, to)`.

## Columns

| Column                                          | Type             | Grains                | Meaning                                                            |
| ----------------------------------------------- | ---------------- | --------------------- | ------------------------------------------------------------------ |
| `filter`                                        | `text` not null  | all                   | the grain                                                          |
| `is_phase_boundary`                             | `boolean`        | all                   | Forming or Dissolving boundary instant                             |
| `row_key`                                       | `uuid` not null  | all                   | md5 of the grain's keys; the unique key a concurrent refresh needs |
| `calendar_event_id`                             | `uuid`           | event                 | the event                                                          |
| `name`                                          | `text`           | event, day-tag-name   | the event's summary                                                |
| `local_day`, `local_week` .. `local_year`       | `date`, `bigint` | all                   | the day and its periods                                            |
| `start`, `end`                                  | `timestamptz`    | event                 | as stored                                                          |
| `local_weekday`, `local_hour`                   | `bigint`         | event                 | 0 for Sunday; 0 to 23                                              |
| `is_instant`, `is_progressive`                  | `boolean`        | event                 | `start = end`; carries `Temporality / Progressive`                 |
| `extent`                                        | `tstzrange`      | event                 | `[start, end]`, so overlap is `extent && range`                    |
| `tag_ids`                                       | `uuid[]`         | event                 | every tag carried, ancestors included                              |
| `tag_id`                                        | `uuid`           | day-tag, day-tag-name | the tag node (null on event and day rows)                          |
| `tag_name`, `tag_path`, `tag_depth`, `tag_rank` | `text`, `bigint` | day-tag               | label, names from the root joined with ` / `, depth, sort key      |
| `tag_root_id`                                   | `uuid`           | day-tag, day-tag-name | the node's dimension root                                          |
| `events`                                        | `bigint`         | all                   | events counted (1 on an event row)                                 |
| `instants`, `spans`                             | `bigint`         | event, day, day-tag   | `start = end`, `end > start`                                       |
| `duration_seconds`, `progressive_seconds`       | `bigint`         | event, day, day-tag   | sum of durations; of the Progressive events                        |
| `first_start`, `last_start`                     | `timestamptz`    | event, day, day-tag   | earliest and latest start                                          |
| `covered_range`                                 | `tstzmultirange` | event, day, day-tag   | union of the events' `[start, end)`                                |
| `span_duration_seconds`                         | `bigint[]`       | event, day, day-tag   | every span's duration, ascending                                   |
| `direct_tag_ids`                                | `uuid[]`         | event, day, day-tag   | tags given directly, distinct                                      |
| `event_names`                                   | `text[]`         | day                   | the day's distinct event names, ascending                          |

`tag_rank` is `00000:Name / 00002:Child`: each ancestor's padded `rank`, then its
name, so siblings sort by `rank` and then name. Each measure maps to one column.

## Indexes

Every index leads with `filter` (the GIN and GiST ones are partial on
`filter = 'event'`), and every btree continues with `is_phase_boundary`, so the
default query is one equality prefix and a range on the day.

| Index                                                | Columns                                                     | Serves                                   |
| ---------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `calendar_event_facts_row_key`                       | unique `(row_key)`                                          | `refresh materialized view concurrently` |
| `calendar_event_facts_day`                           | `(filter, is_phase_boundary, local_day, tag_id)`            | every window scan                        |
| `calendar_event_facts_tag_day`                       | `(filter, is_phase_boundary, tag_id, local_day, name)`      | one tag, and its unique names            |
| `calendar_event_facts_root_day`                      | `(filter, is_phase_boundary, tag_root_id, local_day, name)` | a root's children                        |
| `calendar_event_facts_depth_day`                     | `(filter, is_phase_boundary, tag_depth, local_day)`         | a depth                                  |
| `calendar_event_facts_{week,month,quarter,year}_tag` | `(filter, is_phase_boundary, local_X, tag_id)`              | per-period charts                        |
| `calendar_event_facts_name_day`                      | `(filter, is_phase_boundary, name, local_day)`              | a name over time                         |
| `calendar_event_facts_weekday_day`                   | `(filter, is_phase_boundary, local_weekday, local_day)`     | weekday charts                           |
| `calendar_event_facts_start`                         | `(filter, start)`                                           | ordered event scans                      |
| `calendar_event_facts_extent`                        | GiST `(extent)` where `filter = 'event'`                    | overlap with a window                    |
| `calendar_event_facts_tag_ids`                       | GIN `(tag_ids)` where `filter = 'event'`                    | tag filters                              |
| `calendar_event_facts_direct_tag_ids`                | GIN `(direct_tag_ids)` where `filter = 'event'`             | directly given tags                      |

Why `row_key` and not a unique index over the dimension columns: every row has a
null in at least one of them, and `refresh ... concurrently` matches old and new
rows with `=`, which never matches a null. A unique index `(filter, calendar_event_id,
local_day, is_phase_boundary, tag_id, name) NULLS NOT DISTINCT` works, but measured
here it deleted and reinserted all 744,374 rows on every refresh (about 14 seconds
and as many dead tuples); with the not-null `row_key` an unchanged refresh touches
none. `calendar_events` also gained `(end)` and `(latitude, longitude, start)`.

## Computing each metric

Below, `:from` and `:to` are the window's local days; `D` is
`calendar_event_facts` pinned to `filter = 'day-tag'` (or `'day'` for the whole set,
dropping `tag_id` from every `group by`) and `is_phase_boundary = false`. Group by a
period by adding its column to the select and `group by`.

| Metric                                      | Per tag node (`D`, `group by tag_id`)                            | Whole set (`day`)                              |
| ------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `EVENTS`                                    | `sum(events)`                                                    | `sum(events)`                                  |
| `INSTANTS`, `SPANS`                         | `sum(instants)`, `sum(spans)`                                    | same                                           |
| `TOTAL_DURATION_MINUTES`                    | `sum(duration_seconds) / 60.0`                                   | same                                           |
| `PROGRESSIVE_HOURS`                         | `sum(progressive_seconds) / 3600.0`                              | same                                           |
| `FIRST_START`, `LAST_START`                 | `extract(epoch from min(first_start)) * 1000`, `max(last_start)` | same                                           |
| `DAYS_WITH_EVENTS`                          | `count(distinct local_day)`                                      | same                                           |
| `COVERED_MINUTES`                           | union of `range_agg(covered_range)`, summed                      | same                                           |
| `UNIQUE_NAMES`                              | `count(*)` of `select distinct tag_id, name` on `day-tag-name`   | `count(distinct n)` over `unnest(event_names)` |
| `UNIQUE_TAGS`                               | `select distinct tag_id, k.id ... unnest(direct_tag_ids)`        | `count(distinct k.id)`                         |
| average, median, longest, shortest duration | one pass over `unnest(span_duration_seconds)`                    | same                                           |

The four percent metrics clip each event to the period, which a day grain cannot do,
so they read the `event` grain. A filter on a tag reads the event's `tag_ids` array
(GIN-indexed for containment; a filter by tag path resolves to tag ids through `tags`
and `tags_closure` first), and a filter on the event's own columns is cheap there too.

## Measured on the development data

50,113 events. The API requests the web sends (captured from the browser: a
three-part tag filter of nine rules, and the default Tags grouping of four levels that
each pick tags, 6,973 groups in 30 days). Wall time of the GraphQL call from the API,
median of five runs. Before: the four-view design with `tag_nodes` and
`calendar_event_tag_nodes`; after: this one table. Results are identical, group by
group, to the previous API's (6,955 to 22,988 groups compared, no difference at 1e-6).

| Request                                        | Before   | After    | Change |
| ---------------------------------------------- | -------- | -------- | ------ |
| Charts default (filter, 4 levels, 3 metrics)   | 171 ms   | 179 ms   | +5%    |
| Charts, compare                                | 297 ms   | 304 ms   | +2%    |
| Charts, no filter (22,586 groups)              | 1,536 ms | 1,660 ms | +8%    |
| Charts, whole set, 15 metrics, two levels      | 152 ms   | 161 ms   | +6%    |
| Charts, with the four percent metrics          | 239 ms   | 247 ms   | +3%    |
| Totals default (filter, 4 levels, 8 metrics)   | 481 ms   | 352 ms   | -27%   |
| Totals, compare                                | 1,028 ms | 611 ms   | -41%   |
| Totals, no filter (22,988 groups)              | 5,263 ms | 3,108 ms | -41%   |
| Events list, Charts capture (filter, 4 groups) | 600 ms   | 686 ms   | +14%   |
| Events list, Totals capture                    | 595 ms   | 642 ms   | +8%    |

Refresh: 4.5 s before, 8.6 s after (one view of 744,374 rows, 15 indexes, computed
with `GROUPING SETS`); storage 364 MB with indexes against about 155 MB for the four
views, and the two tag tables are gone.

Where the Totals gain comes from: the old `UNIQUE_TAGS` and name statements joined
`tag_nodes` and the old rollups, now `tags` and the grains; the Events list is the one
path that regressed beyond noise, most likely because it computes each tag's depth, root, path and
rank at query time (the `tag_info` CTE) in place of a stored table lookup, and the
statement is dominated by the 4-level group keys per event. It stays under 20%.

## The design as built

**Measures** (`modules/measures` in the API): `events`, `instants`, `spans`, `seconds`,
`progressiveSeconds`, `firstStart`, `lastStart`, `days`, `names`, `tags`, `coveredSeconds`,
`longestSeconds`, `shortestSeconds`, `medianSeconds`, and the percent measures
`clippedSeconds`, `coveredClippedSeconds`, their progressive twins and `periodSeconds`.
**Metrics** are one declarative table (`METRIC_DEFINITIONS`), evaluated in the service.

**Routing.** Unfiltered requests the day grains wholly cover (whole set, a calendar
level, a root's first level, no percent) read `day` and `day-tag`. Everything else that
is only calendar levels and picked-tag levels reads the `event` grain in one statement.
A tag level with a `parent` or no picks keeps a statement per level on the base tables,
which also stay the reference every test compares against.

**Every metrics statement** runs in a transaction with `jit = off` and
`work_mem = 64MB` (`EventsService.selectTuned`).

**Not built, and why.** A result cache (the API cannot see the CLI's refresh), a
bitmap or HyperLogLog extension for distinct counts (the exact arrays are fast enough),
and a day x node x filter-node pair grain (the grouping crosses four levels deep).
