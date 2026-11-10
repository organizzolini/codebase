<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-output`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 166 |
| Files | 47 |
| Calls traced | 346 |
| Call stacks | 2 |
| Deepest stack | 4 |
| Stacks through recursion | 0 |
| Unfollowable calls | 4 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 11 |
| `maximumBreadth` | 16 |

### Call stacks (depth)

**1. `MarkdownService.syncAnchoredBlock`** — depth ≥ 4 · orphan-root

```text
🚀 MarkdownService.syncAnchoredBlock(…): boolean [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:80]
  └─> MarkdownService.syncAnchoredBlock(args: SyncAnchoredBlockArguments): boolean [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:204]
     ↳ Splice the anchored block into a file, or report whether it is current.
    └─> MarkdownService.buildBlockRegex(args: { endMarker: string; startMarker: string; }): RegExp [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:135]
       ↳ Build the matcher for a block delimited by the configured markers.
      └─> MarkdownService.escapeRegex(input: string): string [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:147]
         ↳ Escape a configured marker so it can be searched for literally.
```

**2. `MarkdownService.wrapInAnchors`** — depth 2 · orphan-root

```text
🚀 MarkdownService.wrapInAnchors(content?: string | undefined): string [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:87]
  └─> MarkdownService.wrapInAnchors(args: WrapInAnchorsArguments): string [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:246]
     ↳ Wrap rendered markdown in the configured anchor markers.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MarkdownService.buildBadgeGroups` | 16 | `MarkdownService.filter(…)`, `buildRepositoryGroup`, `buildTargetsGroup`, `buildTypescriptGroup`, `buildJavascriptGroup`, `buildPythonGroup`, `buildJsonGroup`, `buildYamlGroup`, `buildTomlGroup`, `buildShellGroup`, `buildSqlGroup`, `buildHclGroup`, `buildCssGroup`, `buildCustomGroup`, `buildJupyterGroup`, `buildMarkdownGroup` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:108` |
| `ChangesService.collectProjectRows` | 7 | `ChangesService.readProjectName`, `ChangesService.readBaseline`, `ChangesService.readReport`, `ChangesService.map(…)`, `ChangesService.map(…)`, `ChangesService.buildBaselineRow`, `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:110` |
| `MarkdownService.syncAnchoredBlock` | 6 | `MissingMarkdownPathError.constructor`, `MarkdownService.readExisting`, `MarkdownService.wrapInAnchors`, `MarkdownService.buildBlockRegex`, `MarkdownService.writeMarkdownFile`, `MarkdownService.replace(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:204` |

