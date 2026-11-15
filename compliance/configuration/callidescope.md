<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `compliance`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 302 |
| Files | 66 |
| Calls traced | 339 |
| Call stacks | 5 |
| Deepest stack | 8 |
| Stacks through recursion | 0 |
| Unfollowable calls | 17 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `AuditGovernanceCommand.run`** — depth 8 · decorated-method

```text
🚀 AuditGovernanceCommand.run(): Promise<void> [compliance/src/modules/audit-governance/audit-governance.command.ts:77]
   ↳ Runs repository governance checks and reports findings.
  └─> AuditGovernanceService.checkGovernance(workspaceRoot?: string): AuditGovernanceVerdict [compliance/src/modules/audit-governance/audit-governance.service.ts:272]
     ↳ Runs the complete repository governance audit.
    └─> AuditGovernanceService.checkWorkflows(workspaceRoot?: string): WorkflowVerdict [compliance/src/modules/audit-governance/audit-governance.service.ts:286]
       ↳ Audits GitHub Actions workflow files for explicit permissions, timeouts, and naming.
      └─> AuditGovernanceService.auditWorkflowContent(file: string, content: string, violations: WorkflowViolation[]): void [compliance/src/modules/audit-governance/audit-governance.service.ts:57]
         ↳ Inspects workflow content lines for name, top-level permissions, and job timeouts.
        └─> AuditGovernanceService.collectWorkflowJobViolations(…): void [compliance/src/modules/audit-governance/audit-governance.service.ts:84]
           ↳ Scans workflow lines inside jobs section and verifies declarations.
          └─> AuditGovernanceService.extractJobBlocks(lines: string[]): WorkflowJobDeclaration[] [compliance/src/modules/audit-governance/audit-governance.service.ts:142]
             ↳ Extracts job declaration blocks from workflow lines.
            └─> AuditGovernanceService.sliceJobsSection(lines: string[]): string[] [compliance/src/modules/audit-governance/audit-governance.service.ts:221]
               ↳ Slices lines starting after the 'jobs:' section header.
              └─> AuditGovernanceService.findIndex(…)(line: string): boolean [compliance/src/modules/audit-governance/audit-governance.service.ts:222]
```

**2. `IssueCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 IssueCommand.run(…): Promise<void> [compliance/src/modules/issue/issue.command.ts:90]
   ↳ Runs every phase the plan calls for and exits 1 on any failure.
  └─> IssueAuditService.auditAll(): IssueOutcome [compliance/src/modules/issue/issue-audit.service.ts:32]
     ↳ Audits every open issue and the hierarchy between them.
    └─> IssueMetadataService.checkBulkIssues(issues: readonly IssueSummary[]): BulkIssuesVerdict [compliance/src/modules/issue/issue-metadata.service.ts:282]
       ↳ Validates metadata and hierarchy across a batch of open issues.
      └─> IssueMetadataService.checkHierarchy(issues: readonly IssueSummary[]): readonly HierarchyViolation[] [compliance/src/modules/issue/issue-metadata.service.ts:325]
         ↳ Checks issue hierarchy rules (release significance and max depth 3).
        └─> IssueMetadataService.checkReleaseSignificanceViolation(…): void [compliance/src/modules/issue/issue-metadata.service.ts:47]
           ↳ Checks if a sub-issue exceeds its parent's release level.
          └─> IssueMetadataService.resolveIssueReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [compliance/src/modules/issue/issue-metadata.service.ts:463]
             ↳ Resolves release level and rank from title, body, and labels.
            └─> IssueMetadataService.resolveStandardReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [compliance/src/modules/issue/issue-metadata.service.ts:260]
               ↳ Resolves non-breaking release level from type labels or title match.
              └─> IssueMetadataService.find(…)(name: string): boolean [compliance/src/modules/issue/issue-metadata.service.ts:264]
```

