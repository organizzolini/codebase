<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-validation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 58 |
| Files | 19 |
| Calls traced | 61 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 13 |
| `maximumBreadth` | 10 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ValidationService.validate` | 10 | `ConfigurationService.matchInstances`, `ValidationService.selectValidators`, `LanguagesService.resolveValidators`, `ValidationService.readTemplateExtensions`, `ValidationService.map(…)`, `ValidationScoringService.scoreInstances`, `ValidationDeduplicationService.deduplicate`, `ValidationFindingsService.buildUnmatchedResults`, `ValidationService.map(…)`, `ValidationService.every(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:194` |
| `ValidationService.compareInstance` | 6 | `ConfigurationService.prepareDocuments`, `ValidationService.readClaimedExtensions`, `FilesService.checkInstanceFiles`, `ValidationService.map(…)`, `ValidationService.flatMap(…)`, `ValidationService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:57` |
| `ValidationScoringService.scoreInstance` | 5 | `ValidationScoringService.reduce(…)`, `ScoringService.calculateScore`, `ValidationScoringService.resolveThreshold`, `ValidationScoringService.resolveInstancePath`, `ValidationScoringService.some(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:74` |

<details>
<summary>26 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ValidationService.inferPlaceholders` | 5 | `ConfigurationService.prepareDocuments`, `ValidationService.readClaimedExtensions`, `RunnerService.captureDocuments`, `ValidationService.flatMap(…)`, `ValidationService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:102` |
| `RunnerService.runValidator` | 4 | `RunnerService.map(…)`, `RunnerService.filter(…)`, `RunnerService.filter(…)`, `RunnerService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:108` |
| `ValidationFindingsService.reportMissingPlaceholders` | 3 | `ValidationFindingsService.filter(…)`, `ValidationFindingsService.map(…)`, `ValidationFindingsService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:109` |
| `ValidationService.map(…)` | 3 | `ValidationService.inferPlaceholders`, `ValidationFindingsService.reportMissingPlaceholders`, `ValidationService.compareInstance` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:205` |
| `ValidationDeduplicationService.deduplicate` | 2 | `ValidationDeduplicationService.selectOwners`, `ValidationDeduplicationService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:90` |
| `ValidationFindingsService.buildUnmatchedResults` | 2 | `ValidationFindingsService.resolveTemplatesRootPath`, `ValidationFindingsService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:69` |
| `ValidationScoringService.scoreInstances` | 2 | `ValidationScoringService.scoreInstance`, `ValidationScoringService.resolveScoreKey` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:119` |
| `RunnerService.captureDocuments` | 1 | `RunnerService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:75` |
| `RunnerService.reduce(…)` | 1 | `RunnerService.find(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:80` |
| `RunnerService.find(…)` | 1 | `RunnerService.claimsDocument` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:81` |
| `RunnerService.filter(…)` | 1 | `RunnerService.claimsDocument` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:112` |
| `RunnerService.map(…)` | 1 | `RunnerService.validateDocument` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:115` |
| `ValidationDeduplicationService.selectOwners` | 1 | `ValidationDeduplicationService.compareInstances` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:57` |
| `ValidationDeduplicationService.flatMap(…)` | 1 | `ValidationDeduplicationService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:94` |
| `ValidationDeduplicationService.filter(…)` | 1 | `ValidationDeduplicationService.resolveFindingKey` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:95` |
| `ValidationFindingsService.resolveTemplatesRootPath` | 1 | `ValidationFindingsService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:58` |
| `ValidationFindingsService.map(…)` | 1 | `ValidationFindingsService.describeReason` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:75` |
| `ValidationFindingsService.map(…)` | 1 | `ValidationFindingsService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:121` |
| `ValidationFindingsService.filter(…)` | 1 | `ValidationFindingsService.some(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:124` |
| `ValidationScoringService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:75` |
| `ValidationScoringService.some(…)` | 1 | `ValidationScoringService.some(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:92` |
| `ValidationService.map(…)` | 1 | `RunnerService.runValidator` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:68` |
| `ValidationService.readClaimedExtensions` | 1 | `ValidationService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:142` |
| `ValidationService.readTemplateExtensions` | 1 | `ValidationService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:151` |
| `ValidationService.flatMap(…)` | 1 | `ValidationService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:154` |
| `ValidationService.selectValidators` | 1 | `ValidationService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:164` |

</details>
<!-- callidescope:end -->
