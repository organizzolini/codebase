## Compliance CLI

The Compliance CLI owns Continuous Compliance checks that read or update
GitHub issues, pull requests, and repository governance metadata. It has four
commands:

- `pull-request` — one run per pull request or merge group: it writes parent
  issue references and labels (pull request events only), then validates title,
  body, labels, assignees, and release significance together.
- `issue` — labels and assigns a new issue, audits one issue, or audits every
  open issue, chosen by event or arguments.
- `audit-governance` — CODEOWNERS and workflow security.
- `organization-project` — adds issues and pull requests to the project.

## Run a command

Run the CLI directly through Nx:

```bash
nx run compliance:start:pull-request          # CI: reads the event environment
nx run compliance:start:issue
nx run compliance:start:issue-audit           # issue --all
nx run compliance:start:audit-governance
nx run compliance:start:organization-project
```

Locally, `pull-request <number>` and `issue <number>` are read-only; add `write`
(`pull-request <number> write`) to also write.
Commands that need GitHub access use the `gh` CLI and the current repository
authentication. The organization-project command manually adds all issues and
pull requests from `organizzolini/codebase` that are not already in the
organization's `codebase` project. It requires project write access and can be
rerun safely. Workflow invocations provide event data and tokens through
environment variables.

## Start

```bash
nx run compliance:start
```

## Test

```bash
nx run compliance:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/compliance`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

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
🚀 AuditGovernanceCommand.run(): Promise<void> [projects/compliance/src/modules/audit-governance/audit-governance.command.ts:77]
   ↳ Runs repository governance checks and reports findings.
  └─> AuditGovernanceService.checkGovernance(workspaceRoot?: string): AuditGovernanceVerdict [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:272]
     ↳ Runs the complete repository governance audit.
    └─> AuditGovernanceService.checkWorkflows(workspaceRoot?: string): WorkflowVerdict [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:286]
       ↳ Audits GitHub Actions workflow files for explicit permissions, timeouts, and naming.
      └─> AuditGovernanceService.auditWorkflowContent(file: string, content: string, violations: WorkflowViolation[]): void [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:57]
         ↳ Inspects workflow content lines for name, top-level permissions, and job timeouts.
        └─> AuditGovernanceService.collectWorkflowJobViolations(…): void [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:84]
           ↳ Scans workflow lines inside jobs section and verifies declarations.
          └─> AuditGovernanceService.extractJobBlocks(lines: string[]): WorkflowJobDeclaration[] [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:142]
             ↳ Extracts job declaration blocks from workflow lines.
            └─> AuditGovernanceService.sliceJobsSection(lines: string[]): string[] [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:221]
               ↳ Slices lines starting after the 'jobs:' section header.
              └─> AuditGovernanceService.findIndex(…)(line: string): boolean [projects/compliance/src/modules/audit-governance/audit-governance.service.ts:222]
```

**2. `IssueCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 IssueCommand.run(…): Promise<void> [projects/compliance/src/modules/issue/issue.command.ts:90]
   ↳ Runs every phase the plan calls for and exits 1 on any failure.
  └─> IssueAuditService.auditAll(): IssueOutcome [projects/compliance/src/modules/issue/issue-audit.service.ts:32]
     ↳ Audits every open issue and the hierarchy between them.
    └─> IssueMetadataService.checkBulkIssues(issues: readonly IssueSummary[]): BulkIssuesVerdict [projects/compliance/src/modules/issue/issue-metadata.service.ts:282]
       ↳ Validates metadata and hierarchy across a batch of open issues.
      └─> IssueMetadataService.checkHierarchy(issues: readonly IssueSummary[]): readonly HierarchyViolation[] [projects/compliance/src/modules/issue/issue-metadata.service.ts:325]
         ↳ Checks issue hierarchy rules (release significance and max depth 3).
        └─> IssueMetadataService.checkReleaseSignificanceViolation(…): void [projects/compliance/src/modules/issue/issue-metadata.service.ts:47]
           ↳ Checks if a sub-issue exceeds its parent's release level.
          └─> IssueMetadataService.resolveIssueReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [projects/compliance/src/modules/issue/issue-metadata.service.ts:463]
             ↳ Resolves release level and rank from title, body, and labels.
            └─> IssueMetadataService.resolveStandardReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [projects/compliance/src/modules/issue/issue-metadata.service.ts:260]
               ↳ Resolves non-breaking release level from type labels or title match.
              └─> IssueMetadataService.find(…)(name: string): boolean [projects/compliance/src/modules/issue/issue-metadata.service.ts:264]
