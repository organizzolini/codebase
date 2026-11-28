<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `compliance`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 347 |
| Files | 77 |
| Calls traced | 397 |
| Call stacks | 6 |
| Deepest stack | 8 |
| Stacks through recursion | 0 |
| Unfollowable calls | 24 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `AuditFilesCommand.run`** — depth 8 · decorated-method

```text
🚀 AuditFilesCommand.run(): Promise<void> [compliance/src/modules/audit-files/audit-files.command.ts:74]
   ↳ Runs repository governance checks and reports findings.
  └─> AuditFilesService.checkFiles(workspaceRoot?: string): AuditFilesVerdict [compliance/src/modules/audit-files/audit-files.service.ts:272]
     ↳ Runs the complete repository governance audit.
    └─> AuditFilesService.checkWorkflows(workspaceRoot?: string): WorkflowVerdict [compliance/src/modules/audit-files/audit-files.service.ts:284]
       ↳ Audits GitHub Actions workflow files for explicit permissions, timeouts, and naming.
      └─> AuditFilesService.auditWorkflowContent(file: string, content: string, violations: WorkflowViolation[]): void [compliance/src/modules/audit-files/audit-files.service.ts:57]
         ↳ Inspects workflow content lines for name, top-level permissions, and job timeouts.
        └─> AuditFilesService.collectWorkflowJobViolations(…): void [compliance/src/modules/audit-files/audit-files.service.ts:84]
           ↳ Scans workflow lines inside jobs section and verifies declarations.
          └─> AuditFilesService.extractJobBlocks(lines: string[]): WorkflowJobDeclaration[] [compliance/src/modules/audit-files/audit-files.service.ts:142]
             ↳ Extracts job declaration blocks from workflow lines.
            └─> AuditFilesService.sliceJobsSection(lines: string[]): string[] [compliance/src/modules/audit-files/audit-files.service.ts:221]
               ↳ Slices lines starting after the 'jobs:' section header.
              └─> AuditFilesService.findIndex(…)(line: string): boolean [compliance/src/modules/audit-files/audit-files.service.ts:222]
```

**2. `IssueCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 IssueCommand.run(…): Promise<void> [compliance/src/modules/issue/issue.command.ts:87]
   ↳ Runs every phase the plan calls for and exits 1 on any failure.
  └─> IssueAuditService.auditAll(): IssueOutcome [compliance/src/modules/issue/modules/audit/issue-audit.service.ts:57]
     ↳ Audits every open issue and the hierarchy between them.
    └─> IssueMetadataService.checkBulkIssues(issues: readonly IssueSummary[]): BulkIssuesVerdict [compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:285]
       ↳ Validates metadata and hierarchy across a batch of open issues.
      └─> IssueMetadataService.checkHierarchy(issues: readonly IssueSummary[]): readonly HierarchyViolation[] [compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:331]
         ↳ Checks issue hierarchy rules (release significance and max depth 3).
        └─> IssueMetadataService.checkReleaseSignificanceViolation(…): void [compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:50]
           ↳ Checks if a sub-issue exceeds its parent's release level.
          └─> IssueMetadataService.resolveIssueReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:474]
             ↳ Resolves release level and rank from title, body, and labels.
            └─> IssueMetadataService.resolveStandardReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:263]
               ↳ Resolves non-breaking release level from type labels or title match.
              └─> IssueMetadataService.find(…)(name: string): boolean [compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:267]
```

**3. `PullRequestCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 PullRequestCommand.run(passedParameters: string[]): Promise<void> [compliance/src/modules/pull-request/pull-request.command.ts:93]
   ↳ Runs both phases and exits 0 only when every applicable check passed.
  └─> PullRequestValidationService.validate(context: PullRequestContext): CheckOutcome[] [compliance/src/modules/pull-request/pull-request-validation.service.ts:223]
     ↳ Every check that applies to this pull request.
    └─> PullRequestValidationService.checkBody(context: PullRequestContext): CheckOutcome [compliance/src/modules/pull-request/pull-request-validation.service.ts:54]
       ↳ The body, its sections, and the template comments left in it.
      └─> PullRequestBodyService.checkBody(…): BodyVerdict [compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:186]
         ↳ The five lists of failures, from one description and the template's prompts.
        └─> PullRequestBodyService.findEmptySections(body: string): string[] [compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:207]
           ↳ Every required heading whose section does not carry content.
          └─> PullRequestBodyService.filter(…)(heading: string): boolean [compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:210]
            └─> PullRequestBodyService.cleanSectionContent(content: string): string [compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:71]
               ↳ Cleans section text by removing HTML comments and empty markdown list markers.
              └─> PullRequestBodyService.filter(…)(line: string): boolean [compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:77]
```

<details>
<summary>3 more call stacks</summary>

