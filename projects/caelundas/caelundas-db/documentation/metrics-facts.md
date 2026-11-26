# Metrics facts: one measure at one filter a row, and the tables beside it

The Charts, Totals, Table and Timeline layouts measure events over a date window,
optionally grouped by tag nodes, with a previous-period comparison. These tables
hold what those queries read without touching every event:

- `calendar_event_facts`: **one measure at one filter a row**, a `filter_id`, a
  `measure_id` and a `measurement`, in the unit of the measure.
- `filters`: what a fact is about, a group instantiated. `groups`,
  `group_dimensions`, `dimensions` and `dimension_edges` are the catalog a filter
  is typed by.
- `calendar_event_tag_sets`: a materialized view of each event's tags as two
  sorted arrays, so a tag filter is one array test.

`measures`, `metrics` and `metric_expressions` describe what is measured and how a
metric is composed; the SQL that computes a measure lives in the API.

`CaelundasDatabaseService.refreshMetrics(manager)` refreshes the tag sets
concurrently, adds the filters the events need, drops the ones they no longer do,
and brings the facts up to date, all in the caller's transaction when it has one,
so an ingest needs nothing more. `nx run caelundas-cli:start:refresh-metrics` does
the same from a shell. The statements are in `calendar-event-facts.constants.ts`.

## Dimensions, groups and filters

A **dimension** is a way events are sliced: `name`, `day`, `week`, `month`,
`quarter`, `year` and `tag`. The time dimensions are a graph, kept as
`dimension_edges` (a `@Graph` edge, source the finer, target the coarser), because a
day has two parents: day to week, day to month, month to quarter, quarter to year.
`tag` is one flat dimension whose **values are the rows of `tags`** and their
trees, never copied (the tags are a graph, in `tag_edges`, but a filter pins one
tag), and `name` is one flat
dimension whose values are the distinct event names, so recurrences aggregate by
name, name and day, or name and month; no filter pins a name yet. An event is base
data in `calendar_events`, not a dimension.

A **group** is a set of dimensions, listed in the `group_dimensions` join table. Each
group is for one dimension (`name`, `day`, `week`, `month`, `quarter`, `year`, `tag`)
for now. The table stays because a later dimension, such as a place, will not be a
copy of its group.

A **filter** is a group instantiated: it pins a value of its group's dimension, a
`period` (the first date of the period) for a time dimension, an `event_name` for the
name dimension or a `tag_id` for the tag dimension, and may sit under a parent
filter. The facts are over every stored event. The tables are in
[catalog-tables.md](catalog-tables.md).

| Filter               | Group | Pins                   | Parent filter     | Rows (50,113 events) |
| -------------------- | ----- | ---------------------- | ----------------- | -------------------- |
| a day, the whole set | `day` | `period`               | none              | 365                  |
| a tag on a day       | `tag` | `tag_id`, and `period` | that day's filter | 42,368               |

A fact sits at a day filter, the measures of the whole set on that day, or at a tag
filter, the measures of the events carrying that tag or a descendant, so a parent's
figures include its children's. Tag filters are not nested in one another: a tag may
have several parents (Venus is under Planet and under Benefic), so one parent filter
could not say where it sits, and `tag_trees` gives the ancestry instead. Every tag
filter is beneath its day's filter, and carries the day's `period` as well, so a window
of days is a range of one index and not a walk up the parents. A shared tag's filter
and facts are one, counting an event once however many paths lead to it.
Only the `day` and `tag` groups have filters; the others are catalog rows for filters
a later change may add, which the edges say roll up. A filter has the audit columns
of every table, an optional `name`, `icon` and `note` that nothing sets today, and
the unique key `(group_id, period, tag_id, event_name, slug)` with nulls equal, so a
day is one filter and a tag on a day is one. A tag removed from `tags` takes its
filters and facts with it.

**Every stored event is counted.** The CLI never stores the instants a stored span
starts or ends on, so the facts need no predicate. A request that filters by tag
reads the events.

## Facts

| Column        | Type               | Meaning                                            |
| ------------- | ------------------ | -------------------------------------------------- |
| `filter_id`   | `uuid`             | the filter measured; cascades on delete            |
| `measure_id`  | `uuid`             | the measure taken, restricted on delete            |
| `measurement` | `double precision` | its value: a count, whole minutes, or epoch millis |

The primary key is `(filter_id, measure_id)`. The unit is the measure's, never a
column of the fact.

