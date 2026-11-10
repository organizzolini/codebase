<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-measurement`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 106 |
| Files | 35 |
| Calls traced | 121 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 5 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 14 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeasureService.measure` | 9 | `CustomizationService.buildCommentCounters`, `CustomizationService.buildSymbolCounters`, `MeasureService.measureInput`, `MeasureService.describeFailure`, `MetricIndexService.index`, `LimitsService.evaluate`, `MeasureService.find(…)`, `MeasureService.map(…)`, `MeasureService.readLimitFailures` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:312` |
| `InputsService.matchFiles` | 7 | `InputsService.findBoundary`, `InputsService.sitsInsideBoundary`, `InputOutsideRepositoryError.constructor`, `InputsService.readInputPrefix`, `InputsService.walk`, `InputsService.map(…)`, `InputsService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:282` |
| `DiscoveryService.categorize` | 6 | `DiscoveryService.filter(…)`, `DiscoveryService.filterByExtension`, `DiscoveryService.filter(…)`, `DiscoveryService.filter(…)`, `DiscoveryService.filter(…)`, `DiscoveryService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:285` |

<details>
<summary>44 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeasureService.analyzeFiles` | 6 | `LanguagesService.analyze`, `SizeService.analyze`, `CustomizationService.analyze`, `MeasureService.getFolderCount`, `MeasureService.buildJavascriptStatistics`, `MeasureService.buildTypescriptStatistics` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:75` |
| `LimitsService.resolve` | 5 | `LimitsService.findCandidates`, `UnboundMetricError.constructor`, `LimitsService.describeTargets`, `LimitsService.map(…)`, `EmptyTargetError.constructor` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:156` |
| `MeasureService.measureInput` | 5 | `MeasureService.discoverInputFiles`, `MeasureService.runsAnalysis`, `MeasureService.analyzeFiles`, `DiscoveryService.categorize`, `SizeService.analyze` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:253` |
| `DiscoveryService.walkDirectory` | 4 | `DiscoveryService.readDirectoryEntries`, `DiscoveryService.applyDirectoryIgnoreFile`, `DiscoveryService.walkSubdirectory`, `DiscoveryService.isIgnoredPath` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:217` |
| `InputsService.walk` | 4 | `InputsService.readEntries`, `InputsService.resolveEntryKind`, `InputsService.canDescend`, `InputsService.isMatched` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:239` |
| `DiscoveryService.listDiscoveredFiles` | 3 | `DiscoveryService.walkDirectory`, `DiscoveryService.readExcludeFromScopes`, `DiscoveryService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:145` |
| `DiscoveryService.walkSubdirectory` | 3 | `DiscoveryService.isExhaustivelyExcluded`, `DiscoveryService.isIgnoredPath`, `DiscoveryService.walkDirectory` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:261` |
| `LimitsService.findDefaultCandidate` | 3 | `UnboundMetricError.constructor`, `LimitsService.describeTargets`, `LimitsService.bind` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:124` |
| `MeasureService.discoverInputFiles` | 3 | `DiscoveryService.discoverFiles`, `InputsService.matchFiles`, `MeasureService.excludeOutputPaths` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:189` |
| `CustomizationService.buildCommentResult` | 2 | `CustomizationService.filter(…)`, `CustomizationService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:41` |
| `CustomizationService.map(…)` | 2 | `CustomizationService.buildCommentResult`, `CustomizationService.countMatches` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:84` |
| `DiscoveryService.discoverFiles` | 2 | `DiscoveryService.categorize`, `DiscoveryService.listDiscoveredFiles` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:317` |
| `InputsService.canDescend` | 2 | `InputsService.isHidden`, `InputsService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:50` |
| `InputsService.some(…)` | 2 | `InputsService.leadsToBase`, `InputsService.sitsInsideBase` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:56` |
| `InputsService.isMatched` | 2 | `InputsService.some(…)`, `InputsService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:126` |
| `LimitsService.findCandidates` | 2 | `LimitsService.bind`, `LimitsService.findDefaultCandidate` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:86` |
| `LimitsService.evaluate` | 2 | `LimitsService.resolve`, `LimitsService.describeFailure` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:200` |
| `MetricIndexService.buildTargetIndex` | 2 | `MetricIndexService.addMetric`, `MetricIndexService.indexLanguage` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:67` |
| `MetricIndexService.indexCounters` | 2 | `MetricIndexService.addMetric`, `MetricIndexService.isCounterGroup` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:111` |
| `MetricIndexService.indexLanguage` | 2 | `MetricIndexService.indexCounters`, `MetricIndexService.addMetric` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:135` |
| `MetricIndexService.index` | 2 | `MetricIndexService.describeDuplicate`, `MetricIndexService.buildTargetIndex` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:168` |
| `SizeService.measureFile` | 2 | `SizeService.compress`, `UnreadableTargetFileError.constructor` | `projects/ic-suite/codometer/codometer-measurement/src/modules/size/size.service.ts:61` |
| `CustomizationService.countMatches` | 1 | `CustomizationService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:69` |
| `CustomizationService.filter(…)` | 1 | `CustomizationService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:70` |
| `CustomizationService.analyze` | 1 | `CustomizationService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:78` |
| `CustomizationService.buildSymbolCounters` | 1 | `CustomizationService.flatMap(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:146` |
| `IgnoreRulesService.isIgnored` | 1 | `IgnoreRulesService.toScopedPath` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/ignore-rules.service.ts:84` |
| `IgnoreRulesService.readScope` | 1 | `IgnoreRulesService.createScope` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/ignore-rules.service.ts:115` |
| `DiscoveryService.applyDirectoryIgnoreFile` | 1 | `IgnoreRulesService.readScope` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:59` |
| `DiscoveryService.filterByExtension` | 1 | `DiscoveryService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:75` |
| `DiscoveryService.isExcluded` | 1 | `DiscoveryService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:91` |
| `DiscoveryService.isExhaustivelyExcluded` | 1 | `DiscoveryService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:105` |
| `DiscoveryService.isIgnoredPath` | 1 | `IgnoreRulesService.isIgnored` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:128` |
| `DiscoveryService.filter(…)` | 1 | `DiscoveryService.isExcluded` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:155` |
| `DiscoveryService.readExcludeFromScopes` | 1 | `IgnoreRulesService.readScope` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:187` |
| `InputsService.findBoundary` | 1 | `InputsService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:72` |
| `InputsService.resolveEntryKind` | 1 | `InputsService.isLinkedFile` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:184` |
| `InputsService.map(…)` | 1 | `InputsService.toIncludeBase` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:300` |
| `LimitsService.bind` | 1 | `UnboundMetricError.constructor` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:41` |
| `LimitsService.describeTargets` | 1 | `LimitsService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:72` |
| `LimitsService.map(…)` | 1 | `LimitsService.describeBinding` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:169` |
| `SizeService.analyze` | 1 | `SizeService.measureFile` | `projects/ic-suite/codometer/codometer-measurement/src/modules/size/size.service.ts:85` |
| `MeasureService.excludeOutputPaths` | 1 | `MeasureService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:216` |
| `MeasureService.readLimitFailures` | 1 | `MeasureService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:282` |

</details>
<!-- callidescope:end -->
