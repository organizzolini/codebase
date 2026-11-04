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

| Measure                  | Value |
| ------------------------ | ----- |
| Callables                | 323   |
| Files                    | 67    |
| Calls traced             | 435   |
| Call stacks              | 11    |
| Deepest stack            | 8     |
| Stacks through recursion | 0     |
| Unfollowable calls       | 23    |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit            | Value |
| ---------------- | ----- |
| `maximumDepth`   | 8     |
| `maximumBreadth` | 9     |

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

**2. `IssueMetadataCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 IssueMetadataCommand.run(…): Promise<void> [projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:308]
   ↳ Checks the issue's metadata and exits 0 or 1 on the verdict.
  └─> IssueMetadataCommand.runBulkAudit(reportLines: string[]): never | void [projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:257]
     ↳ Sweeps and validates all open issues and their hierarchy relationships.
    └─> IssueMetadataService.checkBulkIssues(issues: readonly IssueSummary[]): BulkIssuesVerdict [projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:282]
       ↳ Validates metadata and hierarchy across a batch of open issues.
      └─> IssueMetadataService.checkHierarchy(issues: readonly IssueSummary[]): readonly HierarchyViolation[] [projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:325]
         ↳ Checks issue hierarchy rules (release significance and max depth 3).
        └─> IssueMetadataService.checkReleaseSignificanceViolation(…): void [projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:47]
           ↳ Checks if a sub-issue exceeds its parent's release level.
          └─> IssueMetadataService.resolveIssueReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:495]
             ↳ Resolves release level and rank from title, body, and labels.
            └─> IssueMetadataService.resolveStandardReleaseLevel(…): { readonly level: string; readonly rank: number; readonly type: string; } [projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:260]
               ↳ Resolves non-breaking release level from type labels or title match.
              └─> IssueMetadataService.find(…)(name: string): boolean [projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:264]
```

**3. `PullRequestLabelsAssigneesCommand.run`** — depth ≥ 8 · decorated-method

```text
🚀 PullRequestLabelsAssigneesCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:264]
   ↳ Checks the pull request's metadata and exits 0 or 1 on the verdict.
  └─> PullRequestLabelsAssigneesCommand.resolveMetadata(…): PullRequestLabelsAssigneesResolution [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:214]
     ↳ Reads the metadata from wherever this invocation says it lives.
    └─> PullRequestLabelsAssigneesCommand.readEnvironmentMetadata(reportLines: string[]): PullRequestLabelsAssigneesResolution [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:132]
       ↳ Reads the metadata from the environment, the workflow mode.
      └─> PullRequestLabelsAssigneesService.resolveFromEnvironment(…): PullRequestLabelsAssigneesResolution [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:332]
         ↳ Reads the metadata out of the three environment documents.
        └─> PullRequestLabelsAssigneesService.readNames(entries: unknown[], propertyName: string): string[] [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:199]
           ↳ Every entry's name, with the nameless ones dropped.
          └─> PullRequestLabelsAssigneesService.map(…)(entry: unknown): string [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:201]
            └─> PullRequestLabelsAssigneesService.nameOf(entry: unknown, propertyName: string): string [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:162]
               ↳ Reads one label or assignee entry, whichever shape it arrived in.
              └─> PullRequestLabelsAssigneesService.isRecord(value: unknown): value is Record<string, unknown> [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:157]
                 ↳ Whether this value can be read by property name at all.
```

<details>
<summary>8 more call stacks</summary>

**4. `PullRequestBodyCommand.run`** — depth 8 · decorated-method

```text
🚀 PullRequestBodyCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request-body/pull-request-body.command.ts:143]
   ↳ Checks the description and exits 0 or 1 on the verdict.
  └─> PullRequestBodyService.checkBody(…): BodyVerdict [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:204]
     ↳ The five lists of failures, from one description and the template's prompts.
    └─> PullRequestBodyService.findMalformedSections(body: string): string[] [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:241]
       ↳ Every section holding a block its shape does not allow.
      └─> PullRequestBodyService.filter(…)(rule: SectionRule): boolean [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:244]
        └─> PullRequestBodyService.holdsShape(…): boolean [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:100]
           ↳ Whether a section's blocks have the shape its rule allows.
          └─> PullRequestBodyService.isDashList(block: RootContent | undefined, content: string): boolean [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:132]
             ↳ Whether a list block is unordered with every item marked by `-`.
            └─> PullRequestBodyService.every(…)(item: ListItem): boolean [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:136]
              └─> PullRequestBodyService.sourceOf(node: Node, content: string): string [projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:171]
                 ↳ The markdown a parsed node was read from, exactly as written.
```

**5. `IssueLabelsCommand.run`** — depth 7 · decorated-method

```text
🚀 IssueLabelsCommand.run(): Promise<void> [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:155]
   ↳ Adds whichever type and scope labels the issue's body implies.
  └─> IssueLabelsCommand.resolvePlan(): undefined | { issueNumber: string; missingLabels: string[]; } [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:127]
     ↳ What this run needs to do, or `undefined` when there is nothing to add.
    └─> IssueLabelsCommand.readExistingLabelNames(): string[] [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:91]
       ↳ Reads the labels already on the issue, from `ISSUE_LABELS`.
      └─> IssueLabelsCommand.readLabelNames(entries: unknown[]): string[] [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:115]
         ↳ Every label name in this array, with the nameless entries dropped.
        └─> IssueLabelsCommand.map(…)(entry: unknown): string [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:117]
          └─> IssueLabelsCommand.nameOf(entry: unknown): string [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:79]
             ↳ Reads one label entry's name, whichever shape it arrived in.
            └─> IssueLabelsCommand.isRecord(value: unknown): value is Record<string, unknown> [projects/compliance/src/modules/issue-labels/issue-labels.command.ts:74]
               ↳ Whether this value can be read by property name at all.
```

**6. `PullRequestLabelsCommand.run`** — depth 7 · decorated-method

```text
🚀 PullRequestLabelsCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:287]
   ↳ Runs the pull-request-labels reconciliation in check or write mode.
  └─> PullRequestLabelsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:298]
     ↳ Reconciles the label vocabulary and always reports success.
    └─> PullRequestLabelsCommand.reconcile(mode: SynchronizationMode, reportLines: string[]): void [projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:164]
       ↳ Reconciles the vocabulary, appending everything it did to the report.
      └─> PullRequestLabelsService.planReconciliation(…): LabelReconciliationPlan [projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:66]
         ↳ Works out what reconciling would create, update, and leave behind.
        └─> PullRequestLabelsService.filter(…)(label: ConventionalLabel): boolean [projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:82]
          └─> PullRequestLabelsService.isTrackedLabel(labelName: string): boolean [projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:45]
             ↳ Whether this reconciliation owns the label with this name.
            └─> PullRequestLabelsService.some(…)(prefix: string): boolean [projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:46]
```

