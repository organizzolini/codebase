<!-- callidescope:start -->

## 🔭 Callidescope

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
| `ReportingService.formatTotal` | 4 | `ReportingService.reduce(…)`, `ReportingService.reduce(…)`, `ReportingService.filter(…)`, `ReportingService.formatFraction` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:234` |
| `ReportingService.formatFileResult` | 3 | `ReportingService.formatFraction`, `ScoringService.sumWeights`, `ReportingService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:98` |
| `ReportingService.formatScores` | 3 | `ReportingService.filter(…)`, `ReportingService.map(…)`, `ReportingService.formatTotal` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:197` |

<details>
<summary>19 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ReportingService.formatFraction` | 2 | `ScoringService.calculateScore`, `ReportingService.formatPercentage` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:131` |
| `ReportingService.formatScore` | 2 | `ReportingService.formatPercentage`, `ReportingService.formatFraction` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:166` |
| `ReportingService.formatReport` | 2 | `ReportingService.formatScores`, `ReportingService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:262` |
| `InventoryService.describePairing` | 1 | `InventoryService.formatRatio` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:48` |
| `InventoryService.describeInstances` | 1 | `InventoryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:77` |
| `InventoryService.flatMap(…)` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:78` |
| `InventoryService.map(…)` | 1 | `InventoryService.describePairing` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:82` |
| `InventoryService.describeTemplates` | 1 | `InventoryService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:94` |
| `InventoryService.flatMap(…)` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:98` |
| `InventoryService.map(…)` | 1 | `InventoryService.describePairing` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:109` |
| `InventoryService.shortenInstancePaths` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:120` |
| `InventoryService.map(…)` | 1 | `InventoryService.shortenPath` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:124` |
| `InventoryService.shortenTemplatePairings` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:136` |
| `InventoryService.map(…)` | 1 | `InventoryService.map(…)` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:140` |
| `InventoryService.map(…)` | 1 | `InventoryService.shortenPath` | `projects/ic-suite/conformetry/conformetry-output/src/modules/inventory/inventory.service.ts:143` |
| `ReportingService.formatError` | 1 | `ReportingService.formatLocation` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:54` |
| `ReportingService.flatMap(…)` | 1 | `ReportingService.formatError` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:115` |
| `ReportingService.map(…)` | 1 | `ReportingService.formatScore` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:211` |
| `ReportingService.flatMap(…)` | 1 | `ReportingService.formatFileResult` | `projects/ic-suite/conformetry/conformetry-output/src/modules/reporting/reporting.service.ts:274` |

</details>
<!-- callidescope:end -->
