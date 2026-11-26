# Percent-of-time SQL

The four percent metrics (`covered-percent`, `total-time-percent`, `progressive-covered-percent`
and `progressive-total-percent`) are expressions over the measures `clipped-duration`,
`covered-clipped-duration` and their progressive forms, by `period-length` with the `percent` operator (100 times the ratio, none for a zero divisor).
Their SQL is in `modules/measures` of the API. `P` is the period `[ps, pe)` and `T = pe - ps` in
minutes; `T = 0` makes every percent `null`.

For each event interval `[start, end)` of a group, clip it to the period: `[max(start, ps), min(end, pe))`.
An interval with no overlap, and an instant, clips to nothing.

| Metric                        | Scope       | Minutes `M`                                        | Result        |
| ----------------------------- | ----------- | -------------------------------------------------- | ------------- |
| `covered-percent`             | all         | length of the **union** of the clipped intervals   | `100 * M / T` |
| `total-time-percent`          | all         | **sum** of the clipped interval lengths            | `100 * M / T` |
| `progressive-covered-percent` | progressive | union of the progressive events' clipped intervals | `100 * M / T` |
| `progressive-total-percent`   | progressive | sum of the progressive events' clipped lengths     | `100 * M / T` |

Progressive means the event carries the `Temporality / Progressive` tag, found through `calendar_event_tags` and `tag_closures` (the facts' `is_progressive`).

## Query

The union is `range_agg(tstzrange(greatest(start, ps), least(end, pe)))`, a multirange of disjoint ranges.
Unnest it and sum `upper - lower`. The sum is `sum(least(end, pe) - greatest(start, ps))`.
Both are aggregates over the group's events, so they work at every grouping level and in the whole-set total.

## From per-day intervals

A rollup that stores each event's interval clipped to a local day, one row per event per day, computes both
percentages for a day, or for a period of days, from those rows:

- **Counted**: `sum(minutes)` of the rows in the period, over `T`. Splitting an event at midnight loses nothing.
- **Deduped**: per day, the union of that day's rows (`range_agg` over the day's clipped ranges), summed over the
  period's days. A day's union never crosses into another day, so the sum of per-day unions is the union.

Clip the first and last day to `[ps, pe)` before summing when the period does not start or end at a day boundary.

## Read from the rollups

The percent metrics are not read from the rollups. A rollup holds each event's whole
`[start, end)` for the day it starts, with no clip to the period and no progressive
multirange, so a percent needs the `event` grain or the base-table statement above. A request
that asks for any percent never reads the day grains.

The day grains are read at all only when the scope includes the phase boundaries: a day row
cannot drop an event by its tags, so every request under the default scope reads the `event`
grain, whose rows carry the tags the exclusion tests.

### Measured

`EXPLAIN (ANALYZE)` execution time on the development data (28,877 counted events, one zone), the
fifteen non-percent metrics, each statement over the rollups against the events; the answers were
equal to six decimals:

| Request                                  | Rollups | Events   |
| ---------------------------------------- | ------- | -------- |
| whole set, 31 days, with the previous    | 4 ms    | 64 ms    |
| whole set, 365 days                      | 30 ms   | 297 ms   |
| by month, 365 days (one level)           | 25 ms   | 343 ms   |
| by a tag root, 365 days (one level)      | 161 ms  | 2,795 ms |
| by a tag root, 365 days, the whole set   | 24 ms   | 189 ms   |

### Measured through the API

`m/replay2` over the development data (50,113 events), the Charts and Totals requests the web sends,
median of five runs. Before, the unfiltered whole-set statements read the day grains with a
flag that dropped the phase boundaries; now the default scope reads the `event` grain and drops
them by tag. The results were identical (2.9 million values compared, no difference).

| Request                       | Day grains and flag | Event grain, by tag |
| ----------------------------- | ------------------- | ------------------- |
| Charts, filtered              | 177 ms              | 171 ms              |
| Charts, filtered, compared    | 329 ms              | 311 ms              |
| Totals, filtered              | 359 ms              | 369 ms              |
| Totals, filtered, compared    | 591 ms              | 603 ms              |
| All 19 metrics, no filter     | about 4.0 s         | 3.9 s               |

The first run of the event grain took 213, 366, 486 and 1,064 ms (6.0 s unfiltered): the level
counts inflate the planner's row estimates, so it sorted the distinct tags on disk instead of
hashing them. `hash_mem_multiplier` 16 in `TUNING_SQL` lets it hash them.