```

**3. `PullRequestCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 PullRequestCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request/pull-request.command.ts:95]
   ↳ Runs both phases and exits 0 only when every applicable check passed.
  └─> PullRequestValidationService.validate(context: PullRequestContext): CheckOutcome[] [projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:278]
     ↳ Every check that applies to this pull request.
    └─> PullRequestValidationService.checkBody(context: PullRequestContext): CheckOutcome [projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:50]
       ↳ The body, its sections, and the template comments left in it.
      └─> PullRequestBodyService.checkBody(…): BodyVerdict [projects/compliance/src/modules/pull-request/pull-request-body.service.ts:197]
         ↳ The five lists of failures, from one description and the template's prompts.
        └─> PullRequestBodyService.findEmptySections(body: string): string[] [projects/compliance/src/modules/pull-request/pull-request-body.service.ts:218]
           ↳ Every required heading whose section does not carry content.
          └─> PullRequestBodyService.filter(…)(heading: string): boolean [projects/compliance/src/modules/pull-request/pull-request-body.service.ts:221]
            └─> PullRequestBodyService.cleanSectionContent(content: string): string [projects/compliance/src/modules/pull-request/pull-request-body.service.ts:76]
               ↳ Cleans section text by removing HTML comments and empty markdown list markers.
              └─> PullRequestBodyService.filter(…)(line: string): boolean [projects/compliance/src/modules/pull-request/pull-request-body.service.ts:82]
```

<details>
<summary>2 more call stacks</summary>

**4. `OrganizationProjectCommand.run`** — depth 4 · decorated-method

```text
🚀 OrganizationProjectCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/organization-project/organization-project.command.ts:163]
   ↳ Adds missing repository issues and pull requests, leaving existing items untouched.
  └─> OrganizationProjectCommand.readRepositoryResourceUrls(resource: "issue" | "pr"): readonly string[] [projects/compliance/src/modules/organization-project/organization-project.command.ts:131]
     ↳ Lists repository issue or pull request URLs.
    └─> OrganizationProjectCommand.readJson(…): T [projects/compliance/src/modules/organization-project/organization-project.command.ts:101]
       ↳ Validates JSON returned by a GitHub CLI read command.
      └─> PullRequestGithubService.run(commandArguments: readonly string[]): GithubCliResult [projects/compliance/src/modules/pull-request/pull-request-github.service.ts:58]
         ↳ Invokes `gh` with these arguments, capturing each stream on its own.
```

**5. `PullRequestGithubService.isAvailable`** — depth 2 · orphan-root

```text
🚀 PullRequestGithubService.isAvailable(): boolean [projects/compliance/src/modules/pull-request/pull-request-github.service.ts:53]
   ↳ Whether the `gh` binary can be executed at all.
  └─> PullRequestGithubService.run(commandArguments: readonly string[]): GithubCliResult [projects/compliance/src/modules/pull-request/pull-request-github.service.ts:58]
     ↳ Invokes `gh` with these arguments, capturing each stream on its own.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `IssueAuditService.auditOne` | 9 | `IssueGithubService.isAvailable`, `IssueAuditService.fail`, `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueMetadataService.resolveFromDocument`, `IssueMetadataService.checkMetadata`, `IssueMetadataService.parseFormAnswers`, `IssueAuditService.map(…)`, `IssueAuditService.map(…)` | `projects/compliance/src/modules/issue/issue-audit.service.ts:67` |
| `PullRequestCommand.run` | 9 | `PullRequestCommand.begin`, `PullRequestAncestorIssuesService.link`, `PullRequestLabelVocabularyService.reconcile`, `PullRequestCommand.load`, `PullRequestReportService.compose`, `PullRequestValidationService.validate`, `PullRequestCommand.flatMap(…)`, `PullRequestCommand.flatMap(…)`, `PullRequestReportService.publish` | `projects/compliance/src/modules/pull-request/pull-request.command.ts:95` |
| `IssueCommand.run` | 7 | `IssuePlanService.resolve`, `IssueCommand.prepare`, `IssueAuditService.auditOne`, `IssueAssigningService.assignAll`, `IssueAuditService.auditAll`, `IssueReportService.compose`, `IssueReportService.publish` | `projects/compliance/src/modules/issue/issue.command.ts:90` |

