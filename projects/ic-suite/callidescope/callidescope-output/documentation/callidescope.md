<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-output`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 137 |
| Files | 39 |
| Calls traced | 142 |
| Call stacks | 2 |
| Deepest stack | 4 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 13 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `OutputMarkdownService.syncAnchoredBlock`** — depth ≥ 4 · orphan-root

```text
🚀 OutputMarkdownService.syncAnchoredBlock(…): boolean [projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:148]
  └─> OutputMarkdownService.syncAnchoredBlock(args: SyncAnchoredBlockArguments): boolean [projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:190]
     ↳ Splices the anchored block into a file, appending or creating it as needed, and in check mode only reports drift.
    └─> OutputMarkdownService.buildBlockPattern(destination: SyncAnchoredBlockArguments["destination"]): RegExp [projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:53]
       ↳ Builds the pattern matching everything between the two anchors.
      └─> OutputMarkdownService.escapePattern(value: string): string [projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:62]
         ↳ Escapes a marker so it can sit inside a pattern.
```

**2. `OutputMarkdownService.wrapInAnchors`** — depth 2 · orphan-root

```text
🚀 OutputMarkdownService.wrapInAnchors(override: string | undefined): string [projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:155]
  └─> OutputMarkdownService.wrapInAnchors(args: WrapInAnchorsArguments): string [projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:220]
     ↳ Wraps content in the configured anchors.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MarkdownReportService.renderRun` | 7 | `MarkdownReportService.subsectionPrefix`, `WorkspaceReportService.buildRows`, `MarkdownReportService.renderSummaryTable`, `WorkspaceReportService.renderProjectIndex`, `WorkspaceReportService.renderHeadroom`, `MarkdownReportService.renderStacksAs`, `MarkdownReportService.renderCallableBreadths` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:260` |
| `MarkdownReportService.renderProjectSection` | 5 | `MarkdownReportService.renderSummaryTable`, `MarkdownReportService.renderProjectLimits`, `WorkspaceReportService.limitsFor`, `MarkdownReportService.renderStacksAs`, `MarkdownReportService.renderCallableBreadths` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:218` |
| `OutputMarkdownService.syncAnchoredBlock` | 5 | `MissingMarkdownPathError.constructor`, `OutputMarkdownService.readExisting`, `OutputMarkdownService.wrapInAnchors`, `OutputMarkdownService.buildBlockPattern`, `OutputMarkdownService.spliceBlock` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:190` |