**Which measures are stored.** Only those that merge across days, so that a window
is the sum, the minimum or the maximum of its days:

| Measure                                   | Stored as                                         | A window combines them with |
| ----------------------------------------- | ------------------------------------------------- | --------------------------- |
| `events`                                  | events counted                                    | `sum`                       |
| `perfective-events`, `progressive-events` | `start = end`, `start < end`; none when 0         | `sum`                       |
| `duration`                                | whole minutes; none when 0                        | `sum`                       |
| `first-start`                             | earliest start, epoch milliseconds (an `instant`) | `min`                       |
| `last-start`                              | latest start, epoch milliseconds (an `instant`)   | `max`                       |
| `days-with-events`                        | not stored: one `events` row a day                | `count(distinct day)`       |

A **perfective** event happens at a moment and lasts no minutes; a **progressive**
event lasts a while. The `Temporality` tag the CLI puts on every event says which
(`Perfective` when `start = end`, else `Progressive`), so a progressive event is
exactly an event with minutes, and `duration` is the duration of the progressive
events. That made the old `progressive-duration` (the minutes of the events tagged
Progressive) equal `duration` by definition, and in the 50,113 development events
the two agreed in all 42,733 cells. It was merged into `duration`, and its slug
still resolves to it. The unit `instant` of `first-start` and `last-start` is a
different thing: a point in time.

A missing row reads as zero for a sum. The six measures that do **not** merge
across days or tags (`unique-names`, `unique-tags`, `covered-duration`,
`longest-progressive-duration`, `shortest-progressive-duration`,
`median-progressive-duration`) and the five percent inputs that
clip each event to the period have no row at any filter: their value over two
days is not a function of their values over each, so a request for one reads the
events. The registry says so with `grains: ["event"]` against the `["day",
"event"]` of the others.

## Reading the facts

Routing is in the API (`isRollupRequest`): an unfiltered request
whose measures all merge, in a zone every event shares and over windows that
start and end at local midnight, reads the facts. The level is the whole set, a
calendar field (`day`, `month`, `quarter`, `year`), or the children of one root
tag. Everything else reads the events in one statement.

- **Whole set.** The day filters `df` whose `period` is in
  the window, their facts pivoted back to columns with one conditional aggregate a
  measure.
- **Tag level.** The day-and-tag filters `tf` whose `period` is in the window and
  whose `tag_id` is a child of the root.
- **Events that start before the window and reach into it,** and the events of a
  tag level that carry none of the root's tags, are read from the events as before,
  and added.

