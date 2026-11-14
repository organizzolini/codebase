# 0034: Filter Meanders by a Rule Tree Planned From the Value Counts

Builds on [ADR 0033](0033-serve-meanders-through-a-keyset-paged-graphql-api.md): `meanders` gains a `filter` argument that composes with its sort and cursor.

## Context

Researchers narrow millions of meanders by characteristic and shape. A characteristic is a sparse bridge row, so a missing row has to read as 0 or false, or a filter like "junctionCount < 3" silently drops the meanders that never earned a row.

## Decision

- **The filter is a tree** of and/or groups, each holding rules and nested groups, shaped like Caelundas' event filter. A rule names a shape field (rows, columns, repeats, lattice, isHardcoded) or a characteristic key, an operator and a value. Numbers take `eq`, `ne`, `lt`, `lte`, `gt`, `gte` and `between`; booleans take `is` and `is_not`; the lattice takes `eq` and `ne` with a text.
- **A missing row reads as 0 or false for every operator.** A numeric rule reads the bridge through its primary key and `COALESCE`s a missing row to 0; a boolean rule tests whether the row exists.
- **A flat AND tree starts from its most selective rule.** Among the characteristic rules a missing row cannot satisfy, the one with the fewest meanders, summed from the per-value counts, becomes an index range scan on `(characteristicId, value, meanderId)`; every other rule is probed through the primary key. OR and nested trees are probed row by row and may run slower.
- **`totalCount` is counted exactly under a filter**, from the same query shape, and still comes from the shape counts when there is none.
- **Zod validates the tree** at the boundary, and the catalog check refuses an unknown field or an operator the field cannot take, each with a message naming the rule. Trees nest at most 6 deep and hold at most 32 rules or groups per group.

## Consequences

- A selective rule costs an index range, whatever the table's size; a filter made only of rules a missing row satisfies still walks the table.
- No estimate is shown: every count is exact.
- The brute-force end-to-end tests are the contract: any tree must return what an independent evaluator returns.