<details>
<summary>68 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `AddressReportService.renderBreadthDiagram` | 4 | `AddressReportService.toFrame`, `AddressReportService.map(…)`, `AddressReportService.map(…)`, `MermaidReportService.renderStacks` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:60` |
| `ProjectReportsService.buildSummary` | 4 | `ProjectReportsService.filter(…)`, `ProjectReportsService.filter(…)`, `ProjectReportsService.reduce(…)`, `ProjectReportsService.filter(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:132` |
| `ReportFindingsService.reportFindings` | 4 | `ReportFindingsService.reportStaleness`, `ReportFindingsService.reportDeepStacks`, `ReportFindingsService.reportWideCallables`, `ReportFindingsService.reportEmptyTrace` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report-findings/report-findings.service.ts:105` |
| `WriteDestinationsService.syncDestinations` | 4 | `OutputJsonService.sync`, `OutputMarkdownService.sync`, `MarkdownReportService.renderRun`, `WriteDestinationsService.syncProjectDestinations` | `projects/ic-suite/callidescope/callidescope-output/src/modules/write-destinations/write-destinations.service.ts:110` |
| `MermaidReportService.renderStacks` | 3 | `MermaidReportService.countNewCallables`, `MermaidReportService.addStack`, `MermaidReportService.renderDiagram` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/mermaid-report.service.ts:134` |
| `ReportService.renderFrame` | 3 | `ReportService.renderSignature`, `ReportService.renderMarkers`, `ReportService.shortenSummary` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/report.service.ts:44` |
| `MarkdownReportService.renderCallableBreadths` | 3 | `MarkdownReportService.renderTable`, `MarkdownReportService.map(…)`, `MarkdownReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:59` |
| `AddressReportService.renderBreadth` | 3 | `AddressReportService.buildBreadthPayload`, `AddressReportService.renderBreadthDiagram`, `AddressReportService.renderReferenceTable` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:152` |
| `AddressReportService.renderDepth` | 3 | `AddressReportService.buildDepthPayload`, `MermaidReportService.renderStacks`, `AddressReportService.renderDepthStacks` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:203` |
| `OutputMarkdownService.spliceBlock` | 3 | `OutputMarkdownService.replace(…)`, `OutputMarkdownService.appendBlock`, `OutputMarkdownService.replaceOrphanedBlock` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:110` |
| `ProjectReportsService.build` | 3 | `ProjectReportsService.buildStacks`, `ProjectReportsService.buildCallableBreadths`, `ProjectReportsService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:225` |
| `ProjectReportsService.map(…)` | 3 | `ProjectReportsService.toSorted(…)`, `ProjectReportsService.toSorted(…)`, `ProjectReportsService.buildSummary` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:229` |
| `ProjectReportsService.findOwnedFindings` | 3 | `ProjectReportsService.filter(…)`, `ProjectReportsService.findDeepStacks`, `ProjectReportsService.findWideCallables` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:276` |
| `MermaidReportService.countNewCallables` | 2 | `MermaidReportService.filter(…)`, `MermaidReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/mermaid-report.service.ts:85` |
| `WorkspaceReportService.buildRows` | 2 | `WorkspaceReportService.map(…)`, `WorkspaceReportService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:85` |
| `WorkspaceReportService.map(…)` | 2 | `WorkspaceReportService.limitsFor`, `WorkspaceReportService.widestBreadth` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:86` |
| `WorkspaceReportService.renderHeadroom` | 2 | `WorkspaceReportService.map(…)`, `WorkspaceReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:124` |
| `WorkspaceReportService.renderProjectIndex` | 2 | `WorkspaceReportService.buildRows`, `WorkspaceReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:145` |
| `MarkdownReportService.renderStacksAs` | 2 | `MermaidReportService.renderStacks`, `MarkdownReportService.renderStacks` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:130` |
| `MarkdownReportService.renderFindings` | 2 | `MarkdownReportService.renderStacks`, `MarkdownReportService.renderWideCallableLines` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:200` |
| `AddressReportService.renderBreadthReports` | 2 | `AddressReportService.map(…)`, `AddressReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:188` |
| `AddressReportService.renderDepthReports` | 2 | `AddressReportService.map(…)`, `AddressReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:249` |
| `OutputJsonService.sync` | 2 | `OutputJsonService.buildReport`, `OutputJsonService.readExisting` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-json/output-json.service.ts:57` |
| `OutputMarkdownService.sync` | 2 | `OutputMarkdownService.syncAnchoredBlock`, `OutputMarkdownService.buildHelpers` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:164` |
| `ProjectReportsService.buildCallableBreadths` | 2 | `ProjectReportsService.flatMap(…)`, `SignaturesService.read` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:46` |
| `ProjectReportsService.buildStacks` | 2 | `ProjectReportsService.readDepth`, `PathsService.buildDeepestPath` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:86` |
| `ProjectReportsService.findProjectDeepStacks` | 2 | `ProjectReportsService.map(…)`, `ProjectReportsService.filter(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:168` |
| `ProjectReportsService.findProjectWideCallables` | 2 | `ProjectReportsService.map(…)`, `ProjectReportsService.filter(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:178` |
| `ProjectReportsService.findDeepStacks` | 2 | `ProjectReportsService.toSorted(…)`, `ProjectReportsService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:255` |
| `ProjectReportsService.flatMap(…)` | 2 | `ProjectReportsService.findProjectDeepStacks`, `ProjectReportsService.readProjectLimits` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:260` |
| `ProjectReportsService.findWideCallables` | 2 | `ProjectReportsService.toSorted(…)`, `ProjectReportsService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:307` |
| `ProjectReportsService.flatMap(…)` | 2 | `ProjectReportsService.findProjectWideCallables`, `ProjectReportsService.readProjectLimits` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:312` |
| `ReportFindingsService.reportDeepStacks` | 2 | `ReportFindingsService.map(…)`, `ReportFindingsService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report-findings/report-findings.service.ts:30` |
| `ReportFindingsService.reportWideCallables` | 2 | `ReportFindingsService.map(…)`, `ReportFindingsService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report-findings/report-findings.service.ts:79` |
| `WriteDestinationsService.syncProjectSections` | 2 | `OutputMarkdownService.sync`, `MarkdownReportService.renderProjectSection` | `projects/ic-suite/callidescope/callidescope-output/src/modules/write-destinations/write-destinations.service.ts:69` |
| `MermaidReportService.addFrame` | 1 | `MermaidReportService.renderLabel` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/mermaid-report.service.ts:34` |
| `MermaidReportService.addStack` | 1 | `MermaidReportService.addFrame` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/mermaid-report.service.ts:62` |
| `ReportService.shortenSummary` | 1 | `ReportService.readFirstSentence` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/report.service.ts:84` |
| `ReportService.renderStackTree` | 1 | `ReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/report.service.ts:108` |
| `ReportService.map(…)` | 1 | `ReportService.renderFrame` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/report.service.ts:110` |
| `WorkspaceReportService.widestBreadth` | 1 | `WorkspaceReportService.reduce(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:72` |
| `WorkspaceReportService.map(…)` | 1 | `WorkspaceReportService.bucketFor` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:125` |
| `WorkspaceReportService.map(…)` | 1 | `WorkspaceReportService.filter(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/workspace-report.service.ts:131` |
| `MarkdownReportService.toRow` | 1 | `MarkdownReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:63` |
| `MarkdownReportService.map(…)` | 1 | `MarkdownReportService.toRow` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:69` |
| `MarkdownReportService.map(…)` | 1 | `MarkdownReportService.toRow` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:84` |
| `MarkdownReportService.renderProjectLimits` | 1 | `MarkdownReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:103` |
| `MarkdownReportService.map(…)` | 1 | `MarkdownReportService.renderLimitCell` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:107` |
| `MarkdownReportService.renderStack` | 1 | `ReportService.renderStackTree` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:113` |
| `MarkdownReportService.renderWideCallableLines` | 1 | `MarkdownReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:171` |
| `MarkdownReportService.renderStacks` | 1 | `MarkdownReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:307` |
| `MarkdownReportService.map(…)` | 1 | `MarkdownReportService.renderStack` | `projects/ic-suite/callidescope/callidescope-output/src/modules/report/markdown-report.service.ts:312` |
| `AddressReportService.map(…)` | 1 | `AddressReportService.toFrame` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:71` |
| `AddressReportService.map(…)` | 1 | `AddressReportService.toFrame` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:74` |
| `AddressReportService.renderDepthStacks` | 1 | `AddressReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:83` |
| `AddressReportService.map(…)` | 1 | `ReportService.renderStackTree` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:94` |
| `AddressReportService.renderReferenceTable` | 1 | `AddressReportService.map(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:115` |
| `AddressReportService.map(…)` | 1 | `AddressReportService.buildBreadthPayload` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:191` |
| `AddressReportService.map(…)` | 1 | `AddressReportService.renderBreadth` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:198` |
| `AddressReportService.map(…)` | 1 | `AddressReportService.buildDepthPayload` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:252` |
| `AddressReportService.map(…)` | 1 | `AddressReportService.renderDepth` | `projects/ic-suite/callidescope/callidescope-output/src/modules/address-report/address-report.service.ts:259` |
| `OutputMarkdownService.buildBlockPattern` | 1 | `OutputMarkdownService.escapePattern` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:53` |
| `OutputMarkdownService.syncAnchoredBlock` | 1 | `OutputMarkdownService.syncAnchoredBlock` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:148` |
| `OutputMarkdownService.wrapInAnchors` | 1 | `OutputMarkdownService.wrapInAnchors` | `projects/ic-suite/callidescope/callidescope-output/src/modules/output-markdown/output-markdown.service.ts:155` |
| `ProjectReportsService.filter(…)` | 1 | `ProjectReportsService.some(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:149` |
| `ProjectReportsService.findUnreadProjects` | 1 | `ProjectReportsService.filter(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:291` |
| `ProjectReportsService.filter(…)` | 1 | `ProjectReportsService.find(…)` | `projects/ic-suite/callidescope/callidescope-output/src/modules/project-reports/project-reports.service.ts:297` |
| `WriteDestinationsService.syncProjectDestinations` | 1 | `WriteDestinationsService.syncProjectSections` | `projects/ic-suite/callidescope/callidescope-output/src/modules/write-destinations/write-destinations.service.ts:42` |

</details>
<!-- callidescope:end -->
