# installation

**Purpose**: Set up a developer machine once Node and pnpm exist: shell configuration, the remaining software, `.env` files, and dependencies. It also holds the checks that guard a session and its skills: `installed-skills`, `vscode-settings`, `session-branch-name`, and `session-worktree-name`, described below. A behavior-preserving port of what the `scripts/local/` shell used to do.

One command is maintenance rather than setup: `update-reui-skill` refreshes the vendored ReUI skill, and `upgrade-dependencies.yml` runs it after `skills update`. It is not part of `setup`, and an outage prints the retry command and exits 0.

`installed-skills` restores the skills `skills-lock.json` declares that are missing from `.agents/skills/`. `postinstall` runs its `write` mode on every `pnpm install`, and `scripts/git/validate-session-skills.sh` runs its `check` mode at session start. `vscode-settings` merges `.vscode/settings.json` into the VS Code Machine settings of a devcontainer, and `post-create-command.sh` runs its `write` mode. Neither is part of `setup`: a laptop has no devcontainer Machine settings, and the lockfile's skills are restored by `pnpm install`, not by the setup steps.

`session-branch-name` and `session-worktree-name` are the session-start checks behind `scripts/git/validate-session-branch-name.sh` and `validate-session-worktree-name.sh`. The branch check reads its pattern and error text from `validate-branch-name.config.cjs`, the file the pre-push hook enforces, so the two never disagree. Neither is part of `setup`: a session hook runs them, and a setup run has nothing to say about the branch or worktree it runs in.

`remote-cache` is part of `setup` on a Mac, after `software`: it asks `linode-cli` for a key that can only read the Nx cache bucket and keeps it in `~/.config/codebase/nx-shared-cache-remote.env` (mode 600, or the file `NX_SHARED_CACHE_REMOTE_ENV_FILE` names), where the session hook reads it. A machine that already has the file is left alone, and without `linode-cli` or a configured token it prints why and skips, so setup never fails on it. Stop the running shared cache server once afterwards so it starts with the key. Linux, meaning a cloud session or the devcontainer, does not run it.

Another is a long-running service rather than setup: `shared-nx-cache` serves Nx's self-hosted remote cache so every git worktree on one machine shares task outputs. It is not part of `setup`.

```bash
bash scripts/installation.sh                     # A fresh machine: the script installs Node and the packages, then calls `setup`, which takes the steps its operating system needs
nx run installation:start:setup                  # Everything this project does, in order
nx run installation:start:software               # Or one step: shell-configuration, software, environment-files, dependencies
nx run installation:start:local-services         # Start a Docker daemon where this machine can run one, then the local Postgres container
nx run installation:start:update-reui-skill      # Refresh the vendored ReUI skill (also run by the weekly upgrade-dependencies workflow)
nx run installation:installed-skills:check   # Lists locked skills whose SKILL.md is absent; `:write` restores them (postinstall runs it)
nx run installation:vscode-settings:check    # Machine settings hold every workspace key (devcontainer only; `:write` merges them)
nx run installation:start:session-branch-name    # The checked-out branch against the naming convention (the session hook's check; prints only its context)
nx run installation:start:session-worktree-name  # The linked worktree's directory name and gitignore status (the session hook's check; prints only its context)
nx run installation:start:shared-nx-cache           # Serve the local Nx remote cache in the foreground on 127.0.0.1:19750 until Ctrl+C (flags: --port, --directory)
nx run installation:start:remote-cache           # Create this machine's read-only key to the Nx cache bucket (also run by `setup` on a Mac)
nx run installation:start:software -- gitleaks trivy postgres-client   # Just these (the setup-codebase action runs it this way too)
```

## What belongs here, and what deliberately does not

