<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/meanderaw/meanderaw-db`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 50 |
| Files | 22 |
| Calls traced | 62 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | none |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeanderawDatabaseService.writeCharacteristics` | 8 | `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.flatMap(…)`, `MeanderawDatabaseService.find(…)`, `UnknownCharacteristicError.constructor`, `MeanderawDatabaseService.table`, `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:108` |
| `MeanderawDatabaseService.patternRows` | 4 | `MeanderawDatabaseService.table`, `MeanderawDatabaseService.heldBooleans`, `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:181` |
| `MeanderawDatabaseService.saveAll` | 4 | `MeanderawDatabaseService.filter(…)`, `MeanderawDatabaseService.table`, `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.transaction(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:281` |

<details>
<summary>19 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeanderawDatabaseService.transaction(…)` | 4 | `MeanderawDatabaseService.flatMap(…)`, `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.writeCharacteristics`, `MeanderawDatabaseService.invalidateAggregates` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:291` |
| `MeanderawDatabaseService.transaction(…)` | 4 | `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.filter(…)`, `MeanderawDatabaseService.filter(…)`, `MeanderawDatabaseService.invalidateAggregates` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:328` |
| `MeanderawDatabaseAggregatesService.swap` | 3 | `MeanderawDatabaseAggregatesService.table`, `MeanderawDatabaseAggregatesService.map(…)`, `MeanderawDatabaseAggregatesService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/modules/aggregate/meanderaw-database-aggregates.service.ts:35` |
| `MeanderawDatabaseService.patternShapeCounts` | 2 | `MeanderawDatabaseService.table`, `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:233` |
| `MeanderawDatabaseService.transaction(…)` | 2 | `MeanderawDatabaseService.writeCharacteristics`, `MeanderawDatabaseService.invalidateAggregates` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:268` |
| `MeanderawDatabaseService.syncCharacteristics` | 2 | `MeanderawDatabaseService.map(…)`, `MeanderawDatabaseService.transaction(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:323` |
| `MeanderawDatabaseAggregatesService.rebuild` | 2 | `MeanderawDatabaseAggregatesService.table`, `MeanderawDatabaseAggregatesService.transaction(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/modules/aggregate/meanderaw-database-aggregates.service.ts:80` |
| `MeanderawDatabaseAggregatesService.transaction(…)` | 2 | `MeanderawDatabaseAggregatesService.swap`, `MeanderawDatabaseAggregatesService.table` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/modules/aggregate/meanderaw-database-aggregates.service.ts:85` |
| `MeanderawDatabaseService.heldBooleans` | 1 | `MeanderawDatabaseService.table` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:50` |
| `MeanderawDatabaseService.invalidateAggregates` | 1 | `MeanderawDatabaseService.table` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:71` |
| `MeanderawDatabaseService.table` | 1 | `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:96` |
| `MeanderawDatabaseService.flatMap(…)` | 1 | `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:116` |
| `MeanderawDatabaseService.clear` | 1 | `MeanderawDatabaseService.table` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:154` |
| `MeanderawDatabaseService.codes` | 1 | `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:163` |
| `MeanderawDatabaseService.save` | 1 | `MeanderawDatabaseService.transaction(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:265` |
| `MeanderawDatabaseService.flatMap(…)` | 1 | `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:298` |
| `MeanderawDatabaseService.map(…)` | 1 | `MeanderawDatabaseService.persistentValue` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:299` |
| `MeanderawDatabaseService.map(…)` | 1 | `MeanderawDatabaseService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/meanderaw-database.service.ts:302` |
| `MeanderawDatabaseAggregatesService.table` | 1 | `MeanderawDatabaseAggregatesService.map(…)` | `projects/meanderaw/meanderaw-db/src/modules/meanderaw-database/modules/aggregate/meanderaw-database-aggregates.service.ts:69` |

</details>
<!-- callidescope:end -->
