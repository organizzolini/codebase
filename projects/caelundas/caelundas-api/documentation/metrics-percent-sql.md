# Percent-of-time SQL

The four percent metrics in `event-metrics-sql.constants.ts` share one shape. `P` is the period
`[ps, pe)` and `T = (pe - ps) / 1 minute`; `T = 0` makes every percent `null`.

For each event interval `[start, end)` of a group, clip it to the period: `[max(start, ps), min(end, pe))`.
An interval with no overlap, and an instant, clips to nothing.

| Metric                        | Scope       | Minutes `M`                                        | Result        |
| ----------------------------- | ----------- | -------------------------------------------------- | ------------- |
| `COVERED_PERCENT`             | all         | length of the **union** of the clipped intervals   | `100 * M / T` |
| `TOTAL_TIME_PERCENT`          | all         | **sum** of the clipped interval lengths            | `100 * M / T` |
| `PROGRESSIVE_COVERED_PERCENT` | progressive | union of the progressive events' clipped intervals | `100 * M / T` |
| `PROGRESSIVE_TOTAL_PERCENT`   | progressive | sum of the progressive events' clipped lengths     | `100 * M / T` |

Progressive means the event carries the `Temporality / Progressive` tag path in `calendar_event_tag_nodes`.

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
multirange, so a percent needs the base-table statement above. A request that asks for
any percent reads the events for every statement.

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
