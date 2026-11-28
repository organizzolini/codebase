<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-output`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 32 |
| Files | 16 |
| Calls traced | 34 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 4 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ReportingService.formatTotal` | 4 | `ReportingService.reduce(…)`, `ReportingService.reduce(…)`, `ReportingService.filter(…)`, `ReportingService.formatFraction` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:216` |
| `ReportingService.formatFileResult` | 3 | `ReportingService.formatFraction`, `ScoringService.sumWeights`, `ReportingService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:96` |
| `ReportingService.formatScores` | 3 | `ReportingService.filter(…)`, `ReportingService.map(…)`, `ReportingService.formatTotal` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:186` |

<details>
<summary>19 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ReportingService.formatFraction` | 2 | `ScoringService.calculateScore`, `ReportingService.formatPercentage` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:128` |
| `ReportingService.formatScore` | 2 | `ReportingService.formatPercentage`, `ReportingService.formatFraction` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:163` |
| `ReportingService.formatReport` | 2 | `ReportingService.formatScores`, `ReportingService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:240` |
| `InventoryService.describePairing` | 1 | `InventoryService.formatRatio` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:40` |
| `InventoryService.describeInstances` | 1 | `InventoryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:66` |
| `InventoryService.flatMap(…)` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:67` |
| `InventoryService.map(…)` | 1 | `InventoryService.describePairing` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:71` |
| `InventoryService.describeTemplates` | 1 | `InventoryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:81` |
| `InventoryService.flatMap(…)` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:85` |
| `InventoryService.map(…)` | 1 | `InventoryService.describePairing` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:96` |
| `InventoryService.shortenInstancePaths` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:107` |
| `InventoryService.map(…)` | 1 | `InventoryService.shortenPath` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:111` |
| `InventoryService.shortenTemplatePairings` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:123` |
| `InventoryService.map(…)` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:127` |
| `InventoryService.map(…)` | 1 | `InventoryService.shortenPath` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:130` |
| `ReportingService.formatError` | 1 | `ReportingService.formatLocation` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:52` |
| `ReportingService.flatMap(…)` | 1 | `ReportingService.formatError` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:113` |
| `ReportingService.map(…)` | 1 | `ReportingService.formatScore` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:200` |
| `ReportingService.flatMap(…)` | 1 | `ReportingService.formatFileResult` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:252` |

</details>
<!-- callidescope:end -->