**3. `PullRequestCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 PullRequestCommand.run(passedParameters: string[]): Promise<void> [compliance/src/modules/pull-request/pull-request.command.ts:95]
   ↳ Runs both phases and exits 0 only when every applicable check passed.
  └─> PullRequestValidationService.validate(context: PullRequestContext): CheckOutcome[] [compliance/src/modules/pull-request/pull-request-validation.service.ts:278]
     ↳ Every check that applies to this pull request.
    └─> PullRequestValidationService.checkBody(context: PullRequestContext): CheckOutcome [compliance/src/modules/pull-request/pull-request-validation.service.ts:50]
       ↳ The body, its sections, and the template comments left in it.
      └─> PullRequestBodyService.checkBody(…): BodyVerdict [compliance/src/modules/pull-request/pull-request-body.service.ts:197]
         ↳ The five lists of failures, from one description and the template's prompts.
        └─> PullRequestBodyService.findEmptySections(body: string): string[] [compliance/src/modules/pull-request/pull-request-body.service.ts:218]
           ↳ Every required heading whose section does not carry content.
          └─> PullRequestBodyService.filter(…)(heading: string): boolean [compliance/src/modules/pull-request/pull-request-body.service.ts:221]
            └─> PullRequestBodyService.cleanSectionContent(content: string): string [compliance/src/modules/pull-request/pull-request-body.service.ts:76]
               ↳ Cleans section text by removing HTML comments and empty markdown list markers.
              └─> PullRequestBodyService.filter(…)(line: string): boolean [compliance/src/modules/pull-request/pull-request-body.service.ts:82]
```

<details>
<summary>2 more call stacks</summary>

**4. `OrganizationProjectCommand.run`** — depth 4 · decorated-method

```text
🚀 OrganizationProjectCommand.run(passedParameters: string[]): Promise<void> [compliance/src/modules/organization-project/organization-project.command.ts:163]
   ↳ Adds missing repository issues and pull requests, leaving existing items untouched.
  └─> OrganizationProjectCommand.readRepositoryResourceUrls(resource: "issue" | "pr"): readonly string[] [compliance/src/modules/organization-project/organization-project.command.ts:131]
     ↳ Lists repository issue or pull request URLs.
    └─> OrganizationProjectCommand.readJson(…): T [compliance/src/modules/organization-project/organization-project.command.ts:101]
       ↳ Validates JSON returned by a GitHub CLI read command.
      └─> PullRequestGithubService.run(commandArguments: readonly string[]): GithubCliResult [compliance/src/modules/pull-request/pull-request-github.service.ts:58]
         ↳ Invokes `gh` with these arguments, capturing each stream on its own.
```

**5. `PullRequestGithubService.isAvailable`** — depth 2 · orphan-root

