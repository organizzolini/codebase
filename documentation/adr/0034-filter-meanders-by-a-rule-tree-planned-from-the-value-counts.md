# 0034: Filter Meanders by a Rule Tree Planned From the Value Counts

Builds on [ADR 0033](0033-serve-meanders-through-a-keyset-paged-graphql-api.md): `meanders` gains a `filter` argument that composes with its sort and cursor.

## Context

Researchers narrow millions of meanders by characteristic and shape. A characteristic is a sparse bridge row, so a missing row has to read as 0 or false, or a filter like "junctionCount < 3" silently drops the meanders that never earned a row.

## Decision

- **The filter is a tree** of and/or groups, each holding rules and nested groups, shaped like Caelundas' event filter. A rule names a shape field (rows, columns, repeats, lattice, isHardcoded) or a characteristic key, an operator and a value. Numbers take `eq`, `ne`, `lt`, `lte`, `gt`, `gte` and `between`; booleans take `is` and `is_not`; the lattice takes `eq` and `ne` with a text.
- **A missing row reads as 0 or false for every operator.** A numeric rule reads the bridge through its primary key and `COALESCE`s a missing row to 0; a boolean rule tests whether the row exists.
- **A flat AND tree starts from its most selective rule.** Among the characteristic rules a missing row cannot satisfy, the one with the fewest meanders, summed from the per-value counts, becomes an index range scan on `(characteristicId, value, meanderId)`; every other rule is probed through the primary key. OR and nested trees are probed row by row and may run slower.
- **`totalCount` is counted exactly under a filter**, from the same query shape, and still comes from the shape counts when there is none.
- **A cursor is bound to its filter** by a hash of the validated tree, as it is to its sort, so a cursor cannot page a different filter.
- **Raw SQL names the bridge schema-qualified**, from the entity's metadata.
- **Zod validates the tree** at the boundary: each operator takes exactly the value it needs, shape numbers must be whole and within the safe integer range, and the catalog check refuses an unknown field or an operator the field cannot take, each with a message naming the rule. A tree nests at most 6 deep and holds at most 128 rules and groups in all, counted before it is parsed, so a request binds at most a few hundred parameters.

## Consequences

- A selective rule costs an index range rather than a table walk. One local run on 400,000 meanders and 300,000 bridge rows, with a rule on a 1,000th of them and a rule on three quarters, took 0.7 to 5 ms planned against 340 to 420 ms unplanned, with the plans an index range into a nested loop against a sequential scan probing each row. That run matched no meanders, so it measures the scan and not the paging; it is one machine, not a benchmark. A filter made only of rules a missing row satisfies still walks the table.
- No estimate is shown: every count is exact.
- The end-to-end tests are the contract: seeded trees, random nested trees with negative and zero-spanning bounds, and every rule order must return what a small evaluator written in the tests returns.