<details>
<summary>85 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `RenderService.renderSection` | 6 | `RenderService.groupByProject(…)`, `RenderService.groupByProject`, `RenderService.groupByProject(…)`, `RenderService.flatMap(…)`, `RenderService.readProjects`, `RenderService.renderComparison` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:154` |
| `ChangesService.collect` | 4 | `ChangesService.map(…)`, `ChangesService.readReportPaths`, `ChangesService.flatMap(…)`, `ChangesService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:292` |
| `ConfigurationListingService.findConfigurationFiles` | 4 | `ConfigurationListingService.resolveWalkExclusions`, `DiscoveryService.discoverFiles`, `ConfigurationListingService.toSorted(…)`, `ConfigurationListingService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:179` |
| `buildRepositoryGroup` | 4 | `buildGroup`, `buildBadge`, `formatBytes`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:263` |
| `RenderService.renderProject` | 4 | `RenderService.filter(…)`, `RenderService.readIsOpen`, `RenderService.renderFailures`, `RenderService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:106` |
| `ChangesService.map(…)` | 3 | `ChangesService.readBreach`, `ChangesService.readLabel`, `ChangesService.readGoverningLimit` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:223` |
| `ChangesService.readReportPaths` | 3 | `ChangesService.flatMap(…)`, `ChangesService.map(…)`, `ChangesService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:267` |
| `RenderConfigurationService.renderDirectory` | 3 | `RenderConfigurationService.renderNames`, `RenderConfigurationService.map(…)`, `RenderConfigurationService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:36` |
| `RenderConfigurationService.renderLimitsTable` | 3 | `RenderConfigurationService.renderRow`, `RenderConfigurationService.map(…)`, `RenderConfigurationService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:64` |
| `RenderConfigurationService.render` | 3 | `RenderConfigurationService.renderRootError`, `RenderConfigurationService.renderLimitsTable`, `RenderConfigurationService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:117` |
| `buildCssGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:23` |
| `buildHclGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:116` |
| `buildJsonGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:156` |
| `buildJupyterGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:177` |
| `buildMarkdownGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:206` |
| `buildPythonGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:235` |
| `buildShellGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:281` |
| `buildSqlGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:301` |
| `buildTomlGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:352` |
| `buildTypescriptGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:368` |
| `buildYamlGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:383` |
| `MarkdownService.sync` | 3 | `MarkdownService.scopeCustomStatistics`, `MarkdownService.renderDocument`, `MarkdownService.buildAnchorHelpers` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:355` |
| `DeliveryService.deliverConsole` | 3 | `JsonService.render`, `MarkdownService.renderBlock`, `DeliveryService.readTargetSizes` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:48` |
| `DeliveryService.deliverMarkdown` | 3 | `DeliveryService.touchesFiles`, `MarkdownService.sync`, `DeliveryService.readTargetSizes` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:104` |
| `DeliveryService.deliver` | 3 | `DeliveryService.deliverConsole`, `DeliveryService.deliverJson`, `DeliveryService.deliverMarkdown` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:166` |
| `DocumentsService.emit` | 3 | `DocumentsService.wrap`, `DocumentsService.readDocument`, `DocumentsService.splice` | `projects/ic-suite/codometer/codometer-output/src/modules/documents/documents.service.ts:51` |
| `RenderService.renderRow` | 3 | `RenderService.readStatus`, `formatValue`, `formatDelta` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:134` |
| `ReportService.buildMetrics` | 3 | `ReportService.buildMetricName`, `ReportService.map(…)`, `ReportService.readUnit` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:52` |
| `ChangesService.readBaseline` | 2 | `ChangesService.readReport`, `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:154` |
| `ChangesService.readBreach` | 2 | `ChangesService.filter(…)`, `ChangesService.some(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:175` |
| `ChangesService.readGoverningLimit` | 2 | `ChangesService.filter(…)`, `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:195` |
| `ChangesService.readReport` | 2 | `ChangesService.parseReport`, `ChangesService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:243` |
| `formatValue` | 2 | `formatBytes`, `formatCount` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.utilities.ts:34` |
| `ConfigurationListingService.formatLimitValue` | 2 | `formatBytes`, `formatCount` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:100` |
| `ConfigurationListingService.describeConfigurations` | 2 | `ConfigurationListingService.findConfigurationFiles`, `ConfigurationListingService.describeConfiguration` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:146` |
| `JsonService.sync` | 2 | `JsonService.render`, `JsonService.readExisting` | `projects/ic-suite/codometer/codometer-output/src/modules/json/json.service.ts:62` |
| `buildCustomBadges` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:47` |
| `buildCustomGroup` | 2 | `buildCustomBadges`, `buildGroup` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:64` |
| `buildCustomStatisticInstancesSection` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:85` |
| `map(…)` | 2 | `map(…)`, `buildGroup` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:90` |
| `buildJavascriptGroup` | 2 | `buildGroup`, `buildBadge` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:134` |
| `buildTargetsGroup` | 2 | `buildGroup`, `map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:334` |
| `map(…)` | 2 | `buildBadge`, `formatTargetSize` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:345` |
| `MarkdownService.scopeCustomStatistics` | 2 | `MarkdownService.map(…)`, `MarkdownService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:173` |
| `MarkdownService.renderBadges` | 2 | `MarkdownService.renderDocument`, `MarkdownService.scopeCustomStatistics` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:283` |
| `MarkdownService.renderBlock` | 2 | `MarkdownService.wrapInAnchors`, `MarkdownService.renderBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:298` |
| `MarkdownService.renderDocument` | 2 | `MarkdownService.buildBadgeGroups`, `buildCustomStatisticInstancesSection` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:322` |
| `DeliveryService.deliverJson` | 2 | `DeliveryService.touchesFiles`, `JsonService.sync` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:75` |
| `DestinationsService.resolveMarkdown` | 2 | `DestinationsService.findConfiguredOutput`, `DestinationsService.resolvePath` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:119` |
| `DestinationsService.listOutputPaths` | 2 | `DestinationsService.map(…)`, `DestinationsService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:191` |
| `DestinationsService.resolveDestinations` | 2 | `DestinationsService.resolveJson`, `DestinationsService.resolveMarkdown` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:234` |
| `RenderService.readProjects` | 2 | `RenderService.map(…)`, `RenderService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:55` |
| `ReportService.build` | 2 | `ReportService.indexLimits`, `ReportService.buildMetrics` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:121` |
| `ChangesService.map(…)` | 1 | `ChangesService.buildMeasuredRow` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:120` |
| `ChangesService.readLabel` | 1 | `ChangesService.find(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:206` |
| `ChangesService.readMetrics` | 1 | `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:222` |
| `ChangesService.flatMap(…)` | 1 | `ChangesService.readMetrics` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:259` |
| `ChangesService.map(…)` | 1 | `ChangesService.collectProjectRows` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:293` |
| `formatDelta` | 1 | `formatValue` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.utilities.ts:24` |
| `ConfigurationListingService.describeConfiguration` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:66` |
| `ConfigurationListingService.resolveWalkExclusions` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:115` |
| `ConfigurationListingService.toLimitRows` | 1 | `ConfigurationListingService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:198` |
| `ConfigurationListingService.flatMap(…)` | 1 | `ConfigurationListingService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:201` |
| `ConfigurationListingService.map(…)` | 1 | `ConfigurationListingService.formatLimitValue` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:202` |
| `RenderConfigurationService.map(…)` | 1 | `RenderConfigurationService.renderRow` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:72` |
| `RenderConfigurationService.map(…)` | 1 | `RenderConfigurationService.renderDirectory` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:144` |
| `buildBadge` | 1 | `encodeValue` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:14` |
| `map(…)` | 1 | `buildBadge` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:53` |
| `formatTargetSize` | 1 | `formatBytes` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:420` |
| `MarkdownService.syncAnchoredBlock` | 1 | `MarkdownService.syncAnchoredBlock` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:80` |
| `MarkdownService.wrapInAnchors` | 1 | `MarkdownService.wrapInAnchors` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:87` |
| `MarkdownService.buildBlockRegex` | 1 | `MarkdownService.escapeRegex` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:135` |
| `DeliveryService.readTargetSizes` | 1 | `DeliveryService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:139` |
| `DestinationsService.findConfiguredOutput` | 1 | `DestinationsService.find(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:50` |
| `DestinationsService.resolveJson` | 1 | `DestinationsService.findConfiguredOutput` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:61` |
| `DestinationsService.resolveConsoleMarkdown` | 1 | `DestinationsService.resolveMarkdown` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:219` |
| `DestinationsService.selectScope` | 1 | `DestinationsService.some(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:258` |
| `DocumentsService.splice` | 1 | `DocumentsService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/documents/documents.service.ts:88` |
| `RenderService.readIsOpen` | 1 | `RenderService.some(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:47` |
| `RenderService.renderFailures` | 1 | `RenderService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:89` |
| `RenderService.filter(…)` | 1 | `hasChanged` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:111` |
| `RenderService.map(…)` | 1 | `RenderService.renderRow` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:127` |
| `RenderService.flatMap(…)` | 1 | `RenderService.renderProject` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:161` |
| `ReportService.map(…)` | 1 | `ReportService.buildLimit` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:64` |
| `ReportService.indexLimits` | 1 | `ReportService.buildMetricName` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:88` |

</details>
<!-- callidescope:end -->
