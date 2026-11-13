<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **bullet**: One `-` list item of a pull request body, the shape the Details and Related sections must take and the unit the links service adds per issue.
- **climb**: Walks from a linked issue up through its parents to collect its ancestors, stopping at a cycle; `climb` in `pull-request-ancestor-issues.service.ts`.
- **contract**: What the pull request template's headings promise a body must contain; `pull-request-body.constants.ts` reads them from here so a template edit that dropped one fails the check.
- **convention**: The Conventional Commits format, `type(scope): subject`, that issue titles, pull request titles, and commits are parsed against.
- **creation**: A label the vocabulary plan must create because `conventional.config.cjs` names it and the repository lacks it.
- **descendant**: An open issue beneath a linked issue in the sub-issue tree, which the pull request body must close alongside it.
- **governance**: Repository-level rules outside any one issue or pull request, such as CODEOWNERS and workflow security, checked by `audit-files`.
- **mention**: A reference to an issue number in a pull request body; an ancestor issue that is not mentioned fails verification.
- **organization**: The GitHub organization that owns the project board; the `organization-project` command adds issues and pull requests to it.
- **reconcile**: Bring the repository's labels into line with `conventional.config.cjs` by creating and editing them, or report what differs when not asked to write.
- **reconciliation**: The plan of label creations and updates that reconciling would apply, held as `LabelReconciliationPlan`.
- **significance**: How large a release a commit type causes. A pull request title's type must rank at least as high as every commit on its branch.
- **significant**: Ranking higher in release significance, as in the most significant commit a title is compared with.
- **splice**: The array method that inserts missing issue references into the lines of a pull request body.
- **surplus**: Command-line arguments beyond the ones the pull-request command takes, which it rejects.
- **unassigned**: An open issue with no assignee, which the issue command assigns to the repository's default owner.
- **unchanged**: The outcome of a body check that found nothing to add, so the pull request is left as it is.
- **verb**: The `gh label` action a reconciliation step runs, `create` or `edit`.
- **vocabulary**: The set of `type:` and `scope:` labels the repository should hold, derived from `conventional.config.cjs`.

<!-- coinagerie:end -->
