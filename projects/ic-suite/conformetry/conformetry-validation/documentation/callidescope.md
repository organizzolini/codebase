<!-- callidescope:start -->

## 🔬 Callidescope

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
| `ValidationService.validate` | 10 | `ConfigurationService.matchInstances`, `ValidationService.selectValidators`, `LanguagesService.resolveValidators`, `ValidationService.readTemplateExtensions`, `ValidationService.map(…)`, `ValidationScoringService.scoreInstances`, `ValidationDeduplicationService.deduplicate`, `ValidationFindingsService.buildUnmatchedResults`, `ValidationService.map(…)`, `ValidationService.every(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:177` |
| `ValidationService.compareInstance` | 6 | `ConfigurationService.prepareDocuments`, `ValidationService.readClaimedExtensions`, `FilesService.checkInstanceFiles`, `ValidationService.map(…)`, `ValidationService.flatMap(…)`, `ValidationService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:52` |
| `ValidationScoringService.scoreInstance` | 5 | `ValidationScoringService.reduce(…)`, `ScoringService.calculateScore`, `ValidationScoringService.resolveThreshold`, `ValidationScoringService.resolveInstancePath`, `ValidationScoringService.some(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:65` |

<details>
<summary>26 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ValidationService.inferPlaceholders` | 5 | `ConfigurationService.prepareDocuments`, `ValidationService.readClaimedExtensions`, `RunnerService.captureDocuments`, `ValidationService.flatMap(…)`, `ValidationService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:91` |
| `RunnerService.runValidator` | 4 | `RunnerService.map(…)`, `RunnerService.filter(…)`, `RunnerService.filter(…)`, `RunnerService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:92` |
| `ValidationFindingsService.reportMissingPlaceholders` | 3 | `ValidationFindingsService.filter(…)`, `ValidationFindingsService.map(…)`, `ValidationFindingsService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:104` |
| `ValidationService.map(…)` | 3 | `ValidationService.inferPlaceholders`, `ValidationFindingsService.reportMissingPlaceholders`, `ValidationService.compareInstance` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:188` |
| `ValidationDeduplicationService.deduplicate` | 2 | `ValidationDeduplicationService.selectOwners`, `ValidationDeduplicationService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:78` |
| `ValidationFindingsService.buildUnmatchedResults` | 2 | `ValidationFindingsService.resolveTemplatesRootPath`, `ValidationFindingsService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:66` |
| `ValidationScoringService.scoreInstances` | 2 | `ValidationScoringService.scoreInstance`, `ValidationScoringService.resolveScoreKey` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:100` |
| `RunnerService.captureDocuments` | 1 | `RunnerService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:68` |
| `RunnerService.reduce(…)` | 1 | `RunnerService.find(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:73` |
| `RunnerService.find(…)` | 1 | `RunnerService.claimsDocument` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:74` |
| `RunnerService.filter(…)` | 1 | `RunnerService.claimsDocument` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:96` |
| `RunnerService.map(…)` | 1 | `RunnerService.validateDocument` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/runner/runner.service.ts:99` |
| `ValidationDeduplicationService.selectOwners` | 1 | `ValidationDeduplicationService.compareInstances` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:50` |
| `ValidationDeduplicationService.flatMap(…)` | 1 | `ValidationDeduplicationService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:82` |
| `ValidationDeduplicationService.filter(…)` | 1 | `ValidationDeduplicationService.resolveFindingKey` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-deduplication.service.ts:83` |
| `ValidationFindingsService.resolveTemplatesRootPath` | 1 | `ValidationFindingsService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:55` |
| `ValidationFindingsService.map(…)` | 1 | `ValidationFindingsService.describeReason` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:72` |
| `ValidationFindingsService.map(…)` | 1 | `ValidationFindingsService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:116` |
| `ValidationFindingsService.filter(…)` | 1 | `ValidationFindingsService.some(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-findings.service.ts:119` |
| `ValidationScoringService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:66` |
| `ValidationScoringService.some(…)` | 1 | `ValidationScoringService.some(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation-scoring.service.ts:83` |
| `ValidationService.map(…)` | 1 | `RunnerService.runValidator` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:63` |
| `ValidationService.readClaimedExtensions` | 1 | `ValidationService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:131` |
| `ValidationService.readTemplateExtensions` | 1 | `ValidationService.flatMap(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:140` |
| `ValidationService.flatMap(…)` | 1 | `ValidationService.map(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:143` |
| `ValidationService.selectValidators` | 1 | `ValidationService.filter(…)` | `projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:153` |

</details>
<!-- callidescope:end -->