The commands run on Node, so whatever installs Node cannot be one of them. These stay in one shell file, `scripts/installation.sh` (Homebrew check, nvm, Node, pnpm, nx, Husky's init file), which sources `scripts/utilities.sh`. The script runs `pnpm install` before calling `setup`, because the commands are written in the packages it installs; the `dependencies` command then runs it again, which is a no-op.

Every command spawns processes only through `ProcessRunnerService` and prints only through `ReporterService`, so a test replaces the whole machine with `testing/fake-process-runner.ts` and runs against a real temporary workspace from `testing/temporary-workspace.ts`. That workspace lives under `node_modules`, never the operating system's temporary directory: a child spawned from there cannot resolve this project's loader on Linux.

| Command                 | Module                                                                    |
| ----------------------- | ------------------------------------------------------------------------- |
| `setup`                 | `modules/setup`                                                           |
| `shell-configuration`   | `modules/shell-configuration`                                             |
| `software`              | `modules/software` (one service per tool)                                 |
| `environment-files`     | `modules/environment-files`                                               |
| `dependencies`          | `modules/dependencies`                                                    |
| `local-services`        | `modules/local-services`                                                  |
| `update-reui-skill`     | `modules/dependencies/modules/installed-skills/modules/update-reui-skill` |
| `installed-skills`      | `modules/dependencies/modules/installed-skills`                           |
| `vscode-settings`       | `modules/shell-configuration/modules/vscode-settings`                     |
| `session-branch-name`   | `modules/session-branch-name`                                             |
| `session-worktree-name` | `modules/session-worktree-name`                                           |
| `remote-cache`          | `modules/setup/modules/remote-cache`                                      |
| `shared-nx-cache`       | `modules/setup/modules/shared-nx-cache`                                   |

Codometer caps a folder at 12 entries, and `src/modules/` holds exactly 12, so a command that belongs with another nests under that module's `modules/` folder: `installed-skills` under `dependencies`, `update-reui-skill` under `installed-skills`, and `vscode-settings` under `shell-configuration`. Never raise the limit; group further into `modules/` folders instead.

`software` with names, such as `software gitleaks trivy postgres-client`, installs only those, through `modules/software/modules/tooling/software-named.service.ts`. The names are any tool installed from a release archive (`helm`, `kubectl`, `terraform`, `gitleaks`, `trivy`, `uv`), which only Linux uses, a Go linter built with `go install` from a pinned tag into `~/.local/bin` (`actionlint`, `kubeconform`, `kube-linter`, `pluto`, in `software-go-tools.service.ts`), a Helm plugin installed from a pinned tarball checked against its sha256 on Linux (`helm-unittest`, in `software-helm-plugins.service.ts`; the infrastructure `helm-test` target runs it, and no group includes it), and `postgres-client` (PostgreSQL 18's `pg_dump` and `pg_restore`), which works on both. A name may also be a project group, which stands for every tool that project's Nx targets need: `configuration` (gitleaks, Trivy, actionlint), `infrastructure` (kubeconform, kube-linter, pluto), and `persistence` (`postgres-client`). The `setup-codebase` action's inputs and the devcontainer ask for groups, never tools. They are the same installs `software` makes with no names, so a laptop, a devcontainer, and a CI runner run one version of each; the `setup-codebase` composite action runs it this way after `pnpm install`, with the software its inputs ask for. Naming software changes two things: a tool that cannot be installed fails the run instead of warning, since it was asked for, and the apt steps go through `sudo` when this is not root, as on a runner. It puts `~/.local/bin` first on `PATH`, and in `GITHUB_PATH` when that is set.

From inside Nx (`nx run installation:start:*`), `dependencies` skips `nx reset`, which would delete the workspace data of the Nx process running it; `installation.sh` runs the command with plain `node`, so the reset happens there.

`setup` asks `ProcessRunnerService.platform()` which machine it is on, so a test covers both. A Mac runs shell configuration, software, files, and dependencies. Linux, which is what a Claude Code cloud session and the devcontainer run, has no Homebrew and no shell to configure, so it runs the files, `software`, and `local-services`; `software` (with `modules/release-archives` and `modules/ssh-signing`) installs a different set there — Helm, kubectl, Terraform, gitleaks, Trivy, and uv from their release archives, Python through uv, linode-cli through `uv tool install`, squawk through pnpm, and PostgreSQL 18 from its apt repository — and on both machines it makes SSH commit signatures verifiable; the script has already run `pnpm install`.

On a Mac, `setup` configures the shell before it installs software, as the script always did, so completions for tools installed in the same run are wired the next time it runs.

`shared-nx-cache` runs a local HTTP server that implements Nx's self-hosted remote cache API (`PUT` and `GET /v1/cache/{hash}`, opaque tar archives keyed by task hash), so a task one worktree ran is a cache hit in every other. It binds to `127.0.0.1` only, never an external address, and checks a bearer token: the built-in `codebase-local-nx-cache` (not a secret, since the server is local) unless `NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN` is set, which is the variable Nx reads too. Entries are files in `~/.cache/codebase-nx-shared` (`--directory`), written atomically and never overwritten. On startup and hourly it evicts entries unused for 14 days, then the oldest while the directory exceeds 5 GiB; a read counts as use. It listens on port 19750 (`--port`), runs in the foreground until SIGINT or SIGTERM, and leaves running it in the background to the calling shell. Point Nx at it with `NX_SELF_HOSTED_REMOTE_CACHE_SERVER=http://127.0.0.1:19750`. When `NX_SHARED_CACHE_REMOTE_ENDPOINT`, `_BUCKET`, `_REGION`, `_ACCESS_KEY_ID` and `_SECRET_ACCESS_KEY` are all set, a local miss is answered from that S3-compatible bucket (objects under `nx/`, signed with `aws4fetch`) and kept locally; a bucket that is unreachable or errors reads as a miss. A stored upload is copied to the bucket only when `NX_SHARED_CACHE_REMOTE_WRITABLE` is `true`, and never over an existing object. Read-only is enforced by the bucket key's own permission, not this flag, which only saves a request that would be refused.
