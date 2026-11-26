# compliance

The pull request end of a change's way to `main`. Owns Continuous Compliance
commands that read or update GitHub issue and pull request metadata, enforce
repository governance, and own the pull request template and its derived
copies. The commit and push checks live in `integration`.

## Commands

This project owns five commands, each backed by one service per concern:

- `pull-request` (`src/modules/pull-request/`): merge-group context
  resolution, non-closing parent references and label reconciliation (pull
  request events only), then one aggregated validation of title, body,
  labels/assignees, release significance, and the issues it closes (each passes
  the issue audit; the issue it is built for has an Effort, and that issue's
  root has a Priority). Merge groups never write. Locally
  it is read-only unless `write` is given.
- `issue` (`src/modules/issue/`): labels and assigns a new issue, audits one
  issue, or audits every open issue (`--all`), chosen by event or arguments.
- `audit-files`: repository governance checks.
- `organization-project`: manual synchronization of repository issues and pull
  requests into the organization project.
- `pull-request-template` (`src/modules/pull-request-template/`): checks or
  writes the pull request template into the skill files that embed it. It owns
  the template beside `pull-request`'s body check, and needs no token.

Codebase-file reconciliation and codebase-only checks live in `integration`,
not here (the pull request template is the exception, owned here).
