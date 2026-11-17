<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **analyzer**: A codometer or callidescope component that inspects one input language's source to produce measurements, such as a TypeScript or Python analyzer.
- **bullet**: One `-` list item of a pull request body, the shape the Details and Related sections must take and the unit the links service adds per issue.
- **callidescope**: IC-suite toolchain that measures call-stack depth and breadth across the workspace and gates each project's limits.
- **climb**: Walks from a linked issue up through its parents to collect its ancestors, stopping at a cycle; `climb` in `pull-request-ancestor-issues.service.ts`.
- **codometer**: IC-suite measurement tool that reports sizes, counts, and comment budgets against configured limits per project.
- **coinagerie**: Vocabulary toolchain that collects a repository's words and checks or writes their definitions into glossary files.
- **compliance**: The Compliance CLI and Continuous Compliance workflow, which read or update GitHub issues, pull requests, and repository governance metadata.
- **compliant**: Passing every issue check: the audit reports open issues and their parent-child links as compliant when none fails.
- **context**: Background information an agent or reviewer uses to locate and judge a change.
- **contract**: What the pull request template's headings promise a body must contain; `pull-request-body.constants.ts` reads them from here so a template edit that dropped one fails the check.
- **convention**: The Conventional Commits format, `type(scope): subject`, that issue titles, pull request titles, and commits are parsed against.
- **core**: Central layer of the codebase's module architecture, holding domain vocabulary, shared enums, and error classes that other layers depend on.
- **creation**: A label the vocabulary plan must create because `conventional.config.cjs` names it and the repository lacks it.
- **deprecate**: Nx code-quality target, deprecate-code, that finds unused or outdated code and dependencies with tools such as knip, sherif, and syncpack in the validate-code step.
- **depth**: Callidescope metric for the longest call stack, gated per project by maximumDepth in callidescope configuration.
- **descendant**: An open issue beneath a linked issue in the sub-issue tree, which the pull request body must close alongside it.
- **effort**: The project board's Effort field, which the issue a pull request is built for must have set; `EFFORT_FIELD` names it.
- **governance**: Repository-level rules outside any one issue or pull request, such as CODEOWNERS and workflow security, checked by `audit-files`.
- **guard**: Nx code-quality target, guard-code, that runs the IC-suite gates and the catalog check on each project in the validate-code step.
- **lookup**: Read-only callidescope query that traces a callable, prints its callers or callees, and never applies a depth or breadth gate.
- **map**: Wayfinder's planning artifact for a huge effort, a graph of linked decisions that collapses into a buildable spec when cleared.
- **mention**: A reference to an issue number in a pull request body; an ancestor issue that is not mentioned fails verification.
- **observability**: Shared package at projects/common/observability that provides the pino-backed LoggerService and telemetry used by services.
- **organization**: The GitHub organization that owns the project board; the `organization-project` command adds issues and pull requests to it.
- **reconcile**: Bring the repository's labels into line with `conventional.config.cjs` by creating and editing them, or report what differs when not asked to write.
- **reconciliation**: The plan of label creations and updates that reconciling would apply, held as `LabelReconciliationPlan`.
- **significance**: How large a release a commit type causes. A pull request title's type must rank at least as high as every commit on its branch.
- **significant**: Ranking higher in release significance, as in the most significant commit a title is compared with.
- **splice**: The array method that inserts missing issue references into the lines of a pull request body.
- **surplus**: Command-line arguments beyond the ones the pull-request command takes, which it rejects.
- **typecheck**: Nx target that runs type checking per project, driven by the typecheck-code gate in validate-code and CI.
- **unassigned**: An open issue with no assignee, which the issue command assigns to the repository's default owner.
- **unchanged**: The outcome of a body check that found nothing to add, so the pull request is left as it is.
- **unlinked**: Of a pull request author, such as a bot, whose pull requests need no linked issue; `UNLINKED_AUTHOR_LOGINS` lists them.
- **validation**: Workspace project and CLI for checks with nothing to write back, such as pull request metadata, catalog pins, and branch or worktree names, printing the fix for each failure.
- **verb**: The `gh label` action a reconciliation step runs, `create` or `edit`.
- **vocabulary**: The set of `type:` and `scope:` labels the repository should hold, derived from `conventional.config.cjs`.

<!-- coinagerie:end -->
