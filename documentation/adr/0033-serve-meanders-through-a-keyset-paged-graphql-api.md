# 0033: Serve Meanders Through a Keyset-Paged GraphQL API

Builds on [ADR 0032](0032-store-characteristics-in-a-catalog-and-a-bridge.md): the catalog, the bridge and the count tables it describes are what `meanderaw-api` reads.

## Context

Nothing served the meanders to a browser. The corpus is heading for many millions of rows, so a page of meanders cannot be found with `OFFSET`, a total cannot be counted row by row, and a drawing cannot be rendered for every row a query could return.

## Decision

`meanderaw-api` is a code-first NestJS GraphQL application over `MeanderawDatabaseModule` and `meanderaw-core`.

- **`characteristics`** returns the catalog by key, each with its stored value counts. The 0 or false bucket has no row, as in the count table.
- **`meanders(sort, first, after)`** returns a connection. A sort names a shape field or a characteristic key, in either direction, and a missing characteristic value sorts as 0 or false through a left join on the bridge's primary key.
- **Keyset pagination.** A cursor carries the last row's sort value and id. The next page asks for rows past that pair and orders by the sort, then by id ascending, so a tie never moves between pages and no meander is skipped or repeated. There is no `OFFSET`. A page asks for one more row than it returns, which is how `hasNextPage` is known.
- **`totalCount` is the sum of the shape counts**, an exact figure the aggregate step keeps, rather than a count of the meanders table. It reads 0 before the first draw run's aggregate.
- **`Meander.svg` is a field resolver** that renders through `meanderaw-core`, so only a meander whose query selects `svg` is drawn. It is the document the CLI draws for the same Code. It is not cached: that waits for a measured need.
- **Zod validates the arguments and the cursor at the boundary.** A sort field that is neither a shape field nor in the catalog, a page size outside 1 to 200, and a cursor this API did not issue are each refused with a message.

## Consequences

- A page costs an index range, whatever its depth.
- A sort by a characteristic with a rare value walks the whole table to place the 0 rows, since a missing value is a row that does not exist. Filters, planned from the per-value counts, are the later answer.
- Sorting by `lattice` or `code` orders by the database's text collation, which is stable for a database and consistent with the cursor comparison.
