# 0032: Store Characteristics in a Catalog and a Bridge

Supersedes the storage decision of [ADR 0018](0018-store-every-characteristic-in-one-sparse-json-map.md) and [ADR 0023](0023-filter-meanders-by-characteristics-alone.md): a meander's characteristics are no longer one sparse `jsonb` column. Everything else in both stands: a meander has no family, a pattern is a boolean characteristic, a missing value means zero or false, and the pattern pages are written under a gitignored `output/`.

## Context

The `characteristics` `jsonb` column held every value of a meander in one map. It had no index, so filtering, grouping or sorting by a characteristic scanned every row, and the corpus is heading for many millions of meanders. A GIN index would answer "does this key exist" but not "is this value above 3", and it would still hold each key's name once per row.

The map also carried no description of what a key meant. The name, description, category and formula of a characteristic lived only in the evaluator's metadata, which the database could not see.

## Decision

Two tables replace the column.

- **`characteristics` is the catalog.** One row per characteristic: a `smallint` id, a unique `key`, `name`, `description`, `category`, `valueType`, `isPattern`, an optional `formula` and `documentationUrl`, and `meanderCount`. `isReducible`, which is stored beside the evaluators' values but is a property of the filing, has a row too, so a stored value always has a catalog row.
- **`meander_characteristics` is the bridge.** One row per meander and characteristic it holds: `meanderId`, `characteristicId` and a `NOT NULL` `value`, where a true boolean is 1. The primary key is `(meanderId, characteristicId)`, with a secondary index on `(characteristicId, value, meanderId)`. A check constraint refuses a `value` of 0 or less, and both foreign keys cascade.
- **Only true booleans and numbers above 0 are stored.** A missing row means 0 or false, as the map's missing key did. The cutoff moves from "not zero" to "above 0".
- **`value` is `double precision`.** `density` is a fraction.
- **The catalog follows the evaluators.** Each draw run, and each `--code` run, upserts one row per registered evaluator and deletes the rows whose key is no longer registered. Their bridge rows cascade with them, so a removed or renamed evaluator leaves nothing behind.
- **No data migrates.** The migration empties `meanders`, drops the column and creates the tables. The corpus is recomputed by re-running the draw.
- **`clear` truncates both tables together.** The bridge references `meanders`, so a `TRUNCATE` of `meanders` alone is refused; the catalog is left in place.
- **A worker thread still returns a sparse map.** The main thread writes the meander rows with `RETURNING id`, then the bridge rows from three parallel arrays, so the pool never touches the database.
- **Pattern pages read through the bridge.** `patternRows` selects the meanders holding a key and attaches the booleans each holds for its caption. `patternShapeCounts` counts from the bridge.

### Negative values

The cutoff only holds if no characteristic can be negative, since a negative value would read as 0. Three characteristics are written as differences: `tileCrossingComponentDeltaCount`, `tileCrossingCount` and `tileCrossingCycleCount`. Each compares the repeat read as a cyclic band with the same repeat read as a lone tile, and each should be non-negative because the band's graph contains the tile's.

That was checked against the data rather than taken from the argument. Every characteristic was computed for every entry of the historical corpus and for every enumerated meander within the 12-edge test budget. None was negative, and `density` was the only non-integer. `CharacteristicsService.stored` also throws on a negative number now, so a future evaluator that can go below 0 fails loudly rather than vanishing from the bridge.

## Consequences

- A new evaluator appears in the catalog after the next draw run, with no schema change, as ADR 0023 promised.
- Filtering by a characteristic is an index range over `(characteristicId, value, meanderId)` rather than a scan, and each characteristic's rows are contiguous.
- A rare pattern's page query still walks the `(rows, columns, code)` index and probes the bridge by primary key for each row. It was the same cost against the map.
- The bridge may hold hundreds of millions of rows. If the indexes prove too slow, the next step is to list-partition it by `characteristicId`; it is not needed yet.
- Every write to the bridge needs the catalog to be current. Saving a meander that holds an unregistered key throws `UnknownCharacteristicError`.
- The aggregate count tables, and the `aggregate` command that rebuilds them and `meanderCount`, are separate work.
