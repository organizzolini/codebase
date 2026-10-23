# 0030: Install Tools From the Installation Project

Supersedes in part [ADR 0029](0029-keep-the-ci-steps-in-the-integration-project.md): its last consequence, that the tool installs in `setup-codebase` stay in YAML.

## Context

`setup-codebase` installed gitleaks and Trivy through Homebrew, behind a weekly cache of the whole Homebrew prefix, and the PostgreSQL 18 client through a block of `apt` shell. The `installation` project already installs the same three on Linux, from release archives whose checksums it verifies and from the PostgreSQL apt repository, at versions a test holds equal to the devcontainer's. So a runner ran Homebrew's latest of each tool while a developer ran the pinned one.

`installation` could not serve a runner as it was. Its apt install wrote to `/etc` directly and so required root, and a runner is not root. Its tools land in `~/.local/bin`, which a runner does not have on `PATH`. And its `software` command installs everything, where a job needs one or two tools.

## Decision

**A `tools` command of `installation` installs the tools it is named.** `tools gitleaks trivy postgres-client` installs those three through the services `software` uses, then puts `~/.local/bin` first on its own `PATH`, and in `GITHUB_PATH` when that is set. It is not CI-specific: a developer runs `nx run installation:start:tools -- trivy` the same way. `setup-codebase` runs it right after `pnpm install`, naming the tools its inputs ask for, in place of its Homebrew and PostgreSQL steps and the Homebrew cache.

**The apt install runs as root or through `sudo`.** It writes the source and the key to a scratch location and installs them with `install -m 644`, so the one path serves root in a container and a runner's user alike.

**A tool that cannot be installed fails the run.** `software` warns, so a developer's setup that has its Node toolchain is not stopped by one unreachable download. A tool asked for by name has nothing to fall back on, and failing at the install names the cause where a later step would not. After the PostgreSQL install the command also checks that `pg_dump` resolves to 18, as the step it replaces did.

## Consequences

- A runner, a devcontainer, and a laptop install one version of gitleaks, Trivy, and the PostgreSQL client. Bumping one is a change to the release archive constants.
- The jobs that ask for these tools download them on every run: gitleaks and Trivy are archives of a few megabytes to about fifty, with no cache. The Homebrew prefix cache is gone.
- The tools are installed after the dependencies, not before, so a job that skips the install gets none of them.
