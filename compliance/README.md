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