**4. `PullRequestTemplateCommand.run`** — depth 6 · decorated-method

```text
🚀 PullRequestTemplateCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [compliance/src/modules/pull-request-template/pull-request-template.command.ts:234]
   ↳ Runs the pull-request-template sync command in check or write mode.
  └─> PullRequestTemplateCommand.synchronize(mode: PullRequestTemplateMode): Promise<boolean> [compliance/src/modules/pull-request-template/pull-request-template.command.ts:169]
     ↳ Synchronizes the PR template and reports success without exiting.
    └─> PullRequestTemplateCommand.handleWriteMode(templateContent: string, targetFiles: string[]): void [compliance/src/modules/pull-request-template/pull-request-template.command.ts:114]
       ↳ Writes the current PR template into any target files that are out of sync.
      └─> PullRequestTemplateCommand.filter(…)(targetFile: string): boolean [compliance/src/modules/pull-request-template/pull-request-template.command.ts:119]
        └─> PullRequestTemplateCommand.checkTargetSync(templateContent: string, targetFile: string): boolean [compliance/src/modules/pull-request-template/pull-request-template.command.ts:42]
           ↳ Checks whether the target file's marker block matches the current PR template.
          └─> PullRequestTemplateCommand.extractMarkerContent(content: string, markerName: string): string | undefined [compliance/src/modules/pull-request-template/pull-request-template.command.ts:77]
             ↳ Extracts the content between start and end marker comments from a file.
```

**5. `OrganizationProjectCommand.run`** — depth 4 · decorated-method

```text
🚀 OrganizationProjectCommand.run(passedParameters: string[]): Promise<void> [compliance/src/modules/organization-project/organization-project.command.ts:163]
   ↳ Adds missing repository issues and pull requests, leaving existing items untouched.
  └─> OrganizationProjectCommand.readRepositoryResourceUrls(resource: "issue" | "pr"): readonly string[] [compliance/src/modules/organization-project/organization-project.command.ts:131]
     ↳ Lists repository issue or pull request URLs.
    └─> OrganizationProjectCommand.readJson(…): T [compliance/src/modules/organization-project/organization-project.command.ts:101]
       ↳ Validates JSON returned by a GitHub CLI read command.
      └─> PullRequestGithubService.run(commandArguments: readonly string[]): GithubCliResult [compliance/src/modules/pull-request/modules/github/pull-request-github.service.ts:84]
         ↳ Invokes `gh` with these arguments, capturing each stream on its own.
```

**6. `PullRequestGithubService.isAvailable`** — depth 2 · orphan-root

