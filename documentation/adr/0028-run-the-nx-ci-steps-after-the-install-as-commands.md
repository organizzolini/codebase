# 0028: Run the Nx CI Steps After the Install as Commands

Superseded in part by [ADR 0029](0029-keep-the-ci-steps-in-the-integration-project.md), which moves the commands from `publication` to `integration`. The steps still run after the install.

Supersedes in part [ADR 0027](0027-narrow-the-shell-floor-to-the-hooks-and-the-pre-install-ci-steps.md): its `scripts/nx/` floor entry. Its rule and every other floor entry stand.

## Context

[ADR 0027](0027-narrow-the-shell-floor-to-the-hooks-and-the-pre-install-ci-steps.md) kept six scripts on the shell floor because `.github/actions/setup-codebase` ran them before `pnpm install`, when no command can boot: `bound-base-to-push.sh`, `import-pr-task-cache.sh`, `merge-task-cache.sh`, `verify-task-database.sh`, `adopt-task-database.sh`, and their shared `task-database.sh`. It allowed moving them after the install once a merge-group measurement showed the cache hits unchanged.

Running before the install was a choice, not a need. None of the steps feeds the install, and the install does not read the Nx task database. Its lifecycle scripts were checked: Nx's own `postinstall` only updates the Nx Cloud client, which this workspace does not use; `conformetry-nx-bootstrap-generators` emits a generator plugin; `installed-skills write` checks the committed skills; `prepare` runs husky. A full `postinstall` run against an empty `.nx/workspace-data` left it empty. So the empty `<machine-id>` database that adoption exists to prevent is not created by moving it.

## Decision

The six scripts are deleted. Their steps are commands of the `publication` project, and `setup-codebase` runs them directly after `📚 Install Node Dependencies`, in their old order: `bound-base-to-push`, `import-pr-task-cache` (merge group only), `verify-task-database`, `adopt-task-database`. Each keeps its `if:` condition and is also skipped when `node_modules/.modules.yaml` is missing, as in `cleanup-codebase`, so a job without an install does not fail a second time. Only CI uses `nx-base: push-before`, and it always installs.

The ports keep the scripts' behavior: import and merge never fail the run, outputs are copied before rows, a fork's artifact is not trusted, and the base keeps its fallbacks. The merge opens the databases with `node:sqlite`, with foreign keys off as in the `sqlite3` binary.

## Measurement

Each cell is Nx's `read the output from the cache … for X out of Y tasks` for the leg's target. A leg with no such line had no hits.

Pull request runs, old order against new. The baseline is [#1699](https://github.com/Organizzolini/codebase/pull/1699)'s run [38982553556](https://github.com/Organizzolini/codebase/actions/runs/38982553556); the candidate is this change's own pull request run. Neither can read the other's caches, so both restore `main`'s through `restore-keys`, and this change adds files to #1699's, so its inputs differ in the projects it touches.

| Leg | #1699, old order | This change, new order |
| --- | ---------------- | ---------------------- |
| Typecheck | 54/163 | 53/163 |
| Format | 212/273 | 208/273 |
| Lint | 104/161 | 102/161 |
| Deprecate | 56/161 | 55/161 |
| Guard | 0/201 | 43/201 |
| Build | 0/134 | 0/134 |
| Test | 1/24 | 1/24 |
| Test Caelundas | 1/5 | 1/5 |
| Test IC Suite | 0/74 | 0/74 |
| Test Meanderaw | 0/2 | 0/2 |
| Publishable Packages | 0/60 | 0/60 |
| Secure | 0/4 | 0/4 |

The candidate is run [38988155260](https://github.com/Organizzolini/codebase/actions/runs/38988155260). Every leg adopted a database of 18 to 6,469 results after the install, as before it. The task totals are equal leg for leg, and the hits differ by one to four where this change's own files feed the tasks, the `publication` project and the root documentation, so those tasks miss in its run. Guard rose because `main`'s Guard cache was saved warmer in between. No leg lost hits to the order.

Merge-group runs with the old order, each importing its pull request's artifact: [#1564](https://github.com/Organizzolini/codebase/actions/runs/38962477883), [#1565](https://github.com/Organizzolini/codebase/actions/runs/38966149604), [#1569](https://github.com/Organizzolini/codebase/actions/runs/38971996212), and both of [#1691](https://github.com/Organizzolini/codebase/actions/runs/38979617663)'s ([second](https://github.com/Organizzolini/codebase/actions/runs/38980360518)).

| Leg | #1564 | #1565 | #1569 | #1691 | #1691, again |
| --- | ----- | ----- | ----- | ----- | ------------ |
| Typecheck | 103/160 | 65/163 | 108/163 | 2/163 | 2/163 |
| Format | 210/273 | 216/273 | 219/273 | 1/278 | 1/278 |
| Lint | 102/161 | 106/161 | 107/161 | 3/164 | 3/164 |
| Deprecate | 97/158 | 30/161 | 107/161 | 3/161 | 3/161 |
| Guard | 137/199 | 18/201 | 147/201 | 0/203 | 0/203 |
| Build | 81/132 | 9/134 | 85/134 | 0/134 | 0/134 |
| Test | 9/22 | 3/24 | 12/24 | 0/24 | 1/24 |
| Test Caelundas | 3/5 | 2/5 | 3/5 | 0/5 | 1/5 |
| Test IC Suite | 37/74 | 4/74 | 37/74 | 0/74 | 0/74 |
| Test Meanderaw | 1/2 | 0/2 | 1/2 | 0/2 | 0/2 |
| Publishable Packages | 59/60 | 0/60 | 59/60 | 0/60 | 0/60 |
| Secure | 1/6 | 0/4 | 2/4 | 1/6 | 1/6 |

The spread is the point of the caveat: a hit needs the task's inputs to match a cached run's, so the count follows what each change touched and what the restored caches hold, not the step order. #1691 renamed a shared package, which changed nearly every input, so it imported 100 to 200 results a leg and hit almost none. The comparison that isolates the order is the import itself: with the old order, every leg logged `📥 Importing`, `🧩 Merged N task results`, and `🪪 Adopted`, and the hits it can add are the results it merged. A merge group of this change has to log the same three lines on every leg, and no leg may lose hits to an empty database; [#1699](https://github.com/Organizzolini/codebase/pull/1699)'s own merge group is the closest old-order run to compare it with, since the two touch the same files.

## Consequences

- `scripts/nx/` holds only `await-health.sh` and `stop-port.sh`, which [ADR 0027](0027-narrow-the-shell-floor-to-the-hooks-and-the-pre-install-ci-steps.md) leaves undecided.
- A step that must run before the install still cannot be a command. None remains in `setup-codebase`.
- Each of the four steps boots the `publication` container. In the candidate run verify and adopt took under a second each, and `🕋 Setup Codebase` took a median of 74 seconds a leg against 71.5 before.
- If the install ever opens the task database, the adoption would pick the empty database it wrote, since it is the newest. Check that again before adding an Nx call to a lifecycle script.