**7. `PullRequestParentLinksCommand.run`** — depth 7 · decorated-method

```text
🚀 PullRequestParentLinksCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:315]
   ↳ Runs the parent reference synchronization command.
  └─> PullRequestParentLinksCommand.synchronizeParentReferences(context: PullRequestParentLinksContext): void [projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:250]
     ↳ Reconciles the pull request body with every linked issue's parent chain.
    └─> PullRequestParentLinksCommand.readAncestorIssueNumbers(linkedIssueNumbers: readonly number[]): number[] [projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:137]
       ↳ Collects every ancestor once across all directly linked issues.
      └─> PullRequestParentLinksCommand.addIssueAncestors(…): void [projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:65]
         ↳ Adds the parent chain of one linked issue to the shared ancestor set.
        └─> PullRequestParentLinksCommand.readParentIssueNumber(issueNumber: number): number | undefined [projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:194]
           ↳ Reads an issue and returns its native or body-linked parent.
          └─> PullRequestLabelsAssigneesGithubService.describeFailure(result: GithubCliResult): string [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees-github.service.ts:47]
             ↳ Whatever `gh` said about why it could not do the thing.
            └─> PullRequestLabelsAssigneesGithubService.filter(…)(part: string): boolean [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees-github.service.ts:49]
```

**8. `PullRequestReleaseSignificanceCommand.run`** — depth 7 · decorated-method

```text
🚀 PullRequestReleaseSignificanceCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:212]
   ↳ Checks the pull request's title against its commits and exits 0 or 1.
  └─> PullRequestReleaseSignificanceCommand.readLivePullRequest(reportLines: string[], pullRequestNumber: string): PullRequestCommitsResolution [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:114]
     ↳ Reads the pull request's title and commits live, through `gh pr view`.
    └─> PullRequestReleaseSignificanceService.resolveFromDocument(documentText: string): PullRequestCommitsResolution [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:316]
       ↳ Reads the title and commits out of a `gh pr view` document.
      └─> PullRequestReleaseSignificanceService.map(…)(entry: unknown): PullRequestCommit [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:335]
        └─> PullRequestReleaseSignificanceService.readRawCommit(entry: unknown): PullRequestCommit [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:164]
           ↳ Reads one raw `commits` array entry into a `PullRequestCommit`.
          └─> PullRequestReleaseSignificanceService.parseConventionalSubject(subject: string, body?: string): ConventionalSubject | undefined [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:260]
             ↳ Reads the type, scopes, and breaking marker out of a conventional subject line.
            └─> PullRequestReleaseSignificanceService.filter(…)(scope: string): boolean [projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:276]
```

**9. `IssueAssigneesCommand.run`** — depth 5 · decorated-method

```text
🚀 IssueAssigneesCommand.run(…): Promise<void> [projects/compliance/src/modules/issue-assignees/issue-assignees.command.ts:89]
   ↳ Assigns one issue or sweeps based on the CLI input and GitHub event.
  └─> IssueAssigneesCommand.assignAll(): void [projects/compliance/src/modules/issue-assignees/issue-assignees.command.ts:36]
     ↳ Assigns the owner to every unassigned issue returned by the full sweep.
    └─> IssueAssigneesGithubService.listUnassignedOpenIssueNumbers(): ListUnassignedOpenIssueNumbersResult [projects/compliance/src/modules/issue-assignees/issue-assignees-github.service.ts:54]
       ↳ Lists unassigned issues from every open issues page, excluding PRs.
      └─> IssueAssigneesGithubService.describeFailure(result: GithubCliResult): string [projects/compliance/src/modules/issue-assignees/issue-assignees-github.service.ts:45]
         ↳ Describes the output of a failed `gh` invocation.
        └─> IssueAssigneesGithubService.filter(…)(part: string): boolean [projects/compliance/src/modules/issue-assignees/issue-assignees-github.service.ts:47]
```

**10. `OrganizationProjectCommand.run`** — depth 5 · decorated-method

```text
🚀 OrganizationProjectCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/organization-project/organization-project.command.ts:163]
   ↳ Adds missing repository issues and pull requests, leaving existing items untouched.
  └─> OrganizationProjectCommand.readRepositoryResourceUrls(resource: "issue" | "pr"): readonly string[] [projects/compliance/src/modules/organization-project/organization-project.command.ts:131]
     ↳ Lists repository issue or pull request URLs.
    └─> OrganizationProjectCommand.readJson(…): T [projects/compliance/src/modules/organization-project/organization-project.command.ts:101]
       ↳ Validates JSON returned by a GitHub CLI read command.
      └─> PullRequestLabelsAssigneesGithubService.describeFailure(result: GithubCliResult): string [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees-github.service.ts:47]
         ↳ Whatever `gh` said about why it could not do the thing.
        └─> PullRequestLabelsAssigneesGithubService.filter(…)(part: string): boolean [projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees-github.service.ts:49]
```

**11. `PullRequestTitleBodyCommand.run`** — depth 3 · decorated-method

```text
🚀 PullRequestTitleBodyCommand.run(passedParameters: string[]): Promise<void> [projects/compliance/src/modules/pull-request-title-body/pull-request-title-body.command.ts:130]
   ↳ Resolves live metadata and writes workflow outputs and files.
  └─> PullRequestTitleBodyCommand.resolvePullRequestNumber(): string [projects/compliance/src/modules/pull-request-title-body/pull-request-title-body.command.ts:54]
     ↳ Resolves the PR number from an event payload or the merge-queue ref.
    └─> PullRequestTitleBodyCommand.fail(message: string): never [projects/compliance/src/modules/pull-request-title-body/pull-request-title-body.command.ts:47]
       ↳ Exits with an actionable error instead of reporting a false success.
```

</details>

### Breadth

