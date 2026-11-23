# 0037: Read Group Counts From the Aggregate Tables

Builds on [ADR 0034](0034-store-characteristics-in-a-catalog-and-a-bridge.md), [ADR 0035](0035-serve-meanders-through-a-keyset-paged-graphql-api.md) and [ADR 0036](0036-filter-meanders-by-a-rule-tree-planned-from-the-value-counts.md): `meanderGroups` counts the meanders a filter keeps, level by level, and `meanders.totalCount` reads the same way.

## Context

Every count is exact; none is estimated. Two exact sources exist: the aggregate tables the draw run rebuilds, and a count computed from the meanders and the bridge. The tables are fast but only cover some requests and are only as fresh as the last `aggregate`. A computed count is always current but walks the meanders, so it grows with the corpus.

## Decision

`meanderGroups(filter, groupBy)` returns the groups nested level by level, each with its key, its exact count and the groups of the next level. A level is a characteristic key, `rowsColumns`, `lattice` or `isHardcoded`; at most 4 levels. A key is text: a number, `true` or `false`, a lattice, or `RxC`. A characteristic level always includes its 0 or false bucket. A group's cards come from `meanders` with the key added to the filter.

**The tables answer what they cover; everything else is computed.**

- A lone level over no filter reads `characteristic_value_counts`, or `shape_counts` for `rows`, `columns` and `rowsColumns`. A `lattice` level is computed: the lattice is nearly unique to each meander, so no summary can hold it.
- A lone level within a flat AND of `rows` and `columns` rules reads `characteristic_shape_counts`, or `shape_counts`, summing the shapes the rules keep.
- A lone characteristic level within one pattern (a boolean characteristic that must be held) reads `characteristic_pair_counts`.
- `totalCount` reads `shape_counts` for no filter or shape rules, and `characteristic_value_counts` for one characteristic rule.
- The 0 or false bucket is always the total minus the stored rows, so it is exact as well. A group with no meanders is never returned.
- Anything else is computed: several levels, an OR or nested tree, a rule on `repeats`, `isHardcoded` or `lattice`, several characteristic rules, a pattern that must be absent, `isHardcoded` as a level. One query left-joins the bridge by primary key once per characteristic level and groups on the keys, after the filter, which ADR 0036 already plans from its most selective rule.

**A table answers only while it is provably current.** The rebuild writes a marker row, holding the meanders it counted, in the same transaction that swaps the tables in. It holds a share lock on the meanders, the bridge and the catalog, so no write lands between the counts and the marker. Every write to the meanders or the catalog (`save`, `saveAll`, `syncCharacteristics`, `clear`) deletes the marker in its own transaction. A covered request reads the marker and every table it needs in one repeatable-read snapshot. It checks the marker, and the number of shape rows (a summary holds a few thousand at most), before it reads any shape row, and answers from the tables only when the marker exists, equals the sum of the shape totals, and the stored rows do not add up to more than their total. Otherwise it is counted from the meanders. So the full draw run and `aggregate` rebuild the tables and mark them current; a `--code` run writes meanders, drops the marker, and every request counts from the meanders until `aggregate` runs. Before any rebuild there is no marker, and every request is counted. A reader never answers from a stale table, and never from a mix of tables.

### Measured

`meander-group-benchmark.resolver.end-to-end.test.ts` seeds a Postgres with 8 characteristics (3 patterns, 5 numbers) and runs each request twice with the same result: once covered, once nested in a redundant `repeats >= 1` group that no table covers. Run it with `MEANDERAW_BENCHMARK_MEANDERS=400000 nx run meanderaw-api:vitest -- meander-group-benchmark`; it is skipped without the variable. Median of five, over GraphQL, in milliseconds.

| Request                     | 400k meanders, 1.4M bridge rows | 2M meanders, 7M bridge rows |
| --------------------------- | ------------------------------- | --------------------------- |
| group one characteristic    | 3.8 vs 52                       | 3.6 vs 281                  |
| same, within one pattern    | 3.6 vs 62                       | 4.0 vs 469                  |
| same, within `rows = 3`     | 4.0 vs 36                       | 4.6 vs 213                  |
| group by `rowsColumns`      | 2.5 vs 33                       | 2.6 vs 124                  |
| total of one characteristic | 3.1 vs 394                      | 3.0 vs 4769                 |

The tables stay flat as the corpus grows; the computed counts grow with it, and a total whose rule a missing row satisfies walks every meander. The figures include the snapshot and marker read; the full rebuild took 0.8 s and 5.2 s in an earlier run of the same seeder. `EXPLAIN ANALYZE` of the computed "within one pattern" query at 400k shows a bitmap range scan on `(characteristicId, value, meanderId)` joined to the meanders, then a primary-key probe per row for the group level.

## Consequences

- Counts are never estimated, and never stale: every request is checked against a brute-force walk of the fixtures twice, once as asked and once forced onto the computed path, so a table read and a computed count must agree, the 0 or false bucket included. Other tests prove which source answered: a write makes the answer exact again, a rebuild returns it to the tables, and rows that do not add up are refused. Disabling the 0 or false bucket was seen to fail 8 of the 16 end-to-end cases.
- Every write to the meanders or catalog costs one `DELETE` of the marker, and a rebuild blocks writers while it runs (0.8 s at 400k meanders).
- A common computed view that proves slow is promoted into a table, not replaced by an estimate.
- A lone level over a multi-level or OR request is slower; the web app should load such groups lazily.
- Group counts are `Int`, like `totalCount`, which holds to 2.1 billion meanders.
