# 0035: Count Groups From the Aggregate Tables Where They Cover a Request

Builds on [ADR 0032](0032-store-characteristics-in-a-catalog-and-a-bridge.md), [ADR 0033](0033-serve-meanders-through-a-keyset-paged-graphql-api.md) and [ADR 0034](0034-filter-meanders-by-a-rule-tree-planned-from-the-value-counts.md): `meanderGroups` counts the meanders a filter keeps, level by level, and `meanders.totalCount` reads the same way.

## Context

Every count is exact; none is estimated. Two exact sources exist: the aggregate tables the draw run rebuilds, and a count computed from the meanders and the bridge. The tables are fast but only cover some requests and are only as fresh as the last `aggregate`. A computed count is always current but walks the meanders, so it grows with the corpus.

## Decision

`meanderGroups(filter, groupBy)` returns the groups nested level by level, each with its key, its exact count and the groups of the next level. A level is a characteristic key, `rowsColumns`, `lattice` or `isHardcoded`; at most 4 levels. A key is text: a number, `true` or `false`, a lattice, or `RxC`. A characteristic level always includes its 0 or false bucket. A group's cards come from `meanders` with the key added to the filter.

**The tables answer what they cover; everything else is computed.**

- A lone level over no filter reads `characteristic_value_counts`, or `shape_counts` for `rowsColumns` and `lattice`.
- A lone level within a flat AND of `rows`, `columns` and `lattice` rules reads `characteristic_shape_counts`, or `shape_counts`, summing the shapes the rules keep.
- A lone characteristic level within one pattern (a boolean characteristic that must be held) reads `characteristic_pair_counts`.
- `totalCount` reads `shape_counts` for no filter or shape rules, and `characteristic_value_counts` for one characteristic rule.
- The 0 or false bucket is always the total minus the stored rows, so it is exact as well. A group with no meanders is never returned.
- Anything else is computed: several levels, an OR or nested tree, a rule on `repeats` or `isHardcoded`, several characteristic rules, a pattern that must be absent, `isHardcoded` as a level. One query left-joins the bridge by primary key once per characteristic level and groups on the keys, after the filter, which ADR 0034 already plans from its most selective rule.

**A stale table is answered as it stands.** The tables are rebuilt at the end of every draw run and by `aggregate`. After a `--code` run, a covered request reads the old counts until `aggregate` runs, and a computed one reads the new meanders. Before any aggregate has run, `shape_counts` is empty and every request is computed.

### Measured

A seeded Postgres, 8 characteristics, each request run twice with the same result: once covered, once with a redundant `repeats >= 1` rule that no table covers. Median of five, over GraphQL, in milliseconds.

| Request                       | 400k meanders, 1.4M bridge rows | 2M meanders, 7M bridge rows |
| ----------------------------- | ------------------------------- | --------------------------- |
| group one characteristic      | 2.9 vs 52                       | 2.6 vs 246                  |
| same, within one pattern      | 3.1 vs 62                       | 3.9 vs 342                  |
| same, within `rows = 3`       | 4.6 vs 37                       | 5.2 vs 151                  |
| group by `rowsColumns`        | 2.8 vs 31                       | 2.5 vs 108                  |
| total of one characteristic   | 2.4 vs 389                      | 2.3 vs 3829                 |

The tables stay flat as the corpus grows; the computed counts grow with it, and a total whose rule a missing row satisfies walks every meander. The full rebuild took 0.8 s and 5.2 s. `EXPLAIN ANALYZE` of the computed "within one pattern" query at 400k shows a bitmap range scan on `(characteristicId, value, meanderId)` joined to the meanders, then a primary-key probe per row for the group level.

## Consequences

- Counts are never estimated: a table read and a computed count return the same figures, which the end-to-end tests check against a brute-force walk of the fixtures, including the 0 or false bucket.
- A common computed view that proves slow is promoted into a table, not replaced by an estimate.
- A lone level over a multi-level or OR request is slower; the web app should load such groups lazily.
- Group counts are `Int`, like `totalCount`, which holds to 2.1 billion meanders.