<details>
<summary>128 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PullRequestAncestorIssuesService.link` | 6 | `PullRequestAncestorIssuesService.readLinked`, `PullRequestAncestorIssuesService.unchanged`, `PullRequestAncestorIssuesService.collectAncestors`, `PullRequestDescendantIssuesService.collect`, `PullRequestAncestorIssuesService.writeReferences`, `PullRequestAncestorIssuesService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:264` |
| `PullRequestLabelsService.planReconciliation` | 6 | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels.service.ts:66` |
| `PullRequestValidationService.checkSignificance` | 6 | `PullRequestReleaseSignificanceService.parseConventionalSubject`, `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestReleaseSignificanceService.resolveFromDocument`, `PullRequestReleaseSignificanceService.checkSignificance`, `PullRequestReleaseSignificanceService.readReleaseRules` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:161` |
| `PullRequestValidationService.validate` | 6 | `PullRequestValidationService.checkTitle`, `PullRequestValidationService.checkBody`, `PullRequestValidationService.checkMetadata`, `PullRequestValidationService.checkSignificance`, `PullRequestValidationService.checkLinkedIssue`, `PullRequestAncestorIssuesService.verify` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:278` |
| `IssueMetadataService.checkBulkIssues` | 5 | `IssueMetadataService.parseFormAnswers`, `IssueMetadataService.checkMetadata`, `IssueMetadataTypeService.readFromSummary`, `IssueMetadataService.map(…)`, `IssueMetadataService.checkHierarchy` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:282` |
| `IssueMetadataService.checkMetadata` | 5 | `IssueMetadataService.groupLabels`, `IssueMetadataService.checkTypeLabel`, `IssueMetadataService.checkScopeLabels`, `IssueMetadataService.checkSourceLabel`, `IssueMetadataTypeService.check` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:366` |
| `IssueAuditService.auditAll` | 5 | `IssueGithubService.isAvailable`, `IssueAuditService.fail`, `IssueGithubService.listOpenIssues`, `IssueMetadataService.checkBulkIssues`, `IssueAuditService.map(…)` | `projects/compliance/src/modules/issue/issue-audit.service.ts:32` |
| `PullRequestBodyLinksService.addRelatedIssueReferences` | 5 | `PullRequestBodyLinksService.findIndex(…)`, `PullRequestBodyLinksService.readExistingIssueNumbers`, `PullRequestBodyLinksService.filter(…)`, `PullRequestBodyLinksService.insertReferences`, `PullRequestBodyLinksService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-body-links.service.ts:60` |
| `PullRequestAncestorIssuesService.writeReferences` | 5 | `PullRequestBodyLinksService.addRelatedIssueReferences`, `PullRequestAncestorIssuesService.unchanged`, `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestAncestorIssuesService.format` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:188` |
| `PullRequestAncestorIssuesService.verify` | 5 | `PullRequestAncestorIssuesService.readLinked`, `PullRequestAncestorIssuesService.collectAncestors`, `PullRequestAncestorIssuesService.map(…)`, `PullRequestAncestorIssuesService.filter(…)`, `PullRequestAncestorIssuesService.format` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:303` |
| `PullRequestBodyService.checkBody` | 5 | `PullRequestBodyService.findEmptySections`, `PullRequestBodyService.findMalformedSections`, `PullRequestBodyService.findMissingHeadings`, `PullRequestBodyService.findOversizedSections`, `PullRequestBodyService.findUnfilledComments` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:197` |
| `PullRequestLabelVocabularyService.plan` | 5 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestLabelsService.planReconciliation`, `PullRequestLabelsService.parseRepositoryLabels`, `PullRequestLabelsService.readExpectedLabels` | `projects/compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:72` |
| `PullRequestLabelsAssigneesService.checkMetadata` | 5 | `PullRequestLabelsAssigneesService.groupLabels`, `PullRequestLabelsAssigneesService.checkTypeLabel`, `PullRequestLabelsAssigneesService.checkScopeLabels`, `PullRequestLabelsAssigneesService.record`, `PullRequestLabelsAssigneesService.checkSourceLabel` | `projects/compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:163` |
| `PullRequestReleaseSignificanceService.checkSignificance` | 5 | `PullRequestReleaseSignificanceService.significanceRank`, `PullRequestReleaseSignificanceService.findMostSignificantCommit`, `PullRequestReleaseSignificanceService.findMissingScopes`, `PullRequestReleaseSignificanceService.describeSignificanceFailure`, `PullRequestReleaseSignificanceService.describeMissingScopeFailures` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:199` |
| `OrganizationProjectCommand.run` | 5 | `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.readRepositoryResourceUrls`, `OrganizationProjectCommand.readExistingProjectResourceUrls`, `OrganizationProjectCommand.filter(…)`, `OrganizationProjectCommand.addProjectItem` | `projects/compliance/src/modules/organization-project/organization-project.command.ts:163` |
| `IssueGithubService.listUnassignedOpenIssueNumbers` | 4 | `IssueGithubService.run`, `IssueGithubService.describeFailure`, `IssueGithubService.map(…)`, `IssueGithubService.filter(…)` | `projects/compliance/src/modules/issue/issue-github.service.ts:117` |
| `IssueAssigningService.assignAll` | 4 | `IssueGithubService.listUnassignedOpenIssueNumbers`, `IssueAssigningService.map(…)`, `IssueAssigningService.flatMap(…)`, `IssueAssigningService.flatMap(…)` | `projects/compliance/src/modules/issue/issue-assigning.service.ts:42` |
| `IssueMetadataService.resolveFromDocument` | 4 | `IssueMetadataService.describeError`, `IssueMetadataService.isRecord`, `IssueMetadataTypeService.readFromDocument`, `IssueMetadataService.readLabelNames` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:435` |
| `IssueLabelingService.label` | 4 | `IssueLabelsService.missingLabels`, `IssueLabelsService.parseFormAnswers`, `IssueGithubService.isAvailable`, `IssueLabelingService.map(…)` | `projects/compliance/src/modules/issue/issue-labeling.service.ts:29` |
| `IssuePlanService.resolve` | 4 | `IssuePlanService.filter(…)`, `IssuePlanService.filter(…)`, `IssuePlanService.readLabelNames`, `IssuePlanService.hasNoAssignee` | `projects/compliance/src/modules/issue/issue-plan.service.ts:66` |
| `PullRequestLabelVocabularyService.reconcile` | 4 | `PullRequestLabelVocabularyService.plan`, `PullRequestLabelVocabularyService.map(…)`, `PullRequestLabelVocabularyService.apply`, `PullRequestLabelVocabularyService.describePlan` | `projects/compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:101` |
| `PullRequestReportService.compose` | 4 | `PullRequestReportService.map(…)`, `PullRequestReportService.map(…)`, `PullRequestReportService.reduce(…)`, `PullRequestReportService.flatMap(…)` | `projects/compliance/src/modules/pull-request/pull-request-report.service.ts:49` |
| `PullRequestCommand.begin` | 4 | `PullRequestContextService.resolveInvocation`, `PullRequestCommand.abort`, `PullRequestCommand.load`, `PullRequestContextService.writeStepOutputs` | `projects/compliance/src/modules/pull-request/pull-request.command.ts:59` |
| `AuditGovernanceService.auditWorkflowContent` | 3 | `AuditGovernanceService.some(…)`, `AuditGovernanceService.some(…)`, `AuditGovernanceService.collectWorkflowJobViolations` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:57` |
| `AuditGovernanceCommand.run` | 3 | `AuditGovernanceService.checkGovernance`, `AuditGovernanceCommand.reportCodeownersVerdict`, `AuditGovernanceCommand.reportWorkflowsVerdict` | `projects/compliance/src/modules/audit-governance/audit-governance.command.ts:77` |
| `IssueMetadataService.checkReleaseSignificanceViolation` | 3 | `IssueMetadataService.resolveIssueReleaseLevel`, `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:47` |
| `IssueMetadataService.checkTypeLabel` | 3 | `IssueMetadataService.checkTypeLabelPresence`, `IssueMetadataService.map(…)`, `IssueMetadataService.filter(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:131` |
| `IssueMetadataService.checkHierarchy` | 3 | `IssueMetadataService.extractParentIssueNumber`, `IssueMetadataService.checkReleaseSignificanceViolation`, `IssueMetadataService.computeHierarchyDepth` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:325` |
| `IssueMetadataService.groupLabels` | 3 | `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:409` |
| `IssueReportService.compose` | 3 | `IssueReportService.filter(…)`, `IssueReportService.reduce(…)`, `IssueReportService.flatMap(…)` | `projects/compliance/src/modules/issue/issue-report.service.ts:28` |
| `PullRequestBodyService.holdsShape` | 3 | `PullRequestBodyService.every(…)`, `PullRequestBodyService.filter(…)`, `PullRequestBodyService.bulletMarkersOf` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:102` |
| `PullRequestBodyService.findMalformedSections` | 3 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:234` |
| `PullRequestBodyService.filter(…)` | 3 | `PullRequestBodyService.cleanSectionContent`, `PullRequestBodyService.holdsShape`, `PullRequestBodyService.parseBlocks` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:237` |
| `PullRequestContextService.fetch` | 3 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure`, `PullRequestContextService.parseContext` | `projects/compliance/src/modules/pull-request/pull-request-context.service.ts:87` |
| `PullRequestLabelsAssigneesService.groupLabels` | 3 | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:204` |
| `PullRequestValidationService.checkBody` | 3 | `PullRequestValidationService.describeBodyVerdict`, `PullRequestBodyService.checkBody`, `PullRequestBodyService.extractTemplateComments` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:50` |
| `OrganizationProjectCommand.addProjectItem` | 3 | `PullRequestGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestGithubService.describeFailure` | `projects/compliance/src/modules/organization-project/organization-project.command.ts:44` |
| `OrganizationProjectCommand.readExistingProjectResourceUrls` | 3 | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.flatMap(…)` | `projects/compliance/src/modules/organization-project/organization-project.command.ts:70` |
| `OrganizationProjectCommand.readJson` | 3 | `PullRequestGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestGithubService.describeFailure` | `projects/compliance/src/modules/organization-project/organization-project.command.ts:101` |
| `OrganizationProjectCommand.readRepositoryResourceUrls` | 3 | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.map(…)` | `projects/compliance/src/modules/organization-project/organization-project.command.ts:131` |
| `AuditGovernanceService.collectWorkflowJobViolations` | 2 | `AuditGovernanceService.extractJobBlocks`, `AuditGovernanceService.evaluateJob` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:84` |
| `AuditGovernanceService.extractJobBlocks` | 2 | `AuditGovernanceService.sliceJobsSection`, `AuditGovernanceService.applyJobLine` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:142` |
| `AuditGovernanceService.parseCodeownersRule` | 2 | `AuditGovernanceService.map(…)`, `AuditGovernanceService.filter(…)` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:193` |
| `AuditGovernanceService.checkCodeowners` | 2 | `AuditGovernanceService.find(…)`, `AuditGovernanceService.parseCodeownersLines` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:230` |
| `AuditGovernanceService.checkGovernance` | 2 | `AuditGovernanceService.checkCodeowners`, `AuditGovernanceService.checkWorkflows` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:272` |
| `AuditGovernanceService.checkWorkflows` | 2 | `AuditGovernanceService.filter(…)`, `AuditGovernanceService.auditWorkflowContent` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:286` |
| `IssueGithubService.listOpenIssues` | 2 | `IssueGithubService.run`, `IssueGithubService.describeFailure` | `projects/compliance/src/modules/issue/issue-github.service.ts:88` |
| `IssueAssigningService.assign` | 2 | `IssueGithubService.assignIssue`, `IssueGithubService.describeFailure` | `projects/compliance/src/modules/issue/issue-assigning.service.ts:24` |
| `IssueMetadataTypeService.check` | 2 | `IssueMetadataTypeService.checkSubIssue`, `IssueMetadataTypeService.checkRoot` | `projects/compliance/src/modules/issue/issue-metadata-type.service.ts:82` |
| `IssueMetadataTypeService.readFromDocument` | 2 | `IssueMetadataTypeService.isRecord`, `IssueMetadataTypeService.hasBodyParent` | `projects/compliance/src/modules/issue/issue-metadata-type.service.ts:101` |
| `IssueMetadataService.checkSourceLabel` | 2 | `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:100` |
| `IssueMetadataService.readLabelNames` | 2 | `IssueMetadataService.filter(…)`, `IssueMetadataService.map(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:244` |
| `IssueMetadataService.resolveIssueReleaseLevel` | 2 | `IssueMetadataService.hasBreakingMarker`, `IssueMetadataService.resolveStandardReleaseLevel` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:463` |
| `IssueLabelsService.missingLabels` | 2 | `IssueLabelsService.filter(…)`, `IssueLabelsService.labelsFromAnswers` | `projects/compliance/src/modules/issue/issue-labels.service.ts:77` |
| `IssueLabelingService.map(…)` | 2 | `IssueGithubService.addLabel`, `IssueGithubService.describeFailure` | `projects/compliance/src/modules/issue/issue-labeling.service.ts:47` |
| `IssueCommand.prepare` | 2 | `IssueLabelingService.label`, `IssueAssigningService.assign` | `projects/compliance/src/modules/issue/issue.command.ts:53` |
| `PullRequestDescendantIssuesService.readChildren` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `projects/compliance/src/modules/pull-request/pull-request-descendant-issues.service.ts:23` |
| `PullRequestAncestorIssuesService.readJson` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:108` |
| `PullRequestAncestorIssuesService.readLinked` | 2 | `PullRequestAncestorIssuesService.readJson(…)`, `PullRequestAncestorIssuesService.readJson` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:136` |
| `PullRequestAncestorIssuesService.readParent` | 2 | `PullRequestAncestorIssuesService.readJson(…)`, `PullRequestAncestorIssuesService.readJson` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:153` |
| `PullRequestBodyService.cleanSectionContent` | 2 | `PullRequestBodyService.filter(…)`, `PullRequestBodyService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:76` |
| `PullRequestBodyService.findEmptySections` | 2 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:218` |
| `PullRequestBodyService.findMissingHeadings` | 2 | `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:256` |
| `PullRequestBodyService.findOversizedSections` | 2 | `PullRequestBodyService.splitSections`, `PullRequestBodyService.flatMap(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:263` |
| `PullRequestLabelsService.readExpectedLabels` | 2 | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels.service.ts:106` |
| `PullRequestLabelVocabularyService.map(…)` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `projects/compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:39` |
| `PullRequestLabelVocabularyService.describePlan` | 2 | `PullRequestLabelVocabularyService.map(…)`, `PullRequestLabelVocabularyService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:57` |
| `PullRequestLabelsAssigneesService.checkSourceLabel` | 2 | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:92` |
| `PullRequestLabelsAssigneesService.checkTypeLabel` | 2 | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:123` |
| `PullRequestLabelsAssigneesService.parseTitle` | 2 | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels-assignees.service.ts:226` |
| `PullRequestReleaseSignificanceService.describeSignificanceFailure` | 2 | `PullRequestReleaseSignificanceService.releaseLevelName`, `PullRequestReleaseSignificanceService.find(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:61` |
| `PullRequestReleaseSignificanceService.readRawCommit` | 2 | `PullRequestReleaseSignificanceService.isRecord`, `PullRequestReleaseSignificanceService.parseConventionalSubject` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:148` |
| `PullRequestReleaseSignificanceService.parseConventionalSubject` | 2 | `PullRequestReleaseSignificanceService.filter(…)`, `PullRequestReleaseSignificanceService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:244` |
| `PullRequestReleaseSignificanceService.resolveFromDocument` | 2 | `PullRequestReleaseSignificanceService.describeError`, `PullRequestReleaseSignificanceService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:300` |
| `PullRequestReleaseSignificanceService.significanceRank` | 2 | `PullRequestReleaseSignificanceService.find(…)`, `PullRequestReleaseSignificanceService.rankOfRelease` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:331` |
| `PullRequestReportService.describeOutcome` | 2 | `PullRequestReportService.map(…)`, `PullRequestReportService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-report.service.ts:26` |
| `PullRequestTitleService.check` | 2 | `PullRequestTitleService.filter(…)`, `PullRequestTitleService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-title.service.ts:23` |
| `PullRequestValidationService.checkLinkedIssue` | 2 | `PullRequestGithubService.run`, `PullRequestGithubService.describeFailure` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:78` |
| `PullRequestValidationService.checkMetadata` | 2 | `PullRequestLabelsAssigneesService.parseTitle`, `PullRequestLabelsAssigneesService.checkMetadata` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:128` |
| `PullRequestValidationService.describeBodyVerdict` | 2 | `PullRequestValidationService.listHeadings`, `PullRequestValidationService.listItems` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:237` |
| `PullRequestCommand.load` | 2 | `PullRequestContextService.fetch`, `PullRequestCommand.abort` | `projects/compliance/src/modules/pull-request/pull-request.command.ts:86` |
| `AuditGovernanceService.parseCodeownersLines` | 1 | `AuditGovernanceService.parseCodeownersRule` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:172` |
| `AuditGovernanceService.sliceJobsSection` | 1 | `AuditGovernanceService.findIndex(…)` | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:221` |
| `IssueGithubService.addLabel` | 1 | `IssueGithubService.run` | `projects/compliance/src/modules/issue/issue-github.service.ts:53` |
| `IssueGithubService.assignIssue` | 1 | `IssueGithubService.run` | `projects/compliance/src/modules/issue/issue-github.service.ts:58` |
| `IssueGithubService.describeFailure` | 1 | `IssueGithubService.filter(…)` | `projects/compliance/src/modules/issue/issue-github.service.ts:74` |
| `IssueGithubService.isAvailable` | 1 | `IssueGithubService.run` | `projects/compliance/src/modules/issue/issue-github.service.ts:83` |
| `IssueAssigningService.map(…)` | 1 | `IssueAssigningService.assign` | `projects/compliance/src/modules/issue/issue-assigning.service.ts:51` |
| `IssueMetadataTypeService.checkRoot` | 1 | `IssueMetadataTypeService.map(…)` | `projects/compliance/src/modules/issue/issue-metadata-type.service.ts:32` |
| `IssueMetadataTypeService.readFromSummary` | 1 | `IssueMetadataTypeService.hasBodyParent` | `projects/compliance/src/modules/issue/issue-metadata-type.service.ts:121` |
| `IssueMetadataService.checkTypeLabelPresence` | 1 | `IssueMetadataService.map(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:166` |
| `IssueMetadataService.computeHierarchyDepth` | 1 | `IssueMetadataService.extractParentIssueNumber` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:186` |
| `IssueMetadataService.map(…)` | 1 | `IssueMetadataService.isRecord` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:246` |
| `IssueMetadataService.resolveStandardReleaseLevel` | 1 | `IssueMetadataService.find(…)` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:260` |
| `IssueMetadataService.parseFormAnswers` | 1 | `IssueMetadataService.extractFormField` | `projects/compliance/src/modules/issue/issue-metadata.service.ts:424` |
| `IssueLabelsService.parseFormAnswers` | 1 | `IssueLabelsService.extractFormField` | `projects/compliance/src/modules/issue/issue-labels.service.ts:90` |
| `IssuePlanService.readLabelNames` | 1 | `IssuePlanService.map(…)` | `projects/compliance/src/modules/issue/issue-plan.service.ts:49` |
| `PullRequestBodyLinksService.readExistingIssueNumbers` | 1 | `PullRequestBodyLinksService.flatMap(…)` | `projects/compliance/src/modules/pull-request/pull-request-body-links.service.ts:38` |
| `PullRequestBodyLinksService.flatMap(…)` | 1 | `PullRequestBodyLinksService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-body-links.service.ts:46` |
| `PullRequestGithubService.isAvailable` | 1 | `PullRequestGithubService.run` | `projects/compliance/src/modules/pull-request/pull-request-github.service.ts:53` |
| `PullRequestDescendantIssuesService.collect` | 1 | `PullRequestDescendantIssuesService.readChildren` | `projects/compliance/src/modules/pull-request/pull-request-descendant-issues.service.ts:63` |
| `PullRequestAncestorIssuesService.climb` | 1 | `PullRequestAncestorIssuesService.readParent` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:46` |
| `PullRequestAncestorIssuesService.collectAncestors` | 1 | `PullRequestAncestorIssuesService.climb` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:79` |
| `PullRequestAncestorIssuesService.format` | 1 | `PullRequestAncestorIssuesService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:103` |
| `PullRequestAncestorIssuesService.readJson(…)` | 1 | `IssueMetadataService.extractParentIssueNumber` | `projects/compliance/src/modules/pull-request/pull-request-ancestor-issues.service.ts:166` |
| `PullRequestBodyService.countWords` | 1 | `PullRequestBodyService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:88` |
| `PullRequestBodyService.parseBlocks` | 1 | `PullRequestBodyService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:149` |
| `PullRequestBodyService.splitSections` | 1 | `PullRequestBodyService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:172` |
| `PullRequestBodyService.extractTemplateComments` | 1 | `PullRequestBodyService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:211` |
| `PullRequestBodyService.filter(…)` | 1 | `PullRequestBodyService.cleanSectionContent` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:221` |
| `PullRequestBodyService.flatMap(…)` | 1 | `PullRequestBodyService.countWords` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:266` |
| `PullRequestBodyService.findUnfilledComments` | 1 | `PullRequestBodyService.filter(…)` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:284` |
| `PullRequestBodyService.filter(…)` | 1 | `PullRequestBodyService.prefixOf` | `projects/compliance/src/modules/pull-request/pull-request-body.service.ts:290` |
| `PullRequestLabelsService.isTrackedLabel` | 1 | `PullRequestLabelsService.some(…)` | `projects/compliance/src/modules/pull-request/pull-request-labels.service.ts:45` |
| `PullRequestLabelsService.filter(…)` | 1 | `PullRequestLabelsService.isTrackedLabel` | `projects/compliance/src/modules/pull-request/pull-request-labels.service.ts:82` |
| `PullRequestLabelVocabularyService.apply` | 1 | `PullRequestLabelVocabularyService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-label-vocabulary.service.ts:35` |
| `PullRequestReleaseSignificanceService.describeMissingScopeFailures` | 1 | `PullRequestReleaseSignificanceService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:51` |
| `PullRequestReleaseSignificanceService.findMissingScopes` | 1 | `PullRequestReleaseSignificanceService.some(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:84` |
| `PullRequestReleaseSignificanceService.findMostSignificantCommit` | 1 | `PullRequestReleaseSignificanceService.significanceRank` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:114` |
| `PullRequestReleaseSignificanceService.releaseLevelName` | 1 | `PullRequestReleaseSignificanceService.find(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:167` |
| `PullRequestReleaseSignificanceService.readReleaseRules` | 1 | `PullRequestReleaseSignificanceService.find(…)` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:278` |
| `PullRequestReleaseSignificanceService.map(…)` | 1 | `PullRequestReleaseSignificanceService.readRawCommit` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:319` |
| `PullRequestReleaseSignificanceService.find(…)` | 1 | `PullRequestReleaseSignificanceService.ruleMatches` | `projects/compliance/src/modules/pull-request/pull-request-release-significance.service.ts:335` |
| `PullRequestReportService.map(…)` | 1 | `PullRequestReportService.describeOutcome` | `projects/compliance/src/modules/pull-request/pull-request-report.service.ts:63` |
| `PullRequestValidationService.checkTitle` | 1 | `PullRequestTitleService.check` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:227` |
| `PullRequestValidationService.listHeadings` | 1 | `PullRequestValidationService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:256` |
| `PullRequestValidationService.listItems` | 1 | `PullRequestValidationService.map(…)` | `projects/compliance/src/modules/pull-request/pull-request-validation.service.ts:261` |
| `PullRequestCommand.abort` | 1 | `PullRequestReportService.publish` | `projects/compliance/src/modules/pull-request/pull-request.command.ts:52` |

</details>
<!-- callidescope:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-12408-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-380.38_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-7-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-97-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-97-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-37-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-1-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-37-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-251-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-29-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-16-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-32-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-617-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-269-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-822-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-64-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-548-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-382-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-174-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-404-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-734-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-3-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-135-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-37-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-8-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-93-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-65-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-8-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-23-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-119-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-5-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-23-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-4-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-15-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-12-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-28-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-0-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-268-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-7-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-15-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-56-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-7-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-32-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-2-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-10-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-9-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-13-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-88-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run compliance:coinagerie-check:write`.

- **breadth**:
- **bullet**:
- **climb**:
- **contract**: What the pull request template's headings promise a body must contain; `pull-request-body.constants.ts` reads them from here so a template edit that dropped one fails the check.
- **convention**:
- **creation**:
- **descendant**:
- **governance**:
- **mention**:
- **organization**:
- **reconcile**:
- **reconciliation**:
- **significance**:
- **significant**:
- **splice**:
- **surplus**:
- **unassigned**:
- **unchanged**:
- **verb**:
- **vocabulary**:

<!-- coinagerie:end -->
