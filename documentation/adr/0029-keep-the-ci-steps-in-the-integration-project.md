# 0029: Keep the CI Steps in the Integration Project

Supersedes in part [ADR 0028](0028-run-the-nx-ci-steps-after-the-install-as-commands.md): where the Nx steps live and how `setup-codebase` runs them. Its decision that they run after `pnpm install`, and its measurement, stand.

## Context

ADR 0028 moved the Nx CI steps into commands of the `publication` project. The `integration` project already held the same four task-database commands, older and smaller, and `cleanup-codebase` ran those while `setup-codebase` ran `publication`'s. Two copies of one service drifted: `publication`'s had gained the merge, the cache directory, and a hardened process runner. `publication` is the release pipeline, so Nx task-cache plumbing was also in the wrong project.

`run-affected` was wired into no workflow. Continuous Integration did its job in inline bash, and the command still dropped spelling files, which Nx's task-based affected (`NX_LEGACY_AFFECTED=false`, already set by `setup-codebase`) now handles on its own: a dictionary edit reaches only `format-code` and `spell-check`.

## Decision

**The CI steps live in `integration`; `publication` keeps the release.** The task-database, cache-import, and base-bounding commands moved there, taking `publication`'s versions, and the `publication` copies are gone.

**The composite actions call one command each.** `setup-codebase` runs `bound-base-to-push`, `import-pr-task-cache`, `verify-task-database`, and `adopt-task-database` in that order, and `cleanup-codebase` runs `verify-task-database` and `keep-task-database`. Each is a command that runs the services itself: a service of its own would put the import's call stack over the depth limit. The cache restores and saves, the artifact uploads, and the tool installs stay in YAML, because they are actions or need no command.

**`run-affected` stays, for templates only.** `.nxignore` hides conformetry templates from Nx, so a changed template selects no instance project; with `INCLUDE_TEMPLATES` the command makes a second run over the conformetry config. Spelling files and the `--stdin` path are gone, which also restores Nx's field-by-field diff of `package.json` and the lockfile. Declaring the templates as inputs with `includeIgnored: true` would retire the rest, and is a separate decision.

**The codometer baseline steps are commands too:** `collect-codometer-baseline` and `report-codometer-changes` replace the shell in `report-integration`, which keeps its artifact uploads.

## Consequences

- A new CI step is a command of `integration`, unless it must run before `pnpm install` ([ADR 0027](0027-narrow-the-shell-floor-to-the-hooks-and-the-pre-install-ci-steps.md)) or is an action.
- `setup-codebase` boots the container once instead of four times.
- The tool installs in `setup-codebase` (Homebrew's gitleaks and Trivy, the PostgreSQL 18 client) are not moved. The `installation` project's `software` command installs the same tools on Linux from checksummed release archives and the PostgreSQL apt repository, but it assumes root and `~/.local/bin`, and a runner has neither. Moving them is a separate change.