```text
🚀 PullRequestGithubService.isAvailable(): boolean [compliance/src/modules/pull-request/pull-request-github.service.ts:53]
   ↳ Whether the `gh` binary can be executed at all.
  └─> PullRequestGithubService.run(commandArguments: readonly string[]): GithubCliResult [compliance/src/modules/pull-request/pull-request-github.service.ts:58]
     ↳ Invokes `gh` with these arguments, capturing each stream on its own.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `IssueAuditService.auditOne` | 9 | `IssueGithubService.isAvailable`, `IssueAuditService.fail`, `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueMetadataService.resolveFromDocument`, `IssueMetadataService.checkMetadata`, `IssueMetadataService.parseFormAnswers`, `IssueAuditService.map(…)`, `IssueAuditService.map(…)` | `compliance/src/modules/issue/issue-audit.service.ts:67` |
| `PullRequestCommand.run` | 9 | `PullRequestCommand.begin`, `PullRequestAncestorIssuesService.link`, `PullRequestLabelVocabularyService.reconcile`, `PullRequestCommand.load`, `PullRequestReportService.compose`, `PullRequestValidationService.validate`, `PullRequestCommand.flatMap(…)`, `PullRequestCommand.flatMap(…)`, `PullRequestReportService.publish` | `compliance/src/modules/pull-request/pull-request.command.ts:95` |
| `IssueCommand.run` | 7 | `IssuePlanService.resolve`, `IssueCommand.prepare`, `IssueAuditService.auditOne`, `IssueAssigningService.assignAll`, `IssueAuditService.auditAll`, `IssueReportService.compose`, `IssueReportService.publish` | `compliance/src/modules/issue/issue.command.ts:90` |

<details>
<summary>128 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PullRequestAncestorIssuesService.link` | 6 | `PullRequestAncestorIssuesService.readLinked`, `PullRequestAncestorIssuesService.unchanged`, `PullRequestAncestorIssuesService.collectAncestors`, `PullRequestDescendantIssuesService.collect`, `PullRequestAncestorIssuesService.writeReferences`, `PullRequestAncestorIssuesService.filter(…)` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:264` |
| `PullRequestLabelsService.planReconciliation` | 6 | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.filter(…)` | `compliance/src/modules/pull-request/pull-request-labels.service.ts:66` |
| `PullRequestValidationService.checkSignificance` | 6 | `PullRequestReleaseSignificanceService.parseConventionalSubject`, `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestReleaseSignificanceService.resolveFromDocument`, `PullRequestReleaseSignificanceService.checkSignificance`, `PullRequestReleaseSignificanceService.readReleaseRules` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:161` |
| `PullRequestValidationService.validate` | 6 | `PullRequestValidationService.checkTitle`, `PullRequestValidationService.checkBody`, `PullRequestValidationService.checkMetadata`, `PullRequestValidationService.checkSignificance`, `PullRequestValidationService.checkLinkedIssue`, `PullRequestAncestorIssuesService.verify` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:278` |
| `IssueMetadataService.checkBulkIssues` | 5 | `IssueMetadataService.parseFormAnswers`, `IssueMetadataService.checkMetadata`, `IssueMetadataTypeService.readFromSummary`, `IssueMetadataService.map(…)`, `IssueMetadataService.checkHierarchy` | `compliance/src/modules/issue/issue-metadata.service.ts:282` |
| `IssueMetadataService.checkMetadata` | 5 | `IssueMetadataService.groupLabels`, `IssueMetadataService.checkTypeLabel`, `IssueMetadataService.checkScopeLabels`, `IssueMetadataService.checkSourceLabel`, `IssueMetadataTypeService.check` | `compliance/src/modules/issue/issue-metadata.service.ts:366` |
| `IssueAuditService.auditAll` | 5 | `IssueGithubService.isAvailable`, `IssueAuditService.fail`, `IssueGithubService.listOpenIssues`, `IssueMetadataService.checkBulkIssues`, `IssueAuditService.map(…)` | `compliance/src/modules/issue/issue-audit.service.ts:32` |
| `PullRequestBodyLinksService.addRelatedIssueReferences` | 5 | `PullRequestBodyLinksService.findIndex(…)`, `PullRequestBodyLinksService.readExistingIssueNumbers`, `PullRequestBodyLinksService.filter(…)`, `PullRequestBodyLinksService.insertReferences`, `PullRequestBodyLinksService.map(…)` | `compliance/src/modules/pull-request/pull-request-body-links.service.ts:60` |
| `PullRequestAncestorIssuesService.writeReferences` | 5 | `PullRequestBodyLinksService.addRelatedIssueReferences`, `PullRequestAncestorIssuesService.unchanged`, `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestAncestorIssuesService.format` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:188` |
| `PullRequestAncestorIssuesService.verify` | 5 | `PullRequestAncestorIssuesService.readLinked`, `PullRequestAncestorIssuesService.collectAncestors`, `PullRequestAncestorIssuesService.map(…)`, `PullRequestAncestorIssuesService.filter(…)`, `PullRequestAncestorIssuesService.format` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:303` |
| `PullRequestBodyService.checkBody` | 5 | `PullRequestBodyService.findEmptySections`, `PullRequestBodyService.findMalformedSections`, `PullRequestBodyService.findMissingHeadings`, `PullRequestBodyService.findOversizedSections`, `PullRequestBodyService.findUnfilledComments` | `compliance/src/modules/pull-request/pull-request-body.service.ts:197` |
| `PullRequestLabelVocabularyService.plan` | 5 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestLabelsService.planReconciliation`, `PullRequestLabelsService.parseRepositoryLabels`, `PullRequestLabelsService.readExpectedLabels` | `compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:72` |
| `PullRequestLabelsAssigneesService.checkMetadata` | 5 | `PullRequestLabelsAssigneesService.groupLabels`, `PullRequestLabelsAssigneesService.checkTypeLabel`, `PullRequestLabelsAssigneesService.checkScopeLabels`, `PullRequestLabelsAssigneesService.record`, `PullRequestLabelsAssigneesService.checkSourceLabel` | `compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:163` |
| `PullRequestReleaseSignificanceService.checkSignificance` | 5 | `PullRequestReleaseSignificanceService.significanceRank`, `PullRequestReleaseSignificanceService.findMostSignificantCommit`, `PullRequestReleaseSignificanceService.findMissingScopes`, `PullRequestReleaseSignificanceService.describeSignificanceFailure`, `PullRequestReleaseSignificanceService.describeMissingScopeFailures` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:199` |
| `OrganizationProjectCommand.run` | 5 | `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.readRepositoryResourceUrls`, `OrganizationProjectCommand.readExistingProjectResourceUrls`, `OrganizationProjectCommand.filter(…)`, `OrganizationProjectCommand.addProjectItem` | `compliance/src/modules/organization-project/organization-project.command.ts:163` |
| `IssueGithubService.listUnassignedOpenIssueNumbers` | 4 | `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueGithubService.map(…)`, `IssueGithubService.filter(…)` | `compliance/src/modules/issue/issue-github.service.ts:117` |
| `IssueAssigningService.assignAll` | 4 | `IssueGithubService.listUnassignedOpenIssueNumbers`, `IssueAssigningService.map(…)`, `IssueAssigningService.flatMap(…)`, `IssueAssigningService.flatMap(…)` | `compliance/src/modules/issue/issue-assigning.service.ts:42` |
| `IssueMetadataService.resolveFromDocument` | 4 | `IssueMetadataService.describeError`, `IssueMetadataService.isRecord`, `IssueMetadataTypeService.readFromDocument`, `IssueMetadataService.readLabelNames` | `compliance/src/modules/issue/issue-metadata.service.ts:435` |
| `IssueLabelingService.label` | 4 | `IssueLabelsService.missingLabels`, `IssueLabelsService.parseFormAnswers`, `IssueGithubService.isAvailable`, `IssueLabelingService.map(…)` | `compliance/src/modules/issue/issue-labeling.service.ts:29` |
| `IssuePlanService.resolve` | 4 | `IssuePlanService.filter(…)`, `IssuePlanService.filter(…)`, `IssuePlanService.readLabelNames`, `IssuePlanService.hasNoAssignee` | `compliance/src/modules/issue/issue-plan.service.ts:66` |
| `PullRequestLabelVocabularyService.reconcile` | 4 | `PullRequestLabelVocabularyService.plan`, `PullRequestLabelVocabularyService.map(…)`, `PullRequestLabelVocabularyService.apply`, `PullRequestLabelVocabularyService.describePlan` | `compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:101` |
| `PullRequestReportService.compose` | 4 | `PullRequestReportService.map(…)`, `PullRequestReportService.map(…)`, `PullRequestReportService.reduce(…)`, `PullRequestReportService.flatMap(…)` | `compliance/src/modules/pull-request/pull-request-report.service.ts:49` |
| `PullRequestCommand.begin` | 4 | `PullRequestContextService.resolveInvocation`, `PullRequestCommand.abort`, `PullRequestCommand.load`, `PullRequestContextService.writeStepOutputs` | `compliance/src/modules/pull-request/pull-request.command.ts:59` |
| `AuditGovernanceService.auditWorkflowContent` | 3 | `AuditGovernanceService.some(…)`, `AuditGovernanceService.some(…)`, `AuditGovernanceService.collectWorkflowJobViolations` | `compliance/src/modules/audit-governance/audit-governance.service.ts:57` |
| `AuditGovernanceCommand.run` | 3 | `AuditGovernanceService.checkGovernance`, `AuditGovernanceCommand.reportCodeownersVerdict`, `AuditGovernanceCommand.reportWorkflowsVerdict` | `compliance/src/modules/audit-governance/audit-governance.command.ts:77` |
| `IssueMetadataService.checkReleaseSignificanceViolation` | 3 | `IssueMetadataService.resolveIssueReleaseLevel`, `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:47` |
| `IssueMetadataService.checkTypeLabel` | 3 | `IssueMetadataService.checkTypeLabelPresence`, `IssueMetadataService.map(…)`, `IssueMetadataService.filter(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:131` |
| `IssueMetadataService.checkHierarchy` | 3 | `IssueMetadataService.extractParentIssueNumber`, `IssueMetadataService.checkReleaseSignificanceViolation`, `IssueMetadataService.computeHierarchyDepth` | `compliance/src/modules/issue/issue-metadata.service.ts:325` |
| `IssueMetadataService.groupLabels` | 3 | `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:409` |
| `IssueReportService.compose` | 3 | `IssueReportService.filter(…)`, `IssueReportService.reduce(…)`, `IssueReportService.flatMap(…)` | `compliance/src/modules/issue/issue-report.service.ts:28` |
| `PullRequestBodyService.holdsShape` | 3 | `PullRequestBodyService.every(…)`, `PullRequestBodyService.filter(…)`, `PullRequestBodyService.bulletMarkersOf` | `compliance/src/modules/pull-request/pull-request-body.service.ts:102` |
| `PullRequestBodyService.findMalformedSections` | 3 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:234` |
| `PullRequestBodyService.filter(…)` | 3 | `PullRequestBodyService.cleanSectionContent`, `PullRequestBodyService.holdsShape`, `PullRequestBodyService.parseBlocks` | `compliance/src/modules/pull-request/pull-request-body.service.ts:237` |
| `PullRequestContextService.fetch` | 3 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestContextService.parseContext` | `compliance/src/modules/pull-request/pull-request-context.service.ts:87` |
| `PullRequestLabelsAssigneesService.groupLabels` | 3 | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)` | `compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:204` |
| `PullRequestValidationService.checkBody` | 3 | `PullRequestValidationService.describeBodyVerdict`, `PullRequestBodyService.checkBody`, `PullRequestBodyService.extractTemplateComments` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:50` |
| `OrganizationProjectCommand.addProjectItem` | 3 | `PullRequestGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/organization-project/organization-project.command.ts:44` |
| `OrganizationProjectCommand.readExistingProjectResourceUrls` | 3 | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.flatMap(…)` | `compliance/src/modules/organization-project/organization-project.command.ts:70` |
| `OrganizationProjectCommand.readJson` | 3 | `PullRequestGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/organization-project/organization-project.command.ts:101` |
| `OrganizationProjectCommand.readRepositoryResourceUrls` | 3 | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.map(…)` | `compliance/src/modules/organization-project/organization-project.command.ts:131` |
| `AuditGovernanceService.collectWorkflowJobViolations` | 2 | `AuditGovernanceService.extractJobBlocks`, `AuditGovernanceService.evaluateJob` | `compliance/src/modules/audit-governance/audit-governance.service.ts:84` |
| `AuditGovernanceService.extractJobBlocks` | 2 | `AuditGovernanceService.sliceJobsSection`, `AuditGovernanceService.applyJobLine` | `compliance/src/modules/audit-governance/audit-governance.service.ts:142` |
| `AuditGovernanceService.parseCodeownersRule` | 2 | `AuditGovernanceService.map(…)`, `AuditGovernanceService.filter(…)` | `compliance/src/modules/audit-governance/audit-governance.service.ts:193` |
| `AuditGovernanceService.checkCodeowners` | 2 | `AuditGovernanceService.find(…)`, `AuditGovernanceService.parseCodeownersLines` | `compliance/src/modules/audit-governance/audit-governance.service.ts:230` |
| `AuditGovernanceService.checkGovernance` | 2 | `AuditGovernanceService.checkCodeowners`, `AuditGovernanceService.checkWorkflows` | `compliance/src/modules/audit-governance/audit-governance.service.ts:272` |
| `AuditGovernanceService.checkWorkflows` | 2 | `AuditGovernanceService.filter(…)`, `AuditGovernanceService.auditWorkflowContent` | `compliance/src/modules/audit-governance/audit-governance.service.ts:286` |
| `IssueGithubService.listOpenIssues` | 2 | `IssueGithubService.run`, `IssueGithubService.describeFailure` | `compliance/src/modules/issue/issue-github.service.ts:88` |
| `IssueAssigningService.assign` | 2 | `IssueGithubService.assignIssue`, `IssueGithubService.describeFailure` | `compliance/src/modules/issue/issue-assigning.service.ts:24` |
| `IssueMetadataTypeService.check` | 2 | `IssueMetadataTypeService.checkSubIssue`, `IssueMetadataTypeService.checkRoot` | `compliance/src/modules/issue/issue-metadata-type.service.ts:82` |
| `IssueMetadataTypeService.readFromDocument` | 2 | `IssueMetadataTypeService.isRecord`, `IssueMetadataTypeService.hasBodyParent` | `compliance/src/modules/issue/issue-metadata-type.service.ts:101` |
| `IssueMetadataService.checkSourceLabel` | 2 | `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:100` |
| `IssueMetadataService.readLabelNames` | 2 | `IssueMetadataService.filter(…)`, `IssueMetadataService.map(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:244` |
| `IssueMetadataService.resolveIssueReleaseLevel` | 2 | `IssueMetadataService.hasBreakingMarker`, `IssueMetadataService.resolveStandardReleaseLevel` | `compliance/src/modules/issue/issue-metadata.service.ts:463` |
| `IssueLabelsService.missingLabels` | 2 | `IssueLabelsService.filter(…)`, `IssueLabelsService.labelsFromAnswers` | `compliance/src/modules/issue/issue-labels.service.ts:77` |
| `IssueLabelingService.map(…)` | 2 | `IssueGithubService.addLabel`, `IssueGithubService.describeFailure` | `compliance/src/modules/issue/issue-labeling.service.ts:47` |
| `IssueCommand.prepare` | 2 | `IssueLabelingService.label`, `IssueAssigningService.assign` | `compliance/src/modules/issue/issue.command.ts:53` |
| `PullRequestDescendantIssuesService.readChildren` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/pull-request-descendant-issues.service.ts:23` |
| `PullRequestAncestorIssuesService.readJson` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:108` |
| `PullRequestAncestorIssuesService.readLinked` | 2 | `PullRequestAncestorIssuesService.readJson(…)`, `PullRequestAncestorIssuesService.readJson` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:136` |
| `PullRequestAncestorIssuesService.readParent` | 2 | `PullRequestAncestorIssuesService.readJson(…)`, `PullRequestAncestorIssuesService.readJson` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:153` |
| `PullRequestBodyService.cleanSectionContent` | 2 | `PullRequestBodyService.filter(…)`, `PullRequestBodyService.map(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:76` |
| `PullRequestBodyService.findEmptySections` | 2 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:218` |
| `PullRequestBodyService.findMissingHeadings` | 2 | `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:256` |
| `PullRequestBodyService.findOversizedSections` | 2 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.flatMap(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:263` |
| `PullRequestLabelsService.readExpectedLabels` | 2 | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)` | `compliance/src/modules/pull-request/pull-request-labels.service.ts:106` |
| `PullRequestLabelVocabularyService.map(…)` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:39` |
| `PullRequestLabelVocabularyService.describePlan` | 2 | `PullRequestLabelVocabularyService.map(…)`, `PullRequestLabelVocabularyService.map(…)` | `compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:57` |
| `PullRequestLabelsAssigneesService.checkSourceLabel` | 2 | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.map(…)` | `compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:92` |
| `PullRequestLabelsAssigneesService.checkTypeLabel` | 2 | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.filter(…)` | `compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:123` |
| `PullRequestLabelsAssigneesService.parseTitle` | 2 | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.map(…)` | `compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:226` |
| `PullRequestReleaseSignificanceService.describeSignificanceFailure` | 2 | `PullRequestReleaseSignificanceService.releaseLevelName`, `PullRequestReleaseSignificanceService.find(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:61` |
| `PullRequestReleaseSignificanceService.readRawCommit` | 2 | `PullRequestReleaseSignificanceService.isRecord`, `PullRequestReleaseSignificanceService.parseConventionalSubject` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:148` |
| `PullRequestReleaseSignificanceService.parseConventionalSubject` | 2 | `PullRequestReleaseSignificanceService.filter(…)`, `PullRequestReleaseSignificanceService.map(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:244` |
| `PullRequestReleaseSignificanceService.resolveFromDocument` | 2 | `PullRequestReleaseSignificanceService.describeError`, `PullRequestReleaseSignificanceService.map(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:300` |
| `PullRequestReleaseSignificanceService.significanceRank` | 2 | `PullRequestReleaseSignificanceService.find(…)`, `PullRequestReleaseSignificanceService.rankOfRelease` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:331` |
| `PullRequestReportService.describeOutcome` | 2 | `PullRequestReportService.map(…)`, `PullRequestReportService.map(…)` | `compliance/src/modules/pull-request/pull-request-report.service.ts:26` |
| `PullRequestTitleService.check` | 2 | `PullRequestTitleService.filter(…)`, `PullRequestTitleService.map(…)` | `compliance/src/modules/pull-request/pull-request-title.service.ts:23` |
| `PullRequestValidationService.checkLinkedIssue` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:78` |
| `PullRequestValidationService.checkMetadata` | 2 | `PullRequestLabelsAssigneesService.parseTitle`, `PullRequestLabelsAssigneesService.checkMetadata` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:128` |
| `PullRequestValidationService.describeBodyVerdict` | 2 | `PullRequestValidationService.listHeadings`, `PullRequestValidationService.listItems` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:237` |
| `PullRequestCommand.load` | 2 | `PullRequestContextService.fetch`, `PullRequestCommand.abort` | `compliance/src/modules/pull-request/pull-request.command.ts:86` |
| `AuditGovernanceService.parseCodeownersLines` | 1 | `AuditGovernanceService.parseCodeownersRule` | `compliance/src/modules/audit-governance/audit-governance.service.ts:172` |
| `AuditGovernanceService.sliceJobsSection` | 1 | `AuditGovernanceService.findIndex(…)` | `compliance/src/modules/audit-governance/audit-governance.service.ts:221` |
| `IssueGithubService.addLabel` | 1 | `IssueGithubService.run` | `compliance/src/modules/issue/issue-github.service.ts:53` |
| `IssueGithubService.assignIssue` | 1 | `IssueGithubService.run` | `compliance/src/modules/issue/issue-github.service.ts:58` |
| `IssueGithubService.describeFailure` | 1 | `IssueGithubService.filter(…)` | `compliance/src/modules/issue/issue-github.service.ts:74` |
| `IssueGithubService.isAvailable` | 1 | `IssueGithubService.run` | `compliance/src/modules/issue/issue-github.service.ts:83` |
| `IssueAssigningService.map(…)` | 1 | `IssueAssigningService.assign` | `compliance/src/modules/issue/issue-assigning.service.ts:51` |
| `IssueMetadataTypeService.checkRoot` | 1 | `IssueMetadataTypeService.map(…)` | `compliance/src/modules/issue/issue-metadata-type.service.ts:32` |
| `IssueMetadataTypeService.readFromSummary` | 1 | `IssueMetadataTypeService.hasBodyParent` | `compliance/src/modules/issue/issue-metadata-type.service.ts:121` |
| `IssueMetadataService.checkTypeLabelPresence` | 1 | `IssueMetadataService.map(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:166` |
| `IssueMetadataService.computeHierarchyDepth` | 1 | `IssueMetadataService.extractParentIssueNumber` | `compliance/src/modules/issue/issue-metadata.service.ts:186` |
| `IssueMetadataService.map(…)` | 1 | `IssueMetadataService.isRecord` | `compliance/src/modules/issue/issue-metadata.service.ts:246` |
| `IssueMetadataService.resolveStandardReleaseLevel` | 1 | `IssueMetadataService.find(…)` | `compliance/src/modules/issue/issue-metadata.service.ts:260` |
| `IssueMetadataService.parseFormAnswers` | 1 | `IssueMetadataService.extractFormField` | `compliance/src/modules/issue/issue-metadata.service.ts:424` |
| `IssueLabelsService.parseFormAnswers` | 1 | `IssueLabelsService.extractFormField` | `compliance/src/modules/issue/issue-labels.service.ts:90` |
| `IssuePlanService.readLabelNames` | 1 | `IssuePlanService.map(…)` | `compliance/src/modules/issue/issue-plan.service.ts:49` |
| `PullRequestBodyLinksService.readExistingIssueNumbers` | 1 | `PullRequestBodyLinksService.flatMap(…)` | `compliance/src/modules/pull-request/pull-request-body-links.service.ts:38` |
| `PullRequestBodyLinksService.flatMap(…)` | 1 | `PullRequestBodyLinksService.map(…)` | `compliance/src/modules/pull-request/pull-request-body-links.service.ts:46` |
| `PullRequestGithubService.isAvailable` | 1 | `PullRequestGithubService.run` | `compliance/src/modules/pull-request/pull-request-github.service.ts:53` |
| `PullRequestDescendantIssuesService.collect` | 1 | `PullRequestDescendantIssuesService.readChildren` | `compliance/src/modules/pull-request/pull-request-descendant-issues.service.ts:63` |
| `PullRequestAncestorIssuesService.climb` | 1 | `PullRequestAncestorIssuesService.readParent` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:46` |
| `PullRequestAncestorIssuesService.collectAncestors` | 1 | `PullRequestAncestorIssuesService.climb` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:79` |
| `PullRequestAncestorIssuesService.format` | 1 | `PullRequestAncestorIssuesService.map(…)` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:103` |
| `PullRequestAncestorIssuesService.readJson(…)` | 1 | `IssueMetadataService.extractParentIssueNumber` | `compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:166` |
| `PullRequestBodyService.countWords` | 1 | `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:88` |
| `PullRequestBodyService.parseBlocks` | 1 | `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:149` |
| `PullRequestBodyService.splitSections` | 1 | `PullRequestBodyService.map(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:172` |
| `PullRequestBodyService.extractTemplateComments` | 1 | `PullRequestBodyService.map(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:211` |
| `PullRequestBodyService.filter(…)` | 1 | `PullRequestBodyService.cleanSectionContent` | `compliance/src/modules/pull-request/pull-request-body.service.ts:221` |
| `PullRequestBodyService.flatMap(…)` | 1 | `PullRequestBodyService.countWords` | `compliance/src/modules/pull-request/pull-request-body.service.ts:266` |
| `PullRequestBodyService.findUnfilledComments` | 1 | `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/pull-request-body.service.ts:284` |
| `PullRequestBodyService.filter(…)` | 1 | `PullRequestBodyService.prefixOf` | `compliance/src/modules/pull-request/pull-request-body.service.ts:290` |
| `PullRequestLabelsService.isTrackedLabel` | 1 | `PullRequestLabelsService.some(…)` | `compliance/src/modules/pull-request/pull-request-labels.service.ts:45` |
| `PullRequestLabelsService.filter(…)` | 1 | `PullRequestLabelsService.isTrackedLabel` | `compliance/src/modules/pull-request/pull-request-labels.service.ts:82` |
| `PullRequestLabelVocabularyService.apply` | 1 | `PullRequestLabelVocabularyService.map(…)` | `compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:35` |
| `PullRequestReleaseSignificanceService.describeMissingScopeFailures` | 1 | `PullRequestReleaseSignificanceService.map(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:51` |
| `PullRequestReleaseSignificanceService.findMissingScopes` | 1 | `PullRequestReleaseSignificanceService.some(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:84` |
| `PullRequestReleaseSignificanceService.findMostSignificantCommit` | 1 | `PullRequestReleaseSignificanceService.significanceRank` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:114` |
| `PullRequestReleaseSignificanceService.releaseLevelName` | 1 | `PullRequestReleaseSignificanceService.find(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:167` |
| `PullRequestReleaseSignificanceService.readReleaseRules` | 1 | `PullRequestReleaseSignificanceService.find(…)` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:278` |
| `PullRequestReleaseSignificanceService.map(…)` | 1 | `PullRequestReleaseSignificanceService.readRawCommit` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:319` |
| `PullRequestReleaseSignificanceService.find(…)` | 1 | `PullRequestReleaseSignificanceService.ruleMatches` | `compliance/src/modules/pull-request/pull-request-release-significance.service.ts:335` |
| `PullRequestReportService.map(…)` | 1 | `PullRequestReportService.describeOutcome` | `compliance/src/modules/pull-request/pull-request-report.service.ts:63` |
| `PullRequestValidationService.checkTitle` | 1 | `PullRequestTitleService.check` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:227` |
| `PullRequestValidationService.listHeadings` | 1 | `PullRequestValidationService.map(…)` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:256` |
| `PullRequestValidationService.listItems` | 1 | `PullRequestValidationService.map(…)` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:261` |
| `PullRequestCommand.abort` | 1 | `PullRequestReportService.publish` | `compliance/src/modules/pull-request/pull-request.command.ts:52` |

</details>
<!-- callidescope:end -->
