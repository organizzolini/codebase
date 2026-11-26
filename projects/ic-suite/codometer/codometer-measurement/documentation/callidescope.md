<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-measurement`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 123 |
| Files | 39 |
| Calls traced | 139 |
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
| `MeasureService.measure` | 9 | `CustomizationService.buildCommentCounters`, `CustomizationService.buildSymbolCounters`, `MeasureService.measureInput`, `MeasureService.describeFailure`, `MetricIndexService.index`, `LimitsService.evaluate`, `MeasureService.find(…)`, `MeasureService.map(…)`, `MeasureService.readLimitFailures` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:275` |
| `InputsService.matchFiles` | 7 | `InputsService.findBoundary`, `InputsService.sitsInsideBoundary`, `InputOutsideRepositoryError.constructor`, `InputsService.readInputPrefix`, `InputsService.walk`, `InputsService.map(…)`, `InputsService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:242` |
| `DiscoveryService.categorize` | 6 | `DiscoveryService.filter(…)`, `DiscoveryService.filterByExtension`, `DiscoveryService.filter(…)`, `DiscoveryService.filter(…)`, `DiscoveryService.filter(…)`, `DiscoveryService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:239` |

<details>
<summary>52 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MeasureService.analyzeFiles` | 6 | `LanguagesService.analyze`, `SizeService.analyze`, `CustomizationService.analyze`, `MeasureService.getFolderCount`, `MeasureService.buildJavascriptStatistics`, `MeasureService.buildTypescriptStatistics` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:60` |
| `LimitsService.resolve` | 5 | `LimitsService.findCandidates`, `UnboundMetricError.constructor`, `LimitsService.describeTargets`, `LimitsService.map(…)`, `EmptyTargetError.constructor` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:141` |
| `MeasureService.measureInput` | 5 | `MeasureService.discoverInputFiles`, `MeasureService.runsAnalysis`, `MeasureService.analyzeFiles`, `DiscoveryService.categorize`, `SizeService.analyze` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:223` |
| `TreeService.measureBreadth` | 4 | `TreeService.toSorted(…)`, `TreeService.map(…)`, `TreeService.filter(…)`, `TreeService.collectEntries` | `projects/ic-suite/codometer/codometer-measurement/src/modules/tree/tree.service.ts:64` |
| `TreeService.measureDepth` | 4 | `TreeService.collectEntries`, `TreeService.isExcluded`, `TreeService.toSorted(…)`, `TreeService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/tree/tree.service.ts:81` |
| `CustomizationService.buildTreeResult` | 4 | `CustomizationService.filter(…)`, `TreeService.measureDepth`, `TreeService.measureBreadth`, `CustomizationService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:56` |
| `DiscoveryService.walkDirectory` | 4 | `DiscoveryService.readDirectoryEntries`, `DiscoveryService.applyDirectoryIgnoreFile`, `DiscoveryService.walkSubdirectory`, `DiscoveryService.isIgnoredPath` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:178` |
| `InputsService.walk` | 4 | `InputsService.readEntries`, `InputsService.resolveEntryKind`, `InputsService.canDescend`, `InputsService.isMatched` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:210` |
| `CustomizationService.map(…)` | 3 | `CustomizationService.buildCommentResult`, `CustomizationService.buildTreeResult`, `CustomizationService.countMatches` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:112` |
| `DiscoveryService.listDiscoveredFiles` | 3 | `DiscoveryService.walkDirectory`, `DiscoveryService.readExcludeFromScopes`, `DiscoveryService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:121` |
| `DiscoveryService.walkSubdirectory` | 3 | `DiscoveryService.isExhaustivelyExcluded`, `DiscoveryService.isIgnoredPath`, `DiscoveryService.walkDirectory` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:219` |
| `LimitsService.findDefaultCandidate` | 3 | `UnboundMetricError.constructor`, `LimitsService.describeTargets`, `LimitsService.bind` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:114` |
| `MeasureService.discoverInputFiles` | 3 | `DiscoveryService.discoverFiles`, `InputsService.matchFiles`, `MeasureService.excludeOutputPaths` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:168` |
| `CustomizationService.buildCommentResult` | 2 | `CustomizationService.filter(…)`, `CustomizationService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:34` |
| `DiscoveryService.discoverFiles` | 2 | `DiscoveryService.categorize`, `DiscoveryService.listDiscoveredFiles` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:271` |
| `InputsService.canDescend` | 2 | `InputsService.isHidden`, `InputsService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:46` |
| `InputsService.some(…)` | 2 | `InputsService.leadsToBase`, `InputsService.sitsInsideBase` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:52` |
| `InputsService.isMatched` | 2 | `InputsService.some(…)`, `InputsService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:110` |
| `LimitsService.findCandidates` | 2 | `LimitsService.bind`, `LimitsService.findDefaultCandidate` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:80` |
| `LimitsService.evaluate` | 2 | `LimitsService.resolve`, `LimitsService.describeFailure` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:177` |
| `MetricIndexService.buildTargetIndex` | 2 | `MetricIndexService.addMetric`, `MetricIndexService.indexLanguage` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:57` |
| `MetricIndexService.indexCounters` | 2 | `MetricIndexService.addMetric`, `MetricIndexService.isCounterGroup` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:97` |
| `MetricIndexService.indexLanguage` | 2 | `MetricIndexService.indexCounters`, `MetricIndexService.addMetric` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:117` |
| `MetricIndexService.index` | 2 | `MetricIndexService.describeDuplicate`, `MetricIndexService.buildTargetIndex` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/metric-index.service.ts:145` |
| `SizeService.measureFile` | 2 | `SizeService.compress`, `UnreadableTargetFileError.constructor` | `projects/ic-suite/codometer/codometer-measurement/src/modules/size/size.service.ts:52` |
| `TreeService.isExcluded` | 1 | `TreeService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/tree/tree.service.ts:46` |
| `TreeService.some(…)` | 1 | `TreeService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/tree/tree.service.ts:49` |
| `TreeService.filter(…)` | 1 | `TreeService.isExcluded` | `projects/ic-suite/codometer/codometer-measurement/src/modules/tree/tree.service.ts:67` |
| `TreeService.map(…)` | 1 | `TreeService.nameDirectory` | `projects/ic-suite/codometer/codometer-measurement/src/modules/tree/tree.service.ts:71` |
| `CustomizationService.filter(…)` | 1 | `CustomizationService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:64` |
| `CustomizationService.countMatches` | 1 | `CustomizationService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:97` |
| `CustomizationService.filter(…)` | 1 | `CustomizationService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:98` |
| `CustomizationService.analyze` | 1 | `CustomizationService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:106` |
| `CustomizationService.buildSymbolCounters` | 1 | `CustomizationService.flatMap(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/customization/customization.service.ts:167` |
| `IgnoreRulesService.isIgnored` | 1 | `IgnoreRulesService.toScopedPath` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/ignore-rules.service.ts:62` |
| `IgnoreRulesService.readScope` | 1 | `IgnoreRulesService.createScope` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/ignore-rules.service.ts:89` |
| `DiscoveryService.applyDirectoryIgnoreFile` | 1 | `IgnoreRulesService.readScope` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:56` |
| `DiscoveryService.filterByExtension` | 1 | `DiscoveryService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:72` |
| `DiscoveryService.isExcluded` | 1 | `DiscoveryService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:84` |
| `DiscoveryService.isExhaustivelyExcluded` | 1 | `DiscoveryService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:91` |
| `DiscoveryService.isIgnoredPath` | 1 | `IgnoreRulesService.isIgnored` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:108` |
| `DiscoveryService.filter(…)` | 1 | `DiscoveryService.isExcluded` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:131` |
| `DiscoveryService.readExcludeFromScopes` | 1 | `IgnoreRulesService.readScope` | `projects/ic-suite/codometer/codometer-measurement/src/modules/discovery/discovery.service.ts:153` |
| `InputsService.findBoundary` | 1 | `InputsService.some(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:63` |
| `InputsService.resolveEntryKind` | 1 | `InputsService.isLinkedFile` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:159` |
| `InputsService.map(…)` | 1 | `InputsService.toIncludeBase` | `projects/ic-suite/codometer/codometer-measurement/src/modules/inputs/inputs.service.ts:260` |
| `LimitsService.bind` | 1 | `UnboundMetricError.constructor` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:40` |
| `LimitsService.describeTargets` | 1 | `LimitsService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:71` |
| `LimitsService.map(…)` | 1 | `LimitsService.describeBinding` | `projects/ic-suite/codometer/codometer-measurement/src/modules/limits/limits.service.ts:154` |
| `SizeService.analyze` | 1 | `SizeService.measureFile` | `projects/ic-suite/codometer/codometer-measurement/src/modules/size/size.service.ts:72` |
| `MeasureService.excludeOutputPaths` | 1 | `MeasureService.filter(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:190` |
| `MeasureService.readLimitFailures` | 1 | `MeasureService.map(…)` | `projects/ic-suite/codometer/codometer-measurement/src/modules/measure/measure.service.ts:252` |

</details>
<!-- callidescope:end -->