| Callable                                    | Breadth | Calls directly                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Location                                                                                                             |
| ------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `IssueMetadataCommand.run`                  | 9       | `IssueMetadataCommand.runBulkAudit`, `IssueMetadataCommand.resolveMetadata`, `IssueMetadataCommand.failWithMessage`, `IssueMetadataService.parseFormAnswers`, `IssueMetadataService.checkMetadata`, `IssueMetadataCommand.resolveIssueNumber`, `IssueMetadataCommand.reportFailures`, `IssueMetadataCommand.appendToReport`, `IssueMetadataCommand.mirrorToStepSummary`                                                                                                                                                                                    | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:308`                                       |
| `PullRequestLabelsCommand.reconcile`        | 9       | `PullRequestLabelsGithubService.run`, `PullRequestLabelsCommand.appendToReport`, `PullRequestLabelsGithubService.describeFailure`, `PullRequestLabelsService.planReconciliation`, `PullRequestLabelsService.parseRepositoryLabels`, `PullRequestLabelsService.readExpectedLabels`, `PullRequestLabelsCommand.describeError`, `PullRequestLabelsCommand.reportPlan`, `PullRequestLabelsCommand.reportStaleLabels`                                                                                                                                           | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:164`                             |
| `PullRequestReleaseSignificanceCommand.run` | 9       | `PullRequestReleaseSignificanceCommand.resolvePullRequestNumber`, `PullRequestReleaseSignificanceCommand.readLivePullRequest`, `PullRequestReleaseSignificanceCommand.failWithMessage`, `PullRequestReleaseSignificanceService.parseConventionalSubject`, `PullRequestReleaseSignificanceService.readReleaseRules`, `PullRequestReleaseSignificanceService.checkSignificance`, `PullRequestReleaseSignificanceCommand.reportFailures`, `PullRequestReleaseSignificanceCommand.appendToReport`, `PullRequestReleaseSignificanceCommand.mirrorToStepSummary` | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:212` |

<details>
<summary>155 more callables</summary>

| Callable                                                             | Breadth | Calls directly                                                                                                                                                                                                                                                                                                                                                                                                                             | Location                                                                                                                   |
| -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `PullRequestLabelsAssigneesCommand.run`                              | 8       | `PullRequestLabelsAssigneesCommand.resolveMetadata`, `PullRequestLabelsAssigneesCommand.failWithMessage`, `PullRequestLabelsAssigneesService.parseTitle`, `PullRequestLabelsAssigneesService.checkMetadata`, `PullRequestLabelsAssigneesCommand.resolvePullRequestNumber`, `PullRequestLabelsAssigneesCommand.reportFailures`, `PullRequestLabelsAssigneesCommand.appendToReport`, `PullRequestLabelsAssigneesCommand.mirrorToStepSummary` | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:264`               |
| `IssueMetadataCommand.runBulkAudit`                                  | 7       | `IssueMetadataGithubService.isAvailable`, `IssueMetadataCommand.failWithUsageError`, `IssueMetadataGithubService.listOpenIssues`, `IssueMetadataCommand.failWithMessage`, `IssueMetadataService.checkBulkIssues`, `IssueMetadataCommand.appendToReport`, `IssueMetadataCommand.mirrorToStepSummary`                                                                                                                                        | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:257`                                             |
| `PullRequestLabelsService.planReconciliation`                        | 6       | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.filter(…)`, `PullRequestLabelsService.filter(…)`                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:66`                                    |
| `IssueMetadataService.checkBulkIssues`                               | 5       | `IssueMetadataService.parseFormAnswers`, `IssueMetadataService.checkMetadata`, `IssueMetadataTypeService.readFromSummary`, `IssueMetadataService.map(…)`, `IssueMetadataService.checkHierarchy`                                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:282`                                             |
| `IssueMetadataService.checkMetadata`                                 | 5       | `IssueMetadataService.groupLabels`, `IssueMetadataService.checkTypeLabel`, `IssueMetadataService.checkScopeLabels`, `IssueMetadataService.checkSourceLabel`, `IssueMetadataTypeService.check`                                                                                                                                                                                                                                              | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:366`                                             |
| `IssueMetadataCommand.readLiveMetadata`                              | 5       | `IssueMetadataGithubService.isAvailable`, `IssueMetadataCommand.failWithUsageError`, `IssueMetadataGithubService.run`, `IssueMetadataGithubService.describeFailure`, `IssueMetadataService.resolveFromDocument`                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:153`                                             |
| `PullRequestLabelsAssigneesService.checkMetadata`                    | 5       | `PullRequestLabelsAssigneesService.groupLabels`, `PullRequestLabelsAssigneesService.checkTypeLabel`, `PullRequestLabelsAssigneesService.checkScopeLabels`, `PullRequestLabelsAssigneesService.record`, `PullRequestLabelsAssigneesService.checkSourceLabel`                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:213`               |
| `PullRequestLabelsAssigneesCommand.readLiveMetadata`                 | 5       | `PullRequestLabelsAssigneesGithubService.isAvailable`, `PullRequestLabelsAssigneesCommand.failWithUsageError`, `PullRequestLabelsAssigneesGithubService.run`, `PullRequestLabelsAssigneesGithubService.describeFailure`, `PullRequestLabelsAssigneesService.resolveFromDocument`                                                                                                                                                           | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:154`               |
| `OrganizationProjectCommand.run`                                     | 5       | `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.readRepositoryResourceUrls`, `OrganizationProjectCommand.readExistingProjectResourceUrls`, `OrganizationProjectCommand.filter(…)`, `OrganizationProjectCommand.addProjectItem`                                                                                                                                                                                              | `projects/compliance/src/modules/organization-project/organization-project.command.ts:163`                                 |
| `PullRequestBodyService.checkBody`                                   | 5       | `PullRequestBodyService.findEmptySections`, `PullRequestBodyService.findMalformedSections`, `PullRequestBodyService.findMissingHeadings`, `PullRequestBodyService.findOversizedSections`, `PullRequestBodyService.findUnfilledComments`                                                                                                                                                                                                    | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:204`                                       |
| `PullRequestBodyCommand.run`                                         | 5       | `PullRequestBodyCommand.resolveBody`, `PullRequestBodyService.checkBody`, `PullRequestBodyService.extractTemplateComments`, `PullRequestBodyCommand.every(…)`, `PullRequestBodyCommand.reportVerdict`                                                                                                                                                                                                                                      | `projects/compliance/src/modules/pull-request-body/pull-request-body.command.ts:143`                                       |
| `PullRequestParentLinksCommand.synchronizeParentReferences`          | 5       | `PullRequestParentLinksCommand.readLinkedIssueNumbers`, `PullRequestParentLinksCommand.readPullRequestBody`, `PullRequestParentLinksCommand.readAncestorIssueNumbers`, `PullRequestParentLinksCommand.addAncestorReferences`, `PullRequestParentLinksCommand.updatePullRequestBody`                                                                                                                                                        | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:250`                       |
| `PullRequestReleaseSignificanceService.checkSignificance`            | 5       | `PullRequestReleaseSignificanceService.significanceRank`, `PullRequestReleaseSignificanceService.findMostSignificantCommit`, `PullRequestReleaseSignificanceService.findMissingScopes`, `PullRequestReleaseSignificanceService.describeSignificanceFailure`, `PullRequestReleaseSignificanceService.describeMissingScopeFailures`                                                                                                          | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:215`       |
| `PullRequestReleaseSignificanceCommand.readLivePullRequest`          | 5       | `PullRequestReleaseSignificanceGithubService.isAvailable`, `PullRequestReleaseSignificanceCommand.failWithUsageError`, `PullRequestReleaseSignificanceGithubService.run`, `PullRequestReleaseSignificanceGithubService.describeFailure`, `PullRequestReleaseSignificanceService.resolveFromDocument`                                                                                                                                       | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:114`       |
| `PullRequestTitleBodyCommand.run`                                    | 5       | `PullRequestTitleBodyCommand.fail`, `PullRequestTitleBodyCommand.resolvePullRequestNumber`, `PullRequestLabelsAssigneesGithubService.run`, `PullRequestLabelsAssigneesGithubService.describeFailure`, `PullRequestTitleBodyCommand.writeContext`                                                                                                                                                                                           | `projects/compliance/src/modules/pull-request-title-body/pull-request-title-body.command.ts:130`                           |
| `IssueAssigneesGithubService.listUnassignedOpenIssueNumbers`         | 4       | `IssueAssigneesGithubService.run`, `IssueAssigneesGithubService.describeFailure`, `IssueAssigneesGithubService.map(…)`, `IssueAssigneesGithubService.filter(…)`                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-assignees/issue-assignees-github.service.ts:54`                                     |
| `IssueLabelsCommand.resolvePlan`                                     | 4       | `IssueLabelsCommand.readIssueNumber`, `IssueLabelsService.parseFormAnswers`, `IssueLabelsCommand.readExistingLabelNames`, `IssueLabelsService.missingLabels`                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:127`                                                 |
| `IssueMetadataService.resolveFromDocument`                           | 4       | `IssueMetadataService.describeError`, `IssueMetadataService.isRecord`, `IssueMetadataTypeService.readFromDocument`, `IssueMetadataService.readLabelNames`                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:435`                                             |
| `PullRequestLabelsCommand.reportPlan`                                | 4       | `PullRequestLabelsCommand.appendToReport`, `PullRequestLabelsCommand.describePlan`, `PullRequestLabelsCommand.createLabels`, `PullRequestLabelsCommand.updateLabels`                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:204`                                   |
| `PullRequestLabelsCommand.synchronize`                               | 4       | `PullRequestLabelsCommand.reconcile`, `PullRequestLabelsCommand.appendToReport`, `PullRequestLabelsCommand.describeError`, `PullRequestLabelsCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:298`                                   |
| `PullRequestParentLinksService.addRelatedIssueReferences`            | 4       | `PullRequestParentLinksService.findIndex(…)`, `PullRequestParentLinksService.readExistingIssueNumbers`, `PullRequestParentLinksService.filter(…)`, `PullRequestParentLinksService.insertReferences`                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.service.ts:61`                        |
| `PullRequestParentLinksCommand.readParentIssueNumber`                | 4       | `PullRequestLabelsAssigneesGithubService.run`, `PullRequestParentLinksCommand.fail`, `PullRequestLabelsAssigneesGithubService.describeFailure`, `PullRequestParentLinksCommand.parseParentIssueNumber`                                                                                                                                                                                                                                     | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:194`                       |
| `AuditGovernanceService.auditWorkflowContent`                        | 3       | `AuditGovernanceService.some(…)`, `AuditGovernanceService.some(…)`, `AuditGovernanceService.collectWorkflowJobViolations`                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:57`                                          |
| `AuditGovernanceCommand.run`                                         | 3       | `AuditGovernanceService.checkGovernance`, `AuditGovernanceCommand.reportCodeownersVerdict`, `AuditGovernanceCommand.reportWorkflowsVerdict`                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/audit-governance/audit-governance.command.ts:77`                                          |
| `IssueAssigneesCommand.assignAll`                                    | 3       | `IssueAssigneesGithubService.listUnassignedOpenIssueNumbers`, `IssueAssigneesCommand.fail`, `IssueAssigneesCommand.assignIssue`                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-assignees/issue-assignees.command.ts:36`                                            |
| `IssueAssigneesCommand.assignIssue`                                  | 3       | `IssueAssigneesGithubService.assignIssue`, `IssueAssigneesCommand.fail`, `IssueAssigneesGithubService.describeFailure`                                                                                                                                                                                                                                                                                                                     | `projects/compliance/src/modules/issue-assignees/issue-assignees.command.ts:56`                                            |
| `IssueAssigneesCommand.run`                                          | 3       | `IssueAssigneesCommand.fail`, `IssueAssigneesCommand.assignAll`, `IssueAssigneesCommand.assignIssue`                                                                                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/issue-assignees/issue-assignees.command.ts:89`                                            |
| `IssueLabelsCommand.run`                                             | 3       | `IssueLabelsCommand.resolvePlan`, `IssueLabelsGithubService.isAvailable`, `IssueLabelsCommand.addLabel`                                                                                                                                                                                                                                                                                                                                    | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:155`                                                 |
| `IssueMetadataService.checkReleaseSignificanceViolation`             | 3       | `IssueMetadataService.resolveIssueReleaseLevel`, `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)`                                                                                                                                                                                                                                                                                                                              | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:47`                                              |
| `IssueMetadataService.checkTypeLabel`                                | 3       | `IssueMetadataService.checkTypeLabelPresence`, `IssueMetadataService.map(…)`, `IssueMetadataService.filter(…)`                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:131`                                             |
| `IssueMetadataService.checkHierarchy`                                | 3       | `IssueMetadataService.extractParentIssueNumber`, `IssueMetadataService.checkReleaseSignificanceViolation`, `IssueMetadataService.computeHierarchyDepth`                                                                                                                                                                                                                                                                                    | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:325`                                             |
| `IssueMetadataService.groupLabels`                                   | 3       | `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)`, `IssueMetadataService.filter(…)`                                                                                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:409`                                             |
| `IssueMetadataCommand.resolveMetadata`                               | 3       | `IssueMetadataCommand.failWithUsageError`, `IssueMetadataCommand.readEnvironmentMetadata`, `IssueMetadataCommand.readLiveMetadata`                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:229`                                             |
| `PullRequestLabelsAssigneesService.groupLabels`                      | 3       | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.filter(…)`                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:254`               |
| `PullRequestLabelsAssigneesService.resolveFromDocument`              | 3       | `PullRequestLabelsAssigneesService.describeError`, `PullRequestLabelsAssigneesService.isRecord`, `PullRequestLabelsAssigneesService.readNames`                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:297`               |
| `PullRequestLabelsAssigneesCommand.resolveMetadata`                  | 3       | `PullRequestLabelsAssigneesCommand.failWithUsageError`, `PullRequestLabelsAssigneesCommand.readEnvironmentMetadata`, `PullRequestLabelsAssigneesCommand.readLiveMetadata`                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:214`               |
| `OrganizationProjectCommand.addProjectItem`                          | 3       | `PullRequestLabelsAssigneesGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestLabelsAssigneesGithubService.describeFailure`                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/organization-project/organization-project.command.ts:44`                                  |
| `OrganizationProjectCommand.readExistingProjectResourceUrls`         | 3       | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.flatMap(…)`                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/organization-project/organization-project.command.ts:70`                                  |
| `OrganizationProjectCommand.readJson`                                | 3       | `PullRequestLabelsAssigneesGithubService.run`, `OrganizationProjectCommand.fail`, `PullRequestLabelsAssigneesGithubService.describeFailure`                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/organization-project/organization-project.command.ts:101`                                 |
| `OrganizationProjectCommand.readRepositoryResourceUrls`              | 3       | `OrganizationProjectCommand.readJson`, `OrganizationProjectCommand.fail`, `OrganizationProjectCommand.map(…)`                                                                                                                                                                                                                                                                                                                              | `projects/compliance/src/modules/organization-project/organization-project.command.ts:131`                                 |
| `PullRequestBodyService.holdsShape`                                  | 3       | `PullRequestBodyService.isDashList`, `PullRequestBodyService.filter(…)`, `PullRequestBodyService.bulletMarkersOf`                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:100`                                       |
| `PullRequestBodyService.findMalformedSections`                       | 3       | `PullRequestBodyService.splitSections`, `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)`                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:241`                                       |
| `PullRequestBodyService.filter(…)`                                   | 3       | `PullRequestBodyService.cleanSectionContent`, `PullRequestBodyService.holdsShape`, `PullRequestBodyService.parseBlocks`                                                                                                                                                                                                                                                                                                                    | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:244`                                       |
| `PullRequestBodyCommand.reportVerdict`                               | 3       | `PullRequestBodyCommand.map(…)`, `PullRequestBodyCommand.map(…)`, `PullRequestBodyCommand.reportList`                                                                                                                                                                                                                                                                                                                                      | `projects/compliance/src/modules/pull-request-body/pull-request-body.command.ts:91`                                        |
| `PullRequestLabelsCommand.createLabels`                              | 3       | `PullRequestLabelsGithubService.run`, `PullRequestLabelsCommand.appendToReport`, `PullRequestLabelsGithubService.describeFailure`                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:74`                                    |
| `PullRequestLabelsCommand.updateLabels`                              | 3       | `PullRequestLabelsGithubService.run`, `PullRequestLabelsCommand.appendToReport`, `PullRequestLabelsGithubService.describeFailure`                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:257`                                   |
| `PullRequestParentLinksCommand.readLinkedIssueNumbers`               | 3       | `PullRequestLabelsAssigneesGithubService.run`, `PullRequestParentLinksCommand.fail`, `PullRequestLabelsAssigneesGithubService.describeFailure`                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:155`                       |
| `PullRequestParentLinksCommand.updatePullRequestBody`                | 3       | `PullRequestParentLinksCommand.fail`, `PullRequestLabelsAssigneesGithubService.run`, `PullRequestLabelsAssigneesGithubService.describeFailure`                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:280`                       |
| `AuditGovernanceService.collectWorkflowJobViolations`                | 2       | `AuditGovernanceService.extractJobBlocks`, `AuditGovernanceService.evaluateJob`                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:84`                                          |
| `AuditGovernanceService.extractJobBlocks`                            | 2       | `AuditGovernanceService.sliceJobsSection`, `AuditGovernanceService.applyJobLine`                                                                                                                                                                                                                                                                                                                                                           | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:142`                                         |
| `AuditGovernanceService.parseCodeownersRule`                         | 2       | `AuditGovernanceService.map(…)`, `AuditGovernanceService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:193`                                         |
| `AuditGovernanceService.checkCodeowners`                             | 2       | `AuditGovernanceService.find(…)`, `AuditGovernanceService.parseCodeownersLines`                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:230`                                         |
| `AuditGovernanceService.checkGovernance`                             | 2       | `AuditGovernanceService.checkCodeowners`, `AuditGovernanceService.checkWorkflows`                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:272`                                         |
| `AuditGovernanceService.checkWorkflows`                              | 2       | `AuditGovernanceService.filter(…)`, `AuditGovernanceService.auditWorkflowContent`                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:286`                                         |
| `IssueLabelsService.missingLabels`                                   | 2       | `IssueLabelsService.filter(…)`, `IssueLabelsService.labelsFromAnswers`                                                                                                                                                                                                                                                                                                                                                                     | `projects/compliance/src/modules/issue-labels/issue-labels.service.ts:77`                                                  |
| `IssueLabelsCommand.addLabel`                                        | 2       | `IssueLabelsGithubService.run`, `IssueLabelsGithubService.describeFailure`                                                                                                                                                                                                                                                                                                                                                                 | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:54`                                                  |
| `IssueLabelsCommand.readLabelNames`                                  | 2       | `IssueLabelsCommand.filter(…)`, `IssueLabelsCommand.map(…)`                                                                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:115`                                                 |
| `IssueMetadataGithubService.listOpenIssues`                          | 2       | `IssueMetadataGithubService.run`, `IssueMetadataGithubService.describeFailure`                                                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/issue-metadata/issue-metadata-github.service.ts:65`                                       |
| `IssueMetadataTypeService.check`                                     | 2       | `IssueMetadataTypeService.checkSubIssue`, `IssueMetadataTypeService.checkRoot`                                                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/issue-metadata/issue-metadata-type.service.ts:82`                                         |
| `IssueMetadataTypeService.readFromDocument`                          | 2       | `IssueMetadataTypeService.isRecord`, `IssueMetadataTypeService.hasBodyParent`                                                                                                                                                                                                                                                                                                                                                              | `projects/compliance/src/modules/issue-metadata/issue-metadata-type.service.ts:101`                                        |
| `IssueMetadataService.checkSourceLabel`                              | 2       | `IssueMetadataService.map(…)`, `IssueMetadataService.map(…)`                                                                                                                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:100`                                             |
| `IssueMetadataService.readLabelNames`                                | 2       | `IssueMetadataService.filter(…)`, `IssueMetadataService.map(…)`                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:244`                                             |
| `IssueMetadataService.resolveFromEnvironment`                        | 2       | `IssueMetadataService.describeError`, `IssueMetadataService.readLabelNames`                                                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:463`                                             |
| `IssueMetadataService.resolveIssueReleaseLevel`                      | 2       | `IssueMetadataService.hasBreakingMarker`, `IssueMetadataService.resolveStandardReleaseLevel`                                                                                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:495`                                             |
| `IssueMetadataCommand.failWithMessage`                               | 2       | `IssueMetadataCommand.appendToReport`, `IssueMetadataCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:79`                                              |
| `IssueMetadataCommand.failWithUsageError`                            | 2       | `IssueMetadataCommand.appendToReport`, `IssueMetadataCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:87`                                              |
| `IssueMetadataCommand.readEnvironmentMetadata`                       | 2       | `IssueMetadataCommand.failWithUsageError`, `IssueMetadataService.resolveFromEnvironment`                                                                                                                                                                                                                                                                                                                                                   | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:133`                                             |
| `IssueMetadataCommand.reportFailures`                                | 2       | `IssueMetadataCommand.appendToReport`, `IssueMetadataCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/issue-metadata/issue-metadata.command.ts:183`                                             |
| `PullRequestLabelsAssigneesService.checkSourceLabel`                 | 2       | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.map(…)`                                                                                                                                                                                                                                                                                                                                                     | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:93`                |
| `PullRequestLabelsAssigneesService.checkTypeLabel`                   | 2       | `PullRequestLabelsAssigneesService.map(…)`, `PullRequestLabelsAssigneesService.filter(…)`                                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:124`               |
| `PullRequestLabelsAssigneesService.readNames`                        | 2       | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.map(…)`                                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:199`               |
| `PullRequestLabelsAssigneesService.parseTitle`                       | 2       | `PullRequestLabelsAssigneesService.filter(…)`, `PullRequestLabelsAssigneesService.map(…)`                                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:276`               |
| `PullRequestLabelsAssigneesService.resolveFromEnvironment`           | 2       | `PullRequestLabelsAssigneesService.parseJsonArray`, `PullRequestLabelsAssigneesService.readNames`                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:332`               |
| `PullRequestLabelsAssigneesCommand.failWithMessage`                  | 2       | `PullRequestLabelsAssigneesCommand.appendToReport`, `PullRequestLabelsAssigneesCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:78`                |
| `PullRequestLabelsAssigneesCommand.failWithUsageError`               | 2       | `PullRequestLabelsAssigneesCommand.appendToReport`, `PullRequestLabelsAssigneesCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:86`                |
| `PullRequestLabelsAssigneesCommand.readEnvironmentMetadata`          | 2       | `PullRequestLabelsAssigneesCommand.failWithUsageError`, `PullRequestLabelsAssigneesService.resolveFromEnvironment`                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:132`               |
| `PullRequestLabelsAssigneesCommand.reportFailures`                   | 2       | `PullRequestLabelsAssigneesCommand.appendToReport`, `PullRequestLabelsAssigneesCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.command.ts:186`               |
| `PullRequestBodyService.cleanSectionContent`                         | 2       | `PullRequestBodyService.filter(…)`, `PullRequestBodyService.map(…)`                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:74`                                        |
| `PullRequestBodyService.findEmptySections`                           | 2       | `PullRequestBodyService.splitSections`, `PullRequestBodyService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                 | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:225`                                       |
| `PullRequestBodyService.findMissingHeadings`                         | 2       | `PullRequestBodyService.map(…)`, `PullRequestBodyService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:263`                                       |
| `PullRequestBodyService.findOversizedSections`                       | 2       | `PullRequestBodyService.splitSections`, `PullRequestBodyService.flatMap(…)`                                                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:270`                                       |
| `PullRequestLabelsService.readExpectedLabels`                        | 2       | `PullRequestLabelsService.map(…)`, `PullRequestLabelsService.map(…)`                                                                                                                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:106`                                   |
| `PullRequestLabelsCommand.run`                                       | 2       | `PullRequestLabelsCommand.synchronize`, `PullRequestLabelsCommand.resolveMode`                                                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:287`                                   |
| `PullRequestParentLinksCommand.addAncestorReferences`                | 2       | `PullRequestParentLinksService.addRelatedIssueReferences`, `PullRequestParentLinksCommand.fail`                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:48`                        |
| `PullRequestParentLinksCommand.addIssueAncestors`                    | 2       | `PullRequestParentLinksCommand.readParentIssueNumber`, `PullRequestParentLinksCommand.fail`                                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:65`                        |
| `PullRequestParentLinksCommand.parseParentIssueNumber`               | 2       | `PullRequestParentLinksCommand.fail`, `IssueMetadataService.extractParentIssueNumber`                                                                                                                                                                                                                                                                                                                                                      | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:108`                       |
| `PullRequestParentLinksCommand.readAncestorIssueNumbers`             | 2       | `PullRequestParentLinksCommand.addIssueAncestors`, `PullRequestParentLinksCommand.filter(…)`                                                                                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:137`                       |
| `PullRequestParentLinksCommand.run`                                  | 2       | `PullRequestParentLinksCommand.synchronizeParentReferences`, `PullRequestParentLinksCommand.resolveContext`                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:315`                       |
| `PullRequestReleaseSignificanceService.describeSignificanceFailure`  | 2       | `PullRequestReleaseSignificanceService.releaseLevelName`, `PullRequestReleaseSignificanceService.find(…)`                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:61`        |
| `PullRequestReleaseSignificanceService.readRawCommit`                | 2       | `PullRequestReleaseSignificanceService.isRecord`, `PullRequestReleaseSignificanceService.parseConventionalSubject`                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:164`       |
| `PullRequestReleaseSignificanceService.parseConventionalSubject`     | 2       | `PullRequestReleaseSignificanceService.filter(…)`, `PullRequestReleaseSignificanceService.map(…)`                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:260`       |
| `PullRequestReleaseSignificanceService.resolveFromDocument`          | 2       | `PullRequestReleaseSignificanceService.describeError`, `PullRequestReleaseSignificanceService.map(…)`                                                                                                                                                                                                                                                                                                                                      | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:316`       |
| `PullRequestReleaseSignificanceService.significanceRank`             | 2       | `PullRequestReleaseSignificanceService.matchRule`, `PullRequestReleaseSignificanceService.rankOfRelease`                                                                                                                                                                                                                                                                                                                                   | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:342`       |
| `PullRequestReleaseSignificanceCommand.failWithMessage`              | 2       | `PullRequestReleaseSignificanceCommand.appendToReport`, `PullRequestReleaseSignificanceCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:73`        |
| `PullRequestReleaseSignificanceCommand.failWithUsageError`           | 2       | `PullRequestReleaseSignificanceCommand.appendToReport`, `PullRequestReleaseSignificanceCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:81`        |
| `PullRequestReleaseSignificanceCommand.reportFailures`               | 2       | `PullRequestReleaseSignificanceCommand.appendToReport`, `PullRequestReleaseSignificanceCommand.mirrorToStepSummary`                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:146`       |
| `AuditGovernanceService.parseCodeownersLines`                        | 1       | `AuditGovernanceService.parseCodeownersRule`                                                                                                                                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:172`                                         |
| `AuditGovernanceService.sliceJobsSection`                            | 1       | `AuditGovernanceService.findIndex(…)`                                                                                                                                                                                                                                                                                                                                                                                                      | `projects/compliance/src/modules/audit-governance/audit-governance.service.ts:221`                                         |
| `IssueAssigneesGithubService.assignIssue`                            | 1       | `IssueAssigneesGithubService.run`                                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/issue-assignees/issue-assignees-github.service.ts:34`                                     |
| `IssueAssigneesGithubService.describeFailure`                        | 1       | `IssueAssigneesGithubService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                    | `projects/compliance/src/modules/issue-assignees/issue-assignees-github.service.ts:45`                                     |
| `IssueLabelsGithubService.describeFailure`                           | 1       | `IssueLabelsGithubService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/issue-labels/issue-labels-github.service.ts:43`                                           |
| `IssueLabelsGithubService.isAvailable`                               | 1       | `IssueLabelsGithubService.run`                                                                                                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/issue-labels/issue-labels-github.service.ts:52`                                           |
| `IssueLabelsService.parseFormAnswers`                                | 1       | `IssueLabelsService.extractFormField`                                                                                                                                                                                                                                                                                                                                                                                                      | `projects/compliance/src/modules/issue-labels/issue-labels.service.ts:90`                                                  |
| `IssueLabelsCommand.nameOf`                                          | 1       | `IssueLabelsCommand.isRecord`                                                                                                                                                                                                                                                                                                                                                                                                              | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:79`                                                  |
| `IssueLabelsCommand.readExistingLabelNames`                          | 1       | `IssueLabelsCommand.readLabelNames`                                                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:91`                                                  |
| `IssueLabelsCommand.map(…)`                                          | 1       | `IssueLabelsCommand.nameOf`                                                                                                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/issue-labels/issue-labels.command.ts:117`                                                 |
| `IssueMetadataGithubService.describeFailure`                         | 1       | `IssueMetadataGithubService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                     | `projects/compliance/src/modules/issue-metadata/issue-metadata-github.service.ts:51`                                       |
| `IssueMetadataGithubService.isAvailable`                             | 1       | `IssueMetadataGithubService.run`                                                                                                                                                                                                                                                                                                                                                                                                           | `projects/compliance/src/modules/issue-metadata/issue-metadata-github.service.ts:60`                                       |
| `IssueMetadataTypeService.checkRoot`                                 | 1       | `IssueMetadataTypeService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/issue-metadata/issue-metadata-type.service.ts:32`                                         |
| `IssueMetadataTypeService.readFromSummary`                           | 1       | `IssueMetadataTypeService.hasBodyParent`                                                                                                                                                                                                                                                                                                                                                                                                   | `projects/compliance/src/modules/issue-metadata/issue-metadata-type.service.ts:121`                                        |
| `IssueMetadataService.checkTypeLabelPresence`                        | 1       | `IssueMetadataService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                                              | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:166`                                             |
| `IssueMetadataService.computeHierarchyDepth`                         | 1       | `IssueMetadataService.extractParentIssueNumber`                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:186`                                             |
| `IssueMetadataService.map(…)`                                        | 1       | `IssueMetadataService.isRecord`                                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:246`                                             |
| `IssueMetadataService.resolveStandardReleaseLevel`                   | 1       | `IssueMetadataService.find(…)`                                                                                                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:260`                                             |
| `IssueMetadataService.parseFormAnswers`                              | 1       | `IssueMetadataService.extractFormField`                                                                                                                                                                                                                                                                                                                                                                                                    | `projects/compliance/src/modules/issue-metadata/issue-metadata.service.ts:424`                                             |
| `PullRequestLabelsAssigneesGithubService.describeFailure`            | 1       | `PullRequestLabelsAssigneesGithubService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees-github.service.ts:47`         |
| `PullRequestLabelsAssigneesGithubService.isAvailable`                | 1       | `PullRequestLabelsAssigneesGithubService.run`                                                                                                                                                                                                                                                                                                                                                                                              | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees-github.service.ts:56`         |
| `PullRequestLabelsAssigneesService.nameOf`                           | 1       | `PullRequestLabelsAssigneesService.isRecord`                                                                                                                                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:162`               |
| `PullRequestLabelsAssigneesService.parseJsonArray`                   | 1       | `PullRequestLabelsAssigneesService.describeError`                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:177`               |
| `PullRequestLabelsAssigneesService.map(…)`                           | 1       | `PullRequestLabelsAssigneesService.nameOf`                                                                                                                                                                                                                                                                                                                                                                                                 | `projects/compliance/src/modules/pull-request-labels-assignees/pull-request-labels-assignees.service.ts:201`               |
| `PullRequestBodyService.bulletMarkersOf`                             | 1       | `PullRequestBodyService.sourceOf`                                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:46`                                        |
| `PullRequestBodyService.countWords`                                  | 1       | `PullRequestBodyService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:86`                                        |
| `PullRequestBodyService.isDashList`                                  | 1       | `PullRequestBodyService.every(…)`                                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:132`                                       |
| `PullRequestBodyService.every(…)`                                    | 1       | `PullRequestBodyService.sourceOf`                                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:136`                                       |
| `PullRequestBodyService.parseBlocks`                                 | 1       | `PullRequestBodyService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:148`                                       |
| `PullRequestBodyService.splitSections`                               | 1       | `PullRequestBodyService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:179`                                       |
| `PullRequestBodyService.extractTemplateComments`                     | 1       | `PullRequestBodyService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:218`                                       |
| `PullRequestBodyService.filter(…)`                                   | 1       | `PullRequestBodyService.cleanSectionContent`                                                                                                                                                                                                                                                                                                                                                                                               | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:228`                                       |
| `PullRequestBodyService.flatMap(…)`                                  | 1       | `PullRequestBodyService.countWords`                                                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:273`                                       |
| `PullRequestBodyService.findUnfilledComments`                        | 1       | `PullRequestBodyService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:291`                                       |
| `PullRequestBodyService.filter(…)`                                   | 1       | `PullRequestBodyService.prefixOf`                                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-body/pull-request-body.service.ts:297`                                       |
| `PullRequestBodyCommand.resolveBody`                                 | 1       | `PullRequestBodyCommand.failWithUsageError`                                                                                                                                                                                                                                                                                                                                                                                                | `projects/compliance/src/modules/pull-request-body/pull-request-body.command.ts:118`                                       |
| `PullRequestLabelsGithubService.describeFailure`                     | 1       | `PullRequestLabelsGithubService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                                 | `projects/compliance/src/modules/pull-request-labels/pull-request-labels-github.service.ts:42`                             |
| `PullRequestLabelsService.isTrackedLabel`                            | 1       | `PullRequestLabelsService.some(…)`                                                                                                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:45`                                    |
| `PullRequestLabelsService.filter(…)`                                 | 1       | `PullRequestLabelsService.isTrackedLabel`                                                                                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.service.ts:82`                                    |
| `PullRequestLabelsCommand.describePlan`                              | 1       | `PullRequestLabelsCommand.appendToReport`                                                                                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:107`                                   |
| `PullRequestLabelsCommand.reportStaleLabels`                         | 1       | `PullRequestLabelsCommand.appendToReport`                                                                                                                                                                                                                                                                                                                                                                                                  | `projects/compliance/src/modules/pull-request-labels/pull-request-labels.command.ts:227`                                   |
| `PullRequestParentLinksService.insertReferences`                     | 1       | `PullRequestParentLinksService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                                     | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.service.ts:22`                        |
| `PullRequestParentLinksService.readExistingIssueNumbers`             | 1       | `PullRequestParentLinksService.flatMap(…)`                                                                                                                                                                                                                                                                                                                                                                                                 | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.service.ts:42`                        |
| `PullRequestParentLinksService.flatMap(…)`                           | 1       | `PullRequestParentLinksService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                                     | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.service.ts:50`                        |
| `PullRequestParentLinksCommand.readPullRequestBody`                  | 1       | `PullRequestParentLinksCommand.fail`                                                                                                                                                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:215`                       |
| `PullRequestParentLinksCommand.resolveContext`                       | 1       | `PullRequestParentLinksCommand.fail`                                                                                                                                                                                                                                                                                                                                                                                                       | `projects/compliance/src/modules/pull-request-parent-links/pull-request-parent-links.command.ts:226`                       |
| `PullRequestReleaseSignificanceGithubService.describeFailure`        | 1       | `PullRequestReleaseSignificanceGithubService.filter(…)`                                                                                                                                                                                                                                                                                                                                                                                    | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance-github.service.ts:42` |
| `PullRequestReleaseSignificanceGithubService.isAvailable`            | 1       | `PullRequestReleaseSignificanceGithubService.run`                                                                                                                                                                                                                                                                                                                                                                                          | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance-github.service.ts:51` |
| `PullRequestReleaseSignificanceService.describeMissingScopeFailures` | 1       | `PullRequestReleaseSignificanceService.map(…)`                                                                                                                                                                                                                                                                                                                                                                                             | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:51`        |
| `PullRequestReleaseSignificanceService.findMissingScopes`            | 1       | `PullRequestReleaseSignificanceService.some(…)`                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:84`        |
| `PullRequestReleaseSignificanceService.findMostSignificantCommit`    | 1       | `PullRequestReleaseSignificanceService.significanceRank`                                                                                                                                                                                                                                                                                                                                                                                   | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:114`       |
| `PullRequestReleaseSignificanceService.matchRule`                    | 1       | `PullRequestReleaseSignificanceService.find(…)`                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:151`       |
| `PullRequestReleaseSignificanceService.find(…)`                      | 1       | `PullRequestReleaseSignificanceService.ruleMatches`                                                                                                                                                                                                                                                                                                                                                                                        | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:155`       |
| `PullRequestReleaseSignificanceService.releaseLevelName`             | 1       | `PullRequestReleaseSignificanceService.find(…)`                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:183`       |
| `PullRequestReleaseSignificanceService.readReleaseRules`             | 1       | `PullRequestReleaseSignificanceService.find(…)`                                                                                                                                                                                                                                                                                                                                                                                            | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:294`       |
| `PullRequestReleaseSignificanceService.map(…)`                       | 1       | `PullRequestReleaseSignificanceService.readRawCommit`                                                                                                                                                                                                                                                                                                                                                                                      | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts:335`       |
| `PullRequestReleaseSignificanceCommand.resolvePullRequestNumber`     | 1       | `PullRequestReleaseSignificanceCommand.failWithUsageError`                                                                                                                                                                                                                                                                                                                                                                                 | `projects/compliance/src/modules/pull-request-release-significance/pull-request-release-significance.command.ts:173`       |
| `PullRequestTitleBodyCommand.resolvePullRequestNumber`               | 1       | `PullRequestTitleBodyCommand.fail`                                                                                                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-title-body/pull-request-title-body.command.ts:54`                            |
| `PullRequestTitleBodyCommand.writeContext`                           | 1       | `PullRequestTitleBodyCommand.fail`                                                                                                                                                                                                                                                                                                                                                                                                         | `projects/compliance/src/modules/pull-request-title-body/pull-request-title-body.command.ts:87`                            |

</details>
<!-- callidescope:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-11858-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-363.65_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-7-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-94-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-94-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-37-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-1-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-36-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-249-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-28-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-16-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-31-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-589-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-261-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-787-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-63-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-528-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-365-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-173-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-398-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-724-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-134-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-37-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-8-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-93-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-64-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-8-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-22-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-118-dc2626?style=flat-square)
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
![Service Files](https://img.shields.io/badge/Service_Files-22-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-4-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-15-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-12-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-27-ca8a04?style=flat-square)
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

- **abort**:
- **ancestor**:
- **binary**:
- **breadth**:
- **bulk**:
- **bullet**:
- **chain**:
- **chore**:
- **clean**:
- **climb**:
- **collapse**:
- **completion**:
- **convention**:
- **creation**:
- **descendant**:
- **discovery**:
- **evaluate**:
- **fact**:
- **feat**:
- **fill**:
- **footer**:
- **governance**:
- **guidance**:
- **handle**:
- **headline**:
- **hierarchy**:
- **hint**:
- **hold**:
- **invocation**:
- **iso**:
- **malformed**:
- **marker**:
- **most**:
- **multiple**:
- **na**:
- **native**:
- **need**:
- **newly**:
- **oid**:
- **organization**:
- **overlap**:
- **oversized**:
- **paragraph**:
- **parallelism**:
- **pid**:
- **presence**:
- **queue**:
- **rank**:
- **reconcile**:
- **reconciliation**:
- **refine**:
- **rel**:
- **relate**:
- **sample**:
- **significance**:
- **significant**:
- **splice**:
- **stale**:
- **sub**:
- **succeed**:
- **surplus**:
- **sweep**:
- **tail**:
- **tint**:
- **top**:
- **track**:
- **tuple**:
- **unassigned**:
- **unchanged**:
- **unfilled**:
- **usage**:
- **verb**:
- **verdict**:
- **violation**:
- **vocabulary**:
- **writable**:

<!-- coinagerie:end -->