```text
🚀 PullRequestGithubService.isAvailable(): boolean [compliance/src/modules/pull-request/modules/github/pull-request-github.service.ts:46]
   ↳ Whether the `gh` binary can be executed at all.
  └─> PullRequestGithubService.run(commandArguments: readonly string[]): GithubCliResult [compliance/src/modules/pull-request/modules/github/pull-request-github.service.ts:84]
     ↳ Invokes `gh` with these arguments, capturing each stream on its own.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `IssueAuditService.auditOne` | 9 | `IssueGithubService.isAvailable`, `IssueAuditService.fail`, `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueMetadataService.resolveFromDocument`, `IssueGithubService.readFieldNames`, `IssueMetadataService.checkMetadata`, `IssueMetadataService.parseFormAnswers`, `IssueAuditService.report` | `compliance/src/modules/issue/modules/audit/issue-audit.service.ts:92` |
| `PullRequestCommand.run` | 9 | `PullRequestCommand.begin`, `PullRequestAncestorIssuesService.link`, `PullRequestLabelVocabularyService.reconcile`, `PullRequestCommand.load`, `PullRequestReportService.compose`, `PullRequestValidationService.validate`, `PullRequestCommand.flatMap(…)`, `PullRequestCommand.flatMap(…)`, `PullRequestReportService.publish` | `compliance/src/modules/pull-request/pull-request.command.ts:93` |
| `IssueCommand.run` | 7 | `IssuePlanService.resolve`, `IssueCommand.prepare`, `IssueAuditService.auditOne`, `IssueAssigningService.assignAll`, `IssueAuditService.auditAll`, `IssueReportService.compose`, `IssueReportService.publish` | `compliance/src/modules/issue/issue.command.ts:87` |

<details>
<summary>148 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `IssueMetadataService.checkMetadata` | 6 | `IssueMetadataService.groupLabels`, `IssueMetadataService.checkTypeLabel`, `IssueMetadataService.checkScopeLabels`, `IssueMetadataService.checkSourceLabel`, `IssueMetadataTypeService.check`, `IssueFieldsService.checkPriority` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:372` |
| `PullRequestLabelsService.planReconciliation` | 6 | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.filter(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels.service.ts:60` |
| `PullRequestAncestorIssuesService.link` | 6 | `PullRequestBodyLinksService.extractClosingIssueNumbers`, `PullRequestAncestorIssuesService.unchanged`, `PullRequestAncestorIssuesService.collectAncestors`, `PullRequestDescendantIssuesService.collect`, `PullRequestAncestorIssuesService.writeReferences`, `PullRequestAncestorIssuesService.filter(…)` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:244` |
| `PullRequestLinkedIssuesService.checkIssue` | 6 | `IssueMetadataService.resolveFromDocument`, `IssueMetadataService.checkMetadata`, `IssueMetadataService.parseFormAnswers`, `PullRequestLinkedIssuesService.nameIssue`, `PullRequestLinkedIssuesService.checkField`, `PullRequestLinkedIssuesService.findRoot` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:70` |
| `PullRequestValidationService.checkSignificance` | 6 | `PullRequestReleaseSignificanceService.parseConventionalSubject`, `PullRequestGithubService.readList`, `PullRequestGithubService.describeFailure`, `PullRequestReleaseSignificanceService.resolveFromCommits`, `PullRequestReleaseSignificanceService.checkSignificance`, `PullRequestReleaseSignificanceService.readReleaseRules` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:115` |
| `PullRequestValidationService.validate` | 6 | `PullRequestValidationService.checkTitle`, `PullRequestValidationService.checkBody`, `PullRequestValidationService.checkMetadata`, `PullRequestValidationService.checkSignificance`, `PullRequestLinkedIssuesService.check`, `PullRequestAncestorIssuesService.verify` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:223` |
| `IssueGithubService.listOpenIssueFieldNames` | 5 | `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueGithubService.map(…)`, `IssueGithubService.map(…)`, `IssueGithubService.describeError` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:56` |
| `IssueGithubService.listOpenIssues` | 5 | `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueGithubService.describeError`, `IssueGithubService.listOpenIssueFieldNames`, `IssueGithubService.map(…)` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:126` |
| `IssueMetadataService.checkBulkIssues` | 5 | `IssueMetadataService.parseFormAnswers`, `IssueMetadataService.checkMetadata`, `IssueMetadataTypeService.readFromSummary`, `IssueMetadataService.map(…)`, `IssueMetadataService.checkHierarchy` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:285` |
| `IssueAuditService.auditAll` | 5 | `IssueGithubService.isAvailable`, `IssueAuditService.fail`, `IssueGithubService.listOpenIssues`, `IssueMetadataService.checkBulkIssues`, `IssueAuditService.map(…)` | `compliance/src/modules/issue/modules/audit/issue-audit.service.ts:57` |
| `PullRequestBodyLinksService.addRelatedIssueReferences` | 5 | `PullRequestBodyLinksService.findIndex(…)`, `PullRequestBodyLinksService.readExistingIssueNumbers`, `PullRequestBodyLinksService.filter(…)`, `PullRequestBodyLinksService.insertReferences`, `PullRequestBodyLinksService.map(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body-links.service.ts:61` |
| `PullRequestBodyService.checkBody` | 5 | `PullRequestBodyService.findEmptySections`, `PullRequestBodyService.findMalformedSections`, `PullRequestBodyService.findMissingHeadings`, `PullRequestBodyService.findOversizedSections`, `PullRequestBodyService.findUnfilledComments` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:186` |
| `PullRequestLabelVocabularyService.plan` | 5 | `PullRequestGithubService.readList`, `PullRequestGithubService.describeFailure`, `PullRequestLabelsService.planReconciliation`, `PullRequestLabelsService.parseRepositoryLabels`, `PullRequestLabelsService.readExpectedLabels` | `compliance/src/modules/pull-request/modules/labels/pull-request-label-vocabulary.service.ts:72` |
| `PullRequestLabelsAssigneesService.checkMetadata` | 5 | `PullRequestLabelsAssigneesService.groupLabels`, `PullRequestLabelsAssigneesService.checkTypeLabel`, `PullRequestLabelsAssigneesService.checkScopeLabels`, `PullRequestLabelsAssigneesService.record`, `PullRequestLabelsAssigneesService.checkSourceLabel` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels-assignees.service.ts:149` |
| `PullRequestAncestorIssuesService.writeReferences` | 5 | `PullRequestBodyLinksService.addRelatedIssueReferences`, `PullRequestAncestorIssuesService.unchanged`, `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestAncestorIssuesService.format` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:168` |
| `PullRequestAncestorIssuesService.verify` | 5 | `PullRequestBodyLinksService.extractClosingIssueNumbers`, `PullRequestAncestorIssuesService.collectAncestors`, `PullRequestAncestorIssuesService.map(…)`, `PullRequestAncestorIssuesService.filter(…)`, `PullRequestAncestorIssuesService.format` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:278` |
| `PullRequestReleaseSignificanceService.checkSignificance` | 5 | `PullRequestReleaseSignificanceService.significanceRank`, `PullRequestReleaseSignificanceService.findMostSignificantCommit`, `PullRequestReleaseSignificanceService.findCommitScopes`, `PullRequestReleaseSignificanceService.describeSignificanceFailure`, `PullRequestReleaseSignificanceService.describeScopeFailure` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:165` |
| `OrganizationProjectCommand.run` | 5 | `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.readRepositoryResourceUrls`, `OrganizationProjectCommand.readExistingProjectResourceUrls`, `OrganizationProjectCommand.filter(…)`, `OrganizationProjectCommand.addProjectItem` | `compliance/src/modules/organization-project/organization-project.command.ts:163` |
| `IssueGithubService.listUnassignedOpenIssueNumbers` | 4 | `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueGithubService.map(…)`, `IssueGithubService.filter(…)` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:170` |
| `IssueAssigningService.assignAll` | 4 | `IssueGithubService.listUnassignedOpenIssueNumbers`, `IssueAssigningService.map(…)`, `IssueAssigningService.flatMap(…)`, `IssueAssigningService.flatMap(…)` | `compliance/src/modules/issue/modules/assignees/issue-assigning.service.ts:43` |
| `IssueMetadataService.resolveFromDocument` | 4 | `IssueMetadataService.describeError`, `IssueMetadataService.isRecord`, `IssueMetadataTypeService.readFromDocument`, `IssueMetadataService.readLabelNames` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:446` |
| `IssuePlanService.resolve` | 4 | `IssuePlanService.filter(…)`, `IssuePlanService.filter(…)`, `IssuePlanService.readLabelNames`, `IssuePlanService.hasNoAssignee` | `compliance/src/modules/issue/modules/audit/issue-plan.service.ts:66` |
| `IssueLabelingService.label` | 4 | `IssueLabelsService.missingLabels`, `IssueLabelsService.parseFormAnswers`, `IssueGithubService.isAvailable`, `IssueLabelingService.map(…)` | `compliance/src/modules/issue/modules/labels/issue-labeling.service.ts:29` |
| `PullRequestLabelVocabularyService.reconcile` | 4 | `PullRequestLabelVocabularyService.plan`, `PullRequestLabelVocabularyService.map(…)`, `PullRequestLabelVocabularyService.apply`, `PullRequestLabelVocabularyService.describePlan` | `compliance/src/modules/pull-request/modules/labels/pull-request-label-vocabulary.service.ts:96` |
| `PullRequestLinkedIssuesService.readIssue` | 4 | `PullRequestLinkedIssuesService.read(…)`, `PullRequestLinkedIssuesService.read`, `PullRequestLinkedIssuesService.read(…)`, `IssueMetadataService.extractParentIssueNumber` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:193` |
| `PullRequestLinkedIssuesService.check` | 4 | `PullRequestBodyLinksService.extractClosingIssueNumbers`, `PullRequestLinkedIssuesService.readHierarchy`, `PullRequestLinkedIssuesService.map(…)`, `PullRequestLinkedIssuesService.checkIssue` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:245` |
| `PullRequestReportService.compose` | 4 | `PullRequestReportService.map(…)`, `PullRequestReportService.map(…)`, `PullRequestReportService.reduce(…)`, `PullRequestReportService.flatMap(…)` | `compliance/src/modules/pull-request/pull-request-report.service.ts:49` |
| `PullRequestCommand.begin` | 4 | `PullRequestContextService.resolveInvocation`, `PullRequestCommand.abort`, `PullRequestCommand.load`, `PullRequestContextService.writeStepOutputs` | `compliance/src/modules/pull-request/pull-request.command.ts:57` |
| `PullRequestTemplateCommand.synchronize` | 4 | `PullRequestTemplateCommand.map(…)`, `PullRequestTemplateCommand.loadTemplate`, `PullRequestTemplateCommand.handleCheckMode`, `PullRequestTemplateCommand.handleWriteMode` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:169` |
| `AuditFilesService.auditWorkflowContent` | 3 | `AuditFilesService.some(…)`, `AuditFilesService.some(…)`, `AuditFilesService.collectWorkflowJobViolations` | `compliance/src/modules/audit-files/audit-files.service.ts:57` |
| `AuditFilesCommand.run` | 3 | `AuditFilesService.checkFiles`, `AuditFilesCommand.reportCodeownersVerdict`, `AuditFilesCommand.reportWorkflowsVerdict` | `compliance/src/modules/audit-files/audit-files.command.ts:74` |
| `IssueReportService.compose` | 3 | `IssueReportService.filter(…)`, `IssueReportService.reduce(…)`, `IssueReportService.flatMap(…)` | `compliance/src/modules/issue/issue-report.service.ts:28` |
| `IssueGithubService.readFieldNames` | 3 | `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueGithubService.describeError` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:211` |
| `IssueMetadataService.checkReleaseSignificanceViolation` | 3 | `IssueMetadataService.resolveIssueReleaseLevel`, `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:50` |
| `IssueMetadataService.checkTypeLabel` | 3 | `IssueMetadataService.checkTypeLabelPresence`, `IssueMetadataService.map(…)`, `IssueMetadataService.filter(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:134` |
| `IssueMetadataService.checkHierarchy` | 3 | `IssueMetadataService.extractParentIssueNumber`, `IssueMetadataService.checkReleaseSignificanceViolation`, `IssueMetadataService.computeHierarchyDepth` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:331` |
| `IssueMetadataService.groupLabels` | 3 | `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:420` |
| `PullRequestBodyService.holdsShape` | 3 | `PullRequestBodyService.every(…)`, `PullRequestBodyService.filter(…)`, `PullRequestBodyService.bulletMarkersOf` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:95` |
| `PullRequestBodyService.findMalformedSections` | 3 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:221` |
| `PullRequestBodyService.filter(…)` | 3 | `PullRequestBodyService.cleanSectionContent`, `PullRequestBodyService.holdsShape`, `PullRequestBodyService.parseBlocks` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:224` |
| `PullRequestContextService.fetch` | 3 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestContextService.parseContext` | `compliance/src/modules/pull-request/modules/context/pull-request-context.service.ts:88` |
| `PullRequestLabelsAssigneesService.groupLabels` | 3 | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels-assignees.service.ts:190` |
| `PullRequestLinkedIssuesService.read` | 3 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `IssueMetadataService.describeError` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:139` |
| `PullRequestTitleService.checkScopeCount` | 3 | `PullRequestTitleService.filter(…)`, `PullRequestTitleService.map(…)`, `tooManyScopesMessage` | `compliance/src/modules/pull-request/modules/title/pull-request-title.service.ts:29` |
| `PullRequestValidationService.checkBody` | 3 | `PullRequestValidationService.describeBodyVerdict`, `PullRequestBodyService.checkBody`, `PullRequestBodyService.extractTemplateComments` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:54` |
| `OrganizationProjectCommand.addProjectItem` | 3 | `PullRequestGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/organization-project/organization-project.command.ts:44` |
| `OrganizationProjectCommand.readExistingProjectResourceUrls` | 3 | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.flatMap(…)` | `compliance/src/modules/organization-project/organization-project.command.ts:70` |
| `OrganizationProjectCommand.readJson` | 3 | `PullRequestGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/organization-project/organization-project.command.ts:101` |
| `OrganizationProjectCommand.readRepositoryResourceUrls` | 3 | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.map(…)` | `compliance/src/modules/organization-project/organization-project.command.ts:131` |
| `AuditFilesService.collectWorkflowJobViolations` | 2 | `AuditFilesService.extractJobBlocks`, `AuditFilesService.evaluateJob` | `compliance/src/modules/audit-files/audit-files.service.ts:84` |
| `AuditFilesService.extractJobBlocks` | 2 | `AuditFilesService.sliceJobsSection`, `AuditFilesService.applyJobLine` | `compliance/src/modules/audit-files/audit-files.service.ts:142` |
| `AuditFilesService.parseCodeownersRule` | 2 | `AuditFilesService.map(…)`, `AuditFilesService.filter(…)` | `compliance/src/modules/audit-files/audit-files.service.ts:193` |
| `AuditFilesService.checkCodeowners` | 2 | `AuditFilesService.find(…)`, `AuditFilesService.parseCodeownersLines` | `compliance/src/modules/audit-files/audit-files.service.ts:230` |
| `AuditFilesService.checkFiles` | 2 | `AuditFilesService.checkCodeowners`, `AuditFilesService.checkWorkflows` | `compliance/src/modules/audit-files/audit-files.service.ts:272` |
| `AuditFilesService.checkWorkflows` | 2 | `AuditFilesService.filter(…)`, `AuditFilesService.auditWorkflowContent` | `compliance/src/modules/audit-files/audit-files.service.ts:284` |
| `IssueAssigningService.assign` | 2 | `IssueGithubService.assignIssue`, `IssueGithubService.describeFailure` | `compliance/src/modules/issue/modules/assignees/issue-assigning.service.ts:25` |
| `IssueMetadataTypeService.check` | 2 | `IssueMetadataTypeService.checkSubIssue`, `IssueMetadataTypeService.checkRoot` | `compliance/src/modules/issue/modules/metadata/issue-metadata-type.service.ts:79` |
| `IssueMetadataTypeService.readFromDocument` | 2 | `IssueMetadataTypeService.isRecord`, `IssueMetadataTypeService.hasBodyParent` | `compliance/src/modules/issue/modules/metadata/issue-metadata-type.service.ts:98` |
| `IssueMetadataService.checkSourceLabel` | 2 | `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:103` |
| `IssueMetadataService.readLabelNames` | 2 | `IssueMetadataService.filter(…)`, `IssueMetadataService.map(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:247` |
| `IssueMetadataService.resolveIssueReleaseLevel` | 2 | `IssueMetadataService.hasBreakingMarker`, `IssueMetadataService.resolveStandardReleaseLevel` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:474` |
| `IssueAuditService.report` | 2 | `IssueAuditService.map(…)`, `IssueAuditService.map(…)` | `compliance/src/modules/issue/modules/audit/issue-audit.service.ts:31` |
| `IssueLabelsService.missingLabels` | 2 | `IssueLabelsService.filter(…)`, `IssueLabelsService.labelsFromAnswers` | `compliance/src/modules/issue/modules/labels/issue-labels.service.ts:70` |
| `IssueLabelingService.map(…)` | 2 | `IssueGithubService.addLabel`, `IssueGithubService.describeFailure` | `compliance/src/modules/issue/modules/labels/issue-labeling.service.ts:47` |
| `IssueCommand.prepare` | 2 | `IssueLabelingService.label`, `IssueAssigningService.assign` | `compliance/src/modules/issue/issue.command.ts:50` |
| `PullRequestBodyService.cleanSectionContent` | 2 | `PullRequestBodyService.filter(…)`, `PullRequestBodyService.map(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:71` |
| `PullRequestBodyService.findEmptySections` | 2 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:207` |
| `PullRequestBodyService.findMissingHeadings` | 2 | `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:243` |
| `PullRequestBodyService.findOversizedSections` | 2 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.flatMap(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:250` |
| `PullRequestGithubService.readList` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.flatMap(…)` | `compliance/src/modules/pull-request/modules/github/pull-request-github.service.ts:54` |
| `PullRequestLabelsService.readExpectedLabels` | 2 | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels.service.ts:97` |
| `PullRequestLabelVocabularyService.map(…)` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/modules/labels/pull-request-label-vocabulary.service.ts:39` |
| `PullRequestLabelVocabularyService.describePlan` | 2 | `PullRequestLabelVocabularyService.map(…)`, `PullRequestLabelVocabularyService.map(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-label-vocabulary.service.ts:57` |
| `PullRequestLabelsAssigneesService.checkSourceLabel` | 2 | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.map(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels-assignees.service.ts:80` |
| `PullRequestLabelsAssigneesService.checkTypeLabel` | 2 | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.filter(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels-assignees.service.ts:111` |
| `PullRequestLabelsAssigneesService.parseTitle` | 2 | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.map(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels-assignees.service.ts:209` |
| `PullRequestDescendantIssuesService.readChildren` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-descendant-issues.service.ts:23` |
| `PullRequestAncestorIssuesService.readJson` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:108` |
| `PullRequestAncestorIssuesService.readParent` | 2 | `PullRequestAncestorIssuesService.readJson(…)`, `PullRequestAncestorIssuesService.readJson` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:136` |
| `PullRequestLinkedIssuesService.checkField` | 2 | `PullRequestLinkedIssuesService.checkField(…)`, `IssueFieldsService.checkField` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:52` |
| `PullRequestReleaseSignificanceService.describeScopeFailure` | 2 | `PullRequestReleaseSignificanceService.some(…)`, `PullRequestReleaseSignificanceService.map(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:48` |
| `PullRequestReleaseSignificanceService.describeSignificanceFailure` | 2 | `PullRequestReleaseSignificanceService.releaseLevelName`, `PullRequestReleaseSignificanceService.find(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:63` |
| `PullRequestReleaseSignificanceService.readRawCommit` | 2 | `PullRequestReleaseSignificanceService.isRecord`, `PullRequestReleaseSignificanceService.parseConventionalSubject` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:120` |
| `PullRequestReleaseSignificanceService.parseConventionalSubject` | 2 | `PullRequestReleaseSignificanceService.filter(…)`, `PullRequestReleaseSignificanceService.map(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:202` |
| `PullRequestReleaseSignificanceService.resolveFromCommits` | 2 | `PullRequestReleaseSignificanceService.describeError`, `PullRequestReleaseSignificanceService.map(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:255` |
| `PullRequestReleaseSignificanceService.significanceRank` | 2 | `PullRequestReleaseSignificanceService.find(…)`, `PullRequestReleaseSignificanceService.rankOfRelease` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:282` |
| `PullRequestTitleService.checkCommitlint` | 2 | `PullRequestTitleService.filter(…)`, `PullRequestTitleService.map(…)` | `compliance/src/modules/pull-request/modules/title/pull-request-title.service.ts:41` |
| `PullRequestTitleService.check` | 2 | `PullRequestTitleService.checkCommitlint`, `PullRequestTitleService.checkScopeCount` | `compliance/src/modules/pull-request/modules/title/pull-request-title.service.ts:68` |
| `PullRequestReportService.describeOutcome` | 2 | `PullRequestReportService.map(…)`, `PullRequestReportService.map(…)` | `compliance/src/modules/pull-request/pull-request-report.service.ts:26` |
| `PullRequestValidationService.checkMetadata` | 2 | `PullRequestLabelsAssigneesService.parseTitle`, `PullRequestLabelsAssigneesService.checkMetadata` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:82` |
| `PullRequestValidationService.describeBodyVerdict` | 2 | `PullRequestValidationService.listHeadings`, `PullRequestValidationService.listItems` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:187` |
| `PullRequestCommand.load` | 2 | `PullRequestContextService.fetch`, `PullRequestCommand.abort` | `compliance/src/modules/pull-request/pull-request.command.ts:84` |
| `PullRequestTemplateCommand.checkTargetSync` | 2 | `PullRequestTemplateCommand.extractMarkerContent`, `PullRequestTemplateCommand.wrapInCodeBlock` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:42` |
| `PullRequestTemplateCommand.handleWriteMode` | 2 | `PullRequestTemplateCommand.filter(…)`, `PullRequestTemplateCommand.writeTargetSync` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:114` |
| `PullRequestTemplateCommand.writeTargetSync` | 2 | `PullRequestTemplateCommand.wrapInCodeBlock`, `PullRequestTemplateCommand.replaceMarkerContent` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:210` |
| `PullRequestTemplateCommand.run` | 2 | `PullRequestTemplateCommand.resolveMode`, `PullRequestTemplateCommand.synchronize` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:234` |
| `AuditFilesService.parseCodeownersLines` | 1 | `AuditFilesService.parseCodeownersRule` | `compliance/src/modules/audit-files/audit-files.service.ts:172` |
| `AuditFilesService.sliceJobsSection` | 1 | `AuditFilesService.findIndex(…)` | `compliance/src/modules/audit-files/audit-files.service.ts:221` |
| `IssueGithubService.addLabel` | 1 | `IssueGithubService.run` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:92` |
| `IssueGithubService.assignIssue` | 1 | `IssueGithubService.run` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:97` |
| `IssueGithubService.describeFailure` | 1 | `IssueGithubService.filter(…)` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:112` |
| `IssueGithubService.isAvailable` | 1 | `IssueGithubService.run` | `compliance/src/modules/issue/modules/github/issue-github.service.ts:121` |
| `IssueAssigningService.map(…)` | 1 | `IssueAssigningService.assign` | `compliance/src/modules/issue/modules/assignees/issue-assigning.service.ts:52` |
| `IssueFieldsService.checkPriority` | 1 | `IssueFieldsService.checkField` | `compliance/src/modules/issue/modules/fields/issue-fields.service.ts:55` |
| `IssueMetadataTypeService.checkRoot` | 1 | `IssueMetadataTypeService.map(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata-type.service.ts:31` |
| `IssueMetadataTypeService.readFromSummary` | 1 | `IssueMetadataTypeService.hasBodyParent` | `compliance/src/modules/issue/modules/metadata/issue-metadata-type.service.ts:118` |
| `IssueMetadataService.checkTypeLabelPresence` | 1 | `IssueMetadataService.map(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:169` |
| `IssueMetadataService.computeHierarchyDepth` | 1 | `IssueMetadataService.extractParentIssueNumber` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:189` |
| `IssueMetadataService.map(…)` | 1 | `IssueMetadataService.isRecord` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:249` |
| `IssueMetadataService.resolveStandardReleaseLevel` | 1 | `IssueMetadataService.find(…)` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:263` |
| `IssueMetadataService.parseFormAnswers` | 1 | `IssueMetadataService.extractFormField` | `compliance/src/modules/issue/modules/metadata/issue-metadata.service.ts:435` |
| `IssuePlanService.readLabelNames` | 1 | `IssuePlanService.map(…)` | `compliance/src/modules/issue/modules/audit/issue-plan.service.ts:49` |
| `IssueLabelsService.parseFormAnswers` | 1 | `IssueLabelsService.extractFormField` | `compliance/src/modules/issue/modules/labels/issue-labels.service.ts:83` |
| `PullRequestBodyLinksService.readExistingIssueNumbers` | 1 | `PullRequestBodyLinksService.flatMap(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body-links.service.ts:39` |
| `PullRequestBodyLinksService.flatMap(…)` | 1 | `PullRequestBodyLinksService.map(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body-links.service.ts:47` |
| `PullRequestBodyLinksService.extractClosingIssueNumbers` | 1 | `PullRequestBodyLinksService.map(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body-links.service.ts:113` |
| `PullRequestBodyService.countWords` | 1 | `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:83` |
| `PullRequestBodyService.parseBlocks` | 1 | `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:140` |
| `PullRequestBodyService.splitSections` | 1 | `PullRequestBodyService.map(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:161` |
| `PullRequestBodyService.extractTemplateComments` | 1 | `PullRequestBodyService.map(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:200` |
| `PullRequestBodyService.filter(…)` | 1 | `PullRequestBodyService.cleanSectionContent` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:210` |
| `PullRequestBodyService.flatMap(…)` | 1 | `PullRequestBodyService.countWords` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:253` |
| `PullRequestBodyService.findUnfilledComments` | 1 | `PullRequestBodyService.filter(…)` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:271` |
| `PullRequestBodyService.filter(…)` | 1 | `PullRequestBodyService.prefixOf` | `compliance/src/modules/pull-request/modules/body/pull-request-body.service.ts:277` |
| `PullRequestGithubService.isAvailable` | 1 | `PullRequestGithubService.run` | `compliance/src/modules/pull-request/modules/github/pull-request-github.service.ts:46` |
| `PullRequestLabelsService.isTrackedLabel` | 1 | `PullRequestLabelsService.some(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels.service.ts:43` |
| `PullRequestLabelsService.filter(…)` | 1 | `PullRequestLabelsService.isTrackedLabel` | `compliance/src/modules/pull-request/modules/labels/pull-request-labels.service.ts:76` |
| `PullRequestLabelVocabularyService.apply` | 1 | `PullRequestLabelVocabularyService.map(…)` | `compliance/src/modules/pull-request/modules/labels/pull-request-label-vocabulary.service.ts:35` |
| `PullRequestDescendantIssuesService.collect` | 1 | `PullRequestDescendantIssuesService.readChildren` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-descendant-issues.service.ts:63` |
| `PullRequestAncestorIssuesService.climb` | 1 | `PullRequestAncestorIssuesService.readParent` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:46` |
| `PullRequestAncestorIssuesService.collectAncestors` | 1 | `PullRequestAncestorIssuesService.climb` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:79` |
| `PullRequestAncestorIssuesService.format` | 1 | `PullRequestAncestorIssuesService.map(…)` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:103` |
| `PullRequestAncestorIssuesService.readJson(…)` | 1 | `IssueMetadataService.extractParentIssueNumber` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-ancestor-issues.service.ts:146` |
| `PullRequestLinkedIssuesService.checkField(…)` | 1 | `PullRequestLinkedIssuesService.nameIssue` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:60` |
| `PullRequestLinkedIssuesService.readHierarchy` | 1 | `PullRequestLinkedIssuesService.readIssue` | `compliance/src/modules/pull-request/modules/linked-issues/pull-request-linked-issues.service.ts:171` |
| `PullRequestReleaseSignificanceService.findCommitScopes` | 1 | `PullRequestReleaseSignificanceService.flatMap(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:79` |
| `PullRequestReleaseSignificanceService.findMostSignificantCommit` | 1 | `PullRequestReleaseSignificanceService.significanceRank` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:86` |
| `PullRequestReleaseSignificanceService.releaseLevelName` | 1 | `PullRequestReleaseSignificanceService.find(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:138` |
| `PullRequestReleaseSignificanceService.readReleaseRules` | 1 | `PullRequestReleaseSignificanceService.find(…)` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:233` |
| `PullRequestReleaseSignificanceService.map(…)` | 1 | `PullRequestReleaseSignificanceService.readRawCommit` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:273` |
| `PullRequestReleaseSignificanceService.find(…)` | 1 | `PullRequestReleaseSignificanceService.ruleMatches` | `compliance/src/modules/pull-request/modules/release-significance/pull-request-release-significance.service.ts:286` |
| `PullRequestReportService.map(…)` | 1 | `PullRequestReportService.describeOutcome` | `compliance/src/modules/pull-request/pull-request-report.service.ts:63` |
| `PullRequestValidationService.checkTitle` | 1 | `PullRequestTitleService.check` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:177` |
| `PullRequestValidationService.listHeadings` | 1 | `PullRequestValidationService.map(…)` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:206` |
| `PullRequestValidationService.listItems` | 1 | `PullRequestValidationService.map(…)` | `compliance/src/modules/pull-request/pull-request-validation.service.ts:211` |
| `PullRequestCommand.abort` | 1 | `PullRequestReportService.publish` | `compliance/src/modules/pull-request/pull-request.command.ts:50` |
| `PullRequestTemplateCommand.handleCheckMode` | 1 | `PullRequestTemplateCommand.checkTargetSync` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:91` |
| `PullRequestTemplateCommand.filter(…)` | 1 | `PullRequestTemplateCommand.checkTargetSync` | `compliance/src/modules/pull-request-template/pull-request-template.command.ts:119` |

</details>
<!-- callidescope:end -->
