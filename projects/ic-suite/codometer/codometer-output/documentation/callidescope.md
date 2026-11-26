<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-output`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 167 |
| Files | 47 |
| Calls traced | 347 |
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
🚀 MarkdownService.syncAnchoredBlock(…): boolean [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:73]
  └─> MarkdownService.syncAnchoredBlock(args: SyncAnchoredBlockArguments): boolean [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:164]
     ↳ Splices the anchored block into a file, or in check mode reports whether it is current.
    └─> MarkdownService.buildBlockRegex(args: { endMarker: string; startMarker: string; }): RegExp [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:115]
       ↳ Build the matcher for a block delimited by the configured markers.
      └─> MarkdownService.escapeRegex(input: string): string [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:127]
         ↳ Escape a configured marker so it can be searched for literally.
```

**2. `MarkdownService.wrapInAnchors`** — depth 2 · orphan-root

```text
🚀 MarkdownService.wrapInAnchors(content?: string | undefined): string [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:80]
  └─> MarkdownService.wrapInAnchors(args: WrapInAnchorsArguments): string [projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:202]
     ↳ Wrap rendered markdown in the configured anchor markers.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MarkdownService.buildBadgeGroups` | 16 | `MarkdownService.filter(…)`, `buildRepositoryGroup`, `buildTargetsGroup`, `buildTypescriptGroup`, `buildJavascriptGroup`, `buildPythonGroup`, `buildJsonGroup`, `buildYamlGroup`, `buildTomlGroup`, `buildShellGroup`, `buildSqlGroup`, `buildHclGroup`, `buildCssGroup`, `buildCustomGroup`, `buildJupyterGroup`, `buildMarkdownGroup` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:88` |
| `ChangesService.collectProjectRows` | 7 | `ChangesService.readProjectName`, `ChangesService.readBaseline`, `ChangesService.readReport`, `ChangesService.map(…)`, `ChangesService.map(…)`, `ChangesService.buildBaselineRow`, `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:80` |
| `MarkdownService.syncAnchoredBlock` | 6 | `MissingMarkdownPathError.constructor`, `MarkdownService.readExisting`, `MarkdownService.wrapInAnchors`, `MarkdownService.buildBlockRegex`, `MarkdownService.writeMarkdownFile`, `MarkdownService.replace(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:164` |

<details>
<summary>86 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `RenderService.renderSection` | 6 | `RenderService.groupByProject(…)`, `RenderService.groupByProject`, `RenderService.groupByProject(…)`, `RenderService.flatMap(…)`, `RenderService.readProjects`, `RenderService.renderComparison` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:143` |
| `ChangesService.collect` | 4 | `ChangesService.map(…)`, `ChangesService.readReportPaths`, `ChangesService.flatMap(…)`, `ChangesService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:244` |
| `ConfigurationListingService.findConfigurationFiles` | 4 | `ConfigurationListingService.resolveWalkExclusions`, `DiscoveryService.discoverFiles`, `ConfigurationListingService.toSorted(…)`, `ConfigurationListingService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:138` |
| `buildRepositoryGroup` | 4 | `buildGroup`, `buildBadge`, `formatBytes`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:240` |
| `RenderService.renderProject` | 4 | `RenderService.filter(…)`, `RenderService.readIsOpen`, `RenderService.renderFailures`, `RenderService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:95` |
| `ChangesService.map(…)` | 3 | `ChangesService.readBreach`, `ChangesService.readLabel`, `ChangesService.readGoverningLimit` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:175` |
| `ChangesService.readReportPaths` | 3 | `ChangesService.flatMap(…)`, `ChangesService.map(…)`, `ChangesService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:219` |
| `RenderConfigurationService.renderDirectory` | 3 | `RenderConfigurationService.renderNames`, `RenderConfigurationService.map(…)`, `RenderConfigurationService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:32` |
| `RenderConfigurationService.renderLimitsTable` | 3 | `RenderConfigurationService.renderRow`, `RenderConfigurationService.map(…)`, `RenderConfigurationService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:60` |
| `RenderConfigurationService.render` | 3 | `RenderConfigurationService.renderRootError`, `RenderConfigurationService.renderLimitsTable`, `RenderConfigurationService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:108` |
| `buildCssGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:24` |
| `buildHclGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:98` |
| `buildJsonGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:138` |
| `buildJupyterGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:159` |
| `buildMarkdownGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:188` |
| `buildPythonGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:217` |
| `buildShellGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:258` |
| `buildSqlGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:278` |
| `buildTomlGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:318` |
| `buildTypescriptGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:334` |
| `buildYamlGroup` | 3 | `buildGroup`, `buildBadge`, `buildCustomBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:349` |
| `MarkdownService.sync` | 3 | `MarkdownService.scopeCustomStatistics`, `MarkdownService.renderDocument`, `MarkdownService.buildAnchorHelpers` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:271` |
| `DeliveryService.deliverConsole` | 3 | `JsonService.render`, `MarkdownService.renderBlock`, `DeliveryService.readTargetSizes` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:35` |
| `DeliveryService.deliverMarkdown` | 3 | `DeliveryService.touchesFiles`, `MarkdownService.sync`, `DeliveryService.readTargetSizes` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:84` |
| `DeliveryService.deliver` | 3 | `DeliveryService.deliverConsole`, `DeliveryService.deliverJson`, `DeliveryService.deliverMarkdown` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:133` |
| `DocumentsService.emit` | 3 | `DocumentsService.wrap`, `DocumentsService.readDocument`, `DocumentsService.splice` | `projects/ic-suite/codometer/codometer-output/src/modules/documents/documents.service.ts:43` |
| `RenderService.renderRow` | 3 | `RenderService.readStatus`, `formatValue`, `formatDelta` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:123` |
| `ReportService.buildMetrics` | 3 | `ReportService.buildMetricName`, `ReportService.map(…)`, `ReportService.readUnit` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:48` |
| `ChangesService.readBaseline` | 2 | `ChangesService.readReport`, `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:124` |
| `ChangesService.readBreach` | 2 | `ChangesService.filter(…)`, `ChangesService.some(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:141` |
| `ChangesService.readGoverningLimit` | 2 | `ChangesService.filter(…)`, `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:156` |
| `ChangesService.readReport` | 2 | `ChangesService.parseReport`, `ChangesService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:195` |
| `formatValue` | 2 | `formatBytes`, `formatCount` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.utilities.ts:30` |
| `ConfigurationListingService.formatLimitValue` | 2 | `formatBytes`, `formatCount` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:79` |
| `ConfigurationListingService.describeConfigurations` | 2 | `ConfigurationListingService.findConfigurationFiles`, `ConfigurationListingService.describeConfiguration` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:116` |
| `JsonService.sync` | 2 | `JsonService.render`, `JsonService.readExisting` | `projects/ic-suite/codometer/codometer-output/src/modules/json/json.service.ts:54` |
| `buildCustomBadges` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:44` |
| `buildCustomGroup` | 2 | `buildCustomBadges`, `buildGroup` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:58` |
| `buildCustomStatisticInstancesSection` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:71` |
| `map(…)` | 2 | `map(…)`, `buildGroup` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:76` |
| `buildJavascriptGroup` | 2 | `buildGroup`, `buildBadge` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:116` |
| `buildTargetsGroup` | 2 | `buildGroup`, `map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:300` |
| `map(…)` | 2 | `buildBadge`, `formatTargetSize` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:311` |
| `MarkdownService.scopeCustomStatistics` | 2 | `MarkdownService.map(…)`, `MarkdownService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:145` |
| `MarkdownService.renderBadges` | 2 | `MarkdownService.renderDocument`, `MarkdownService.scopeCustomStatistics` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:226` |
| `MarkdownService.renderBlock` | 2 | `MarkdownService.wrapInAnchors`, `MarkdownService.renderBadges` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:238` |
| `MarkdownService.renderDocument` | 2 | `MarkdownService.buildBadgeGroups`, `buildCustomStatisticInstancesSection` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:248` |
| `DeliveryService.deliverJson` | 2 | `DeliveryService.touchesFiles`, `JsonService.sync` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:62` |
| `DestinationsService.resolveMarkdown` | 2 | `DestinationsService.findConfiguredOutput`, `DestinationsService.resolvePath` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:98` |
| `DestinationsService.listOutputPaths` | 2 | `DestinationsService.map(…)`, `DestinationsService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:167` |
| `DestinationsService.resolveDestinations` | 2 | `DestinationsService.resolveJson`, `DestinationsService.resolveMarkdown` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:195` |
| `RenderService.readProjects` | 2 | `RenderService.map(…)`, `RenderService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:50` |
| `ReportService.build` | 2 | `ReportService.indexLimits`, `ReportService.buildMetrics` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:105` |
| `ChangesService.map(…)` | 1 | `ChangesService.buildMeasuredRow` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:90` |
| `ChangesService.readLabel` | 1 | `ChangesService.find(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:167` |
| `ChangesService.readMetrics` | 1 | `ChangesService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:174` |
| `ChangesService.flatMap(…)` | 1 | `ChangesService.readMetrics` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:211` |
| `ChangesService.map(…)` | 1 | `ChangesService.collectProjectRows` | `projects/ic-suite/codometer/codometer-output/src/modules/changes/changes.service.ts:245` |
| `formatDelta` | 1 | `formatValue` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.utilities.ts:20` |
| `ConfigurationListingService.describeConfiguration` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:49` |
| `ConfigurationListingService.resolveWalkExclusions` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:88` |
| `ConfigurationListingService.toLimitRows` | 1 | `ConfigurationListingService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:159` |
| `ConfigurationListingService.flatMap(…)` | 1 | `ConfigurationListingService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:162` |
| `ConfigurationListingService.map(…)` | 1 | `ConfigurationListingService.formatLimitValue` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/configuration-listing.service.ts:163` |
| `RenderConfigurationService.map(…)` | 1 | `RenderConfigurationService.renderRow` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:68` |
| `RenderConfigurationService.map(…)` | 1 | `RenderConfigurationService.renderDirectory` | `projects/ic-suite/codometer/codometer-output/src/modules/configuration-listing/render-configuration.service.ts:135` |
| `buildBadge` | 1 | `encodeValue` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:15` |
| `map(…)` | 1 | `buildBadge` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:50` |
| `map(…)` | 1 | `locateInstance` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:78` |
| `formatTargetSize` | 1 | `formatBytes` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.utilities.ts:381` |
| `MarkdownService.syncAnchoredBlock` | 1 | `MarkdownService.syncAnchoredBlock` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:73` |
| `MarkdownService.wrapInAnchors` | 1 | `MarkdownService.wrapInAnchors` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:80` |
| `MarkdownService.buildBlockRegex` | 1 | `MarkdownService.escapeRegex` | `projects/ic-suite/codometer/codometer-output/src/modules/markdown/markdown.service.ts:115` |
| `DeliveryService.readTargetSizes` | 1 | `DeliveryService.flatMap(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/delivery/delivery.service.ts:109` |
| `DestinationsService.findConfiguredOutput` | 1 | `DestinationsService.find(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:39` |
| `DestinationsService.resolveJson` | 1 | `DestinationsService.findConfiguredOutput` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:50` |
| `DestinationsService.resolveConsoleMarkdown` | 1 | `DestinationsService.resolveMarkdown` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:186` |
| `DestinationsService.selectScope` | 1 | `DestinationsService.some(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/destinations/destinations.service.ts:213` |
| `DocumentsService.splice` | 1 | `DocumentsService.filter(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/documents/documents.service.ts:80` |
| `RenderService.readIsOpen` | 1 | `RenderService.some(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:42` |
| `RenderService.renderFailures` | 1 | `RenderService.map(…)` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:78` |
| `RenderService.filter(…)` | 1 | `hasChanged` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:100` |
| `RenderService.map(…)` | 1 | `RenderService.renderRow` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:116` |
| `RenderService.flatMap(…)` | 1 | `RenderService.renderProject` | `projects/ic-suite/codometer/codometer-output/src/modules/render/render.service.ts:150` |
| `ReportService.map(…)` | 1 | `ReportService.buildLimit` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:60` |
| `ReportService.indexLimits` | 1 | `ReportService.buildMetricName` | `projects/ic-suite/codometer/codometer-output/src/modules/report/report.service.ts:76` |

</details>
<!-- callidescope:end -->
