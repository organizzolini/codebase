# 0030: Let Software Install Named Tools

Supersedes in part [ADR 0029](0029-keep-the-ci-steps-in-the-integration-project.md): its last consequence, that the tool installs in `setup-codebase` stay in YAML.

## Context

`setup-codebase` installed gitleaks and Trivy through Homebrew, behind a weekly cache of the whole Homebrew prefix, and the PostgreSQL 18 client through a block of `apt` shell. The `installation` project's `software` command already installs the same three on Linux, from release archives whose checksums it verifies and from the PostgreSQL apt repository, at versions a test holds equal to the devcontainer's. So a runner ran Homebrew's latest of each tool while a developer ran the pinned one.

`software` could not serve a runner as it was. It installs everything, where a job needs one or two tools. Its apt install wrote to `/etc` directly and so required root, and a runner is not root. Its tools land in `~/.local/bin`, which a runner does not have on `PATH`.

## Decision

**`software` installs just the software it is named.** `software gitleaks trivy postgres-client` installs those through the services `software` already uses, then puts `~/.local/bin` first on its own `PATH`, and in `GITHUB_PATH` when that is set. With no names it does what it always did. The names are any tool installed from a release archive, which only Linux uses, and `postgres-client`, which works on both. A separate command for this was tried and dropped: a runner, a devcontainer, and a laptop install the same software, and "tools" covers everything `software` installs. `setup-codebase` runs it right after `pnpm install`, naming what its inputs ask for, in place of its Homebrew and PostgreSQL steps and the Homebrew cache.

**The apt install runs as root or through `sudo`.** It writes the source and the key to a scratch location and installs them with `install -m 644`, so the one path serves root in a container and a runner's user alike.

**Naming software makes a failure fail the run.** With no names, `software` warns, so a developer's setup that has its Node toolchain is not stopped by one unreachable download. Software asked for by name has nothing to fall back on, and failing at the install names the cause where a later step would not. After the PostgreSQL install the command also checks that `pg_dump` resolves to 18, as the step it replaces did.

## Consequences

- A runner, a devcontainer, and a laptop install one version of gitleaks, Trivy, and the PostgreSQL client. Bumping one is a change to the release archive constants.
- The jobs that ask for this software download it on every run: gitleaks and Trivy are archives of a few megabytes to about fifty, with no cache. The Homebrew prefix cache is gone.
- The software is installed after the dependencies, not before, so a job that skips the install gets none of it.
- Naming a release archive tool on a Mac is an error that points to running `software` with no names, which installs it through Homebrew.