A year of the children of one root (the Aspect tag's six) reads about 11,000 fact
rows and took 120 milliseconds through the API, against 4,070 through the events;
the whole set over a year took 19 against 77. Weeks, months, quarters and years were
not added as groups: the widest window already reads fast, and each would cost rows
and a rule for how a window splits.

## Event rows

The event path reads each event from `calendar_events` and its tags from
`calendar_event_tag_sets`, joined by id, with the local day and hour from the stored
generated columns and the whole minutes computed inline:

| Column              | Type     | Meaning                                                     |
| ------------------- | -------- | ----------------------------------------------------------- |
| `calendar_event_id` | `uuid`   | the event; unique                                           |
| `tag_ids`           | `uuid[]` | tags given directly, sorted; GIN indexed                    |
| `ancestor_tag_ids`  | `uuid[]` | proper ancestors of those, sorted; GIN indexed; may overlap |

Filtering by a tag, with its subtree, matches `tag_ids || ancestor_tag_ids`. Both
arrays are kept: dropping the ancestors saves 9.4 MB but sends the planner into
joins of `tag_trees` for every event, JIT and disk sorts.

## The local-time fields

`start` and `end` are absolute `timestamptz`; the zone is the `timezone` column.
Three **stored generated columns** of `calendar_events` hold the local date and
hour, which Postgres 18 accepts because `timezone(text, timestamptz)` is immutable:

| Column             | Type            | Expression                                                   |
| ------------------ | --------------- | ------------------------------------------------------------ |
| `start_local_day`  | `date`, indexed | `("start" at time zone timezone)::date`                      |
| `end_local_day`    | `date`          | `("end" at time zone timezone)::date`                        |
| `start_local_hour` | `smallint`      | `extract(hour from "start" at time zone timezone)::smallint` |

The entity marks them `generatedType: "STORED"`, `insert: false` and `update: false`,
and the migration records their expressions in `typeorm_metadata` with
`current_database()`. A day is the event's local start day, so a window
`day >= from and day < to` holds the events that start in it. The other fields are
inline: `duration_minutes` is `floor(extract(epoch from "end" - "start") / 60)`,
`temporality` is `'Instant'` when `start = end`, and the weekday is
`extract(dow from start_local_day)`.

## Catalog tables

`measures`, `metrics`, `metric_expressions` and `metric_expressions_closure`, like
`groups`, are reference data the migration seeds, with
deterministic uuidv7-form ids. They hold the catalog and the composition only:
**which aggregate, event column or grain a measure uses is not stored.** The API
keeps a code registry keyed by the measure's `slug`.

| Table                        | Columns (besides `id` and the audit stamps)                                               | Keys                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `measures`                   | `slug`, `name`, `icon`, `note`, `unit`                                                    | unique `slug`; check `unit in ('count','duration','instant','none')`                                                                |
| `metrics`                    | `slug`, `name`, `icon`, `note`, `unit`, `expression_id`                                   | unique `slug`; unique `expression_id` (null only while seeding); FK to `metric_expressions` `on delete set null`; same `unit` check |
| `metric_expressions`         | `kind`, `measure_id`, `metric_id`, `operator`, `parent_id`, `position`                    | unique `(parent_id, position)` where parent not null; check on `kind`                                                               |
| `metric_expressions_closure` | `ancestor_id`, `descendant_id`                                                            | the closure of the tree, kept by TypeORM                                                                                            |
| `dimensions`                 | `slug`, `name`, `icon`, `note`                                                            | unique `slug`                                                                                                                       |
| `dimension_edges`            | `source_node`, `target_node` (a `@Graph` edge)                                            | primary key the pair; both FK to `dimensions`, cascade                                                                              |
| `groups`                     | `slug`, `name`, `icon`, `note`                                                            | unique `slug`                                                                                                                       |
| `group_dimensions`           | `group_id`, `dimension_id`                                                                | primary key the pair; both FK, cascade                                                                                              |
| `filters`                    | `group_id`, `parent_id`, `period`, `tag_id`, `event_name`, `slug`, `name`, `icon`, `note` | unique `(group_id, period, tag_id, event_name, slug)` nulls equal; FKs to `groups` (restrict), itself and `tags` (cascade)          |

A metric's tree is rooted by the metric: `metrics.expression_id` is the root node of
the tree that computes it. A node is a `measure`, a `metric` (another metric whose
own tree is evaluated there) or an `operator` over its children in `position`
order (`divide`, `percent`, ...). The 18 measures, the 18 metrics and their
expression trees are in [metric-expressions.md](metric-expressions.md) and the
migration.

## Refreshing

The statements run in this order, each one set-based over the events:

1. `refresh materialized view concurrently calendar_event_tag_sets`.
2. Add a day filter for each day with an event and a day-and-tag filter for each tag
   that day's events carry or descend from, `on conflict do nothing`, so a filter
   keeps its id; hang each tag filter beneath its parent's of the same day; drop the
   filters that lost their events, with their facts.
3. Upsert each cell's measures, writing only those that are new or changed, and
   delete the ones no cell holds any more. A refresh that finds nothing changed
   writes no row.

The cells are computed in a CTE each statement repeats, about 0.15 seconds, rather
than in a temporary table, which would not survive a refresh with no transaction.

## Measured on the development data

50,113 events, 260 tags, Postgres 18.6 in Docker.

| Relation                                  | Rows    | Heap   | Indexes | Total      |
| ----------------------------------------- | ------- | ------ | ------- | ---------- |
| `calendar_event_facts`                    | 253,148 | 16 MB  | 16 MB   | 32 MB      |
| `filters`                                 | 42,734  | 9.8 MB | 8.6 MB  | 18 MB      |
| `calendar_event_tag_sets`                 | 50,113  | 17 MB  | 3 MB    | 20 MB      |
| the catalog tables, a few rows each       |         |        |         | under 1 MB |
| **All of them**                           |         |        |         | **70 MB**  |
| the previous view, `calendar_event_facts` | 95,788  | 57 MB  | 8.2 MB  | 69 MB      |

A full refresh takes about 4.5 seconds with nothing changed, and 8 the first time,
against 3.8 to 4.7 for the view. The facts hold 6 rows a cell, not
the 11 wide columns of the view, and the tag arrays that took the most room moved to
the tag sets, where the event path reads them. The upsert leaves the table as it is
when nothing changed; a rebuild by delete and insert doubled the heap until a vacuum.
