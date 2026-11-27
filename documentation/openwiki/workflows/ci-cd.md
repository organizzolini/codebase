---
type: "Reference"
title: "CI/CD Pipelines"
description: "Documents the GitHub Actions workflows (continuous-integration, continuous-deployment, continuous-compliance, refresh-documentation, upgrade-dependencies), the setup-codebase and cleanup-codebase composite actions, and the fully automated release process on merge to main."
tags: ["ci-cd", "github-actions", "workflows", "release", "automation"]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-27T18:15:08.471Z
sources:
  - id: openwiki-source-021f568adb8078955fd1aacf
    resource: repo://.github/actions/cleanup-codebase/action.yml
  - id: openwiki-source-2054e2f96d012b7aac59132d
    resource: repo://.github/actions/setup-codebase/action.yml
  - id: openwiki-source-9374765e313f5ca22dd8afab
    resource: repo://.github/workflows/continuous-compliance.yml
  - id: openwiki-source-105f2705156f283beb3d513c
    resource: repo://.github/workflows/continuous-deployment.yml
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-2927a849e150cfa700d77a79
    resource: repo://.github/workflows/refresh-documentation.yml
  - id: openwiki-source-c2af95c435a3c7ffd53cfe73
    resource: repo://.github/workflows/upgrade-dependencies.yml
generated: { by: "openwiki/0.9.0", at: "2026-11-27T18:15:08.471Z" }
---

# CI/CD Pipelines

This page documents the GitHub Actions workflows that form the CI/CD pipeline, the `setup-codebase` and `cleanup-codebase` composite actions that prepare and finalize every job, and the fully automated release process that runs on merge to `main`.

## Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Continuous Integration** | Push to `main`, PRs, merge queue | Lint, typecheck, test, build, security scan |
| **Continuous Deployment** | Push to `main`, devcontainer changes | Build devcontainer, release & publish packages, apply infrastructure |
| **Continuous Compliance** | Issues, PRs, merge queue, weekly schedule | Governance, commit conventions, issue metadata |
| **Refresh Documentation** | Weekly schedule (Friday 8:18am UTC), manual | Refresh repository documentation via OpenWiki |
| **Upgrade Dependencies** | Weekly schedule (Friday 8:18am UTC), manual | Upgrade dependencies and open a signed PR |

All workflows share the `setup-codebase` composite action for environment preparation and the `cleanup-codebase` action for cache persistence.

---

## setup-codebase Composite Action

**Location**: `.github/actions/setup-codebase/action.yml`

The `setup-codebase` action is a composite action that every CI job calls first. It installs tooling, restores caches, and configures the Nx workspace. Every optional step is gated by an input so a job pays only for what it uses.

### Key Responsibilities

1. **Package manager setup** — Installs the pnpm version pinned in `package.json`'s `packageManager` field via a cached `pnpm/action-setup` invocation.
2. **Node.js setup** — Installs the Node version from `.nvmrc` with pnpm cache.
3. **Nx SHAs resolution** — Runs `nrwl/nx-set-shas@v5` to compute `NX_BASE` and `NX_HEAD` for `nx affected`. The `nx-base` input controls the base strategy:
   - `last-successful` (default): Uses the last commit whose whole workflow succeeded.
   - `push-before`: Uses the push's own previous tip (for CI runs).
4. **Tool binaries cache** — `gitleaks` (secret scanning) and `trivy` (infrastructure scanning) are single binaries the repository's `software` command downloads into `~/.local/bin`, cached by tool selection. Only the security gate enables them.
5. **PostgreSQL 18 client** — Installs `pg_dump`/`pg_restore` through the same `software` command for the legs that run database integration tests (`postgres-client` input).
6. **Nx graph cache** — Restores `.nx/workspace-data` (excluding task database) keyed by lockfile and project config hashes.
7. **Nx task cache** — Restores `.nx/cache` and `.nx/workspace-data/*.db*` per `nx-cache-scope`. Exact-match key includes `github.sha`; restore-keys fall back to scope+OS and scope-only.
8. **uv setup** — Installs uv with cache keyed by `configuration/python/uv.lock`.
9. **Python dependencies** — Runs `uv sync --frozen --project configuration/python` into shared root `.venv` (used by `yaml-lint` and `sqlfluff` on every TypeScript project).
10. **ESLint cache** — Restores `.eslintcache` for the lint job.
11. **node-gyp permissions repair** — Fixes executable bit on bundled `gyp_main.py` to avoid intermittent `Permission denied` during native builds.
11. **Node dependencies install** — Runs `pnpm install --frozen-lockfile` (skippable).
12. **Start Nx Shared Cache** — Seeds session and starts self-hosted remote cache server for trusted runs.
13. **Push-base bounding** — On CI pushes with `nx-base: push-before`, runs `bound-base-to-push` to ensure the base is an ancestor of HEAD.
14. **PR cache import** — On merge group runs, imports the PR's Nx cache from an artifact.
15. **Task database verification** — Discards corrupt databases from cancelled saves before first task runs.
16. **Task database adoption** — Renames restored database to current runner's machine ID so Nx reads it.

### Outputs

- `nx-cache-primary-key`: The exact-match cache key computed for this job (pass to `cleanup-codebase`).
- `nx-cache-scope`: The scope this job used (pass to `cleanup-codebase` for artifact naming).

### Inputs

| Input | Default | Purpose |
|-------|---------|---------|
| `gitleaks` | `false` | Install gitleaks for secret scanning |
| `install` | `true` | Install node dependencies with pnpm |
| `nx-cache` | `true` | Restore and save the Nx task cache |
| `nx-cache-scope` | `${{ github.job }}` | Partition key for Nx task cache |
| `nx-graph-cache` | `true` | Restore and save the Nx project graph |
| `nx-shas` | `true` | Resolve NX_BASE and NX_HEAD |
| `nx-base` | `last-successful` | Base strategy for push events |
| `python-dependencies` | `true` | Sync uv workspace into shared `.venv` |
| `postgres-client` | `false` | Install PostgreSQL 18 client tools |
| `trivy` | `false` | Install trivy for infrastructure scanning |
| `terraform` | `false` | Install terraform |
| `eslint-cache` | `false` | Restore and save ESLint cache |
| `uv` | `true` | Install uv (required for yaml-lint, sqlfluff) |

---

## cleanup-codebase Composite Action

**Location**: `.github/actions/cleanup-codebase/action.yml`

Saves whatever progress a job made, even one a timeout or a cancellation cut short. Call this as a job's last step with `if: always()`, passing the `nx-cache-primary-key` `setup-codebase` output through. `setup-codebase` only restores the Nx task cache now, never saves it — a job that skips this action gets no save at all.

### Key Responsibilities

1. **Cleanup codebase** — Runs `integration:cleanup-codebase` to discard damaged task databases from cancelled runs.
2. **Share Nx cache with merge group** — Uploads Nx cache as a workflow artifact for the merge group to import (3-day retention).
3. **Save Nx cache** — Saves `.nx/cache` and `.nx/workspace-data/*.db*` to the cache service using the exact-match key.
4. **Save ESLint cache** — Saves `.eslintcache` when requested.

### Inputs

| Input | Default | Purpose |
|-------|---------|---------|
| `nx-cache` | `true` | Save the Nx task cache |
| `nx-cache-primary-key` | — | Exact-match key from `setup-codebase` output |
| `nx-cache-scope` | — | Scope for artifact naming |
| `nx-cache-artifact` | `false` | Upload cache as artifact for merge group |
| `eslint-cache` | `false` | Save ESLint cache |

---

## Continuous Integration Workflow

**File**: `.github/workflows/continuous-integration.yml`

### Triggers

- Push to `main`
- Pull requests (opened, reopened, synchronize, ready_for_review)
- Merge group
- Manual dispatch (with `verbose` input)

### Concurrency

- Group: `${{ github.workflow }}-${{ github.ref == 'refs/heads/main' && github.sha || github.ref }}`
- Cancel in-progress for non-main refs

### Permissions

- `actions: read`, `contents: write`, `packages: read`, `pull-requests: write`, `issues: write`

### Job Matrix (19 Legs)

The workflow runs a matrix of 19 legs, each with its own Nx target(s), timeout, and optional inputs:

| Leg | Emoji | Target(s) | Timeout | Special Inputs |
|-----|-------|-----------|---------|----------------|
| **Static** | 🧑‍⚕️ | `static-code` (typecheck-code, format-code, lint-code, deprecate-code) | 12m | `eslint-cache: true`, `terraform: true` |
| **Guard** | 💂 | `guard-code` (agent-instructions, catalog-manifests, coinagerie-check, lockfile, project-ports, pull-request-template, readme-projects, skill-descriptions, typeorm-migration-sql, vscode-extensions) | 12m | — |
| **Callidescope Restrict** | 🔬 | `callidescope-restrict` | 12m | — |
| **Codependix Bound** | 🕸️ | `codependix-bound` | 12m | — |
| **Diagram Entity Relationships** | 🗃️ | `erd` | 12m | — |
| **Codometer Limit** | ⏲️ | `codometer-limit` | 12m | — |
| **Conformetry Validate** | 👔 | `conformetry-validate` | 12m | `INCLUDE_TEMPLATES: true` |
| **Test Codebase** | 🧑‍🔬 | `test-code` (excludes affirmancy, caelundas, ic-suite, lexico, meanderaw, common) | 12m | `postgres-client: false` |
| **Test Common** | 🧑‍🔬 | `test-code` (only projects/common/**) | 12m | `postgres-client: true` |
| **Test Affirmancy** | 🧑‍🔬 | `test-code` (only projects/affirmancy/**) | 12m | — |
| **Test Caelundas** | 🧑‍🔬 | `test-code` (only projects/caelundas/**) | 15m | — |
| **Test IC Suite** | 🧑‍🔬 | `test-code` (only projects/ic-suite/**) | 12m | — |
| **Test Lexico** | 🧑‍🔬 | `test-code` (only projects/lexico/**) | 12m | `postgres-client: true` |
| **Test Meanderaw** | 🧑‍🔬 | `test-code` (only projects/meanderaw/**) | 12m | — |
| **Secure** | 🕵️ | `secure-code` | 12m | `gitleaks: true`, `trivy: true` |
| **Build** | 👷 | `build-projects` | 12m | `python-dependencies: false`, `uv: false`, `continue-on-error: true` |
| **End to End IC Suite** | 🤵 | `end-to-end` | 12m | `python-dependencies: false`, `uv: false` |
| **Infrastructure** | 🧑‍🚀 | `plan-terraform` | 12m | `terraform: true`, `python-dependencies: false`, `uv: false` |
| **Devcontainer** | 🧑‍🏭 | `build-devcontainer` | 15m | — |

### Key Behaviors

- **Conditional skipping**: Terraform and Devcontainer legs skip when no relevant files changed. A newer PR run cancels the previous one.
- **Nx affected**: Uses `integration:run-affected` with `--parallel=4`, selecting targets by their inputs. Conformetry templates require `INCLUDE_TEMPLATES` because `.nxignore` hides them.
- **Merge group**: Restores `main`'s caches, saves none, and imports the PR's cache from the artifact uploaded by the PR run.
- **Reporting**: The `report-integration` composite action reports outcomes for build, static, and test legs on PRs and main.

### Nx Cache Configuration

- Shared remote cache bucket configured via repository variables and secrets
- PRs and non-main manual runs get read-only access; main and trusted runs get read-write
- Cache scope includes the target name and shard (e.g., `continuous-integration-test-code-codebase`)

---

## Continuous Deployment Workflow

**File**: `.github/workflows/continuous-deployment.yml`

### Triggers

- Push to `main`
- Manual dispatch

### Concurrency

- Group: `${{ github.workflow }}-${{ github.ref }}`
- **Never cancels** in-progress runs (releases and applies queue per ref)

### Permissions

- `contents: write`, `packages: write`, `issues: write`, `pull-requests: write`, `id-token: write`, `attestations: write`, `artifact-metadata: write`

### Job Matrix (3 Targets)

| Target | Emoji | Timeout | Purpose |
|--------|-------|---------|---------|
| **build-devcontainer** | 🧑‍🏭 | 20m | Build and publish devcontainer image to GHCR |
| **push-releases** | 🦸 | 32m | Version, build, tag, publish packages; regenerate committed output |
| **apply-terraform** | 🏗️ | 20m | Apply OpenRouter Terraform when changed |

### Devcontainer Build (build-devcontainer)

Conditionally built only when relevant files change (`.devcontainer/`, `.env.default`, workflow file, `docker-compose.yml`, or `packageManager` in `package.json`). Uses `devcontainers/ci@v0.3` with Buildx, caches from `ghcr.io/organizzolini/codebase-devcontainer:latest`, pushes only on `main` push or workflow_dispatch, and runs tests inside the built image.

### Release Automation (push-releases)

This is the core release job. It implements the full automated release process described in [Release Process](../workflows/release.md) and `deployment/documentation/release-process.md`.

#### Steps

1. **Supersession check** — Before any work, queries GitHub API to see if `main` has advanced beyond this commit. If so, sets `skip=true` and exits. The newer commit's run will release everything.

2. **Checkout** — Full history, no persisted credentials.

3. **Setup codebase** — With `nx-shas: true`, `nx-base: push-before`, Python dependencies, uv.

4. **Import GPG key** — For signing release commits and tags.

5. **Check commit signing configuration** — Verifies git signing is configured.

6. **Version Packages** — Runs `deployment:version-packages` (Nx release) to determine and write each ic-suite package's version from conventional commits, prepend to each package's `CHANGELOG.md`, without committing. If `main` moves during the run, later steps detect it and set `RELEASE_SUPERSEDED=true`, causing all subsequent steps to skip.

7. **Build Projects** — `nx run-many --target=build` (skipped if superseded).

8. **Regenerate committed output** (all skipped if superseded):
   - **Trace Calls** — `nx run configuration:callidescope:write`
   - **Graph Dependencies** — `nx run configuration:codependix:write`
   - **Diagram Entity Relationships** — `nx affected --target=erd --configuration=write`
   - **Synchronize** — Runs `agent-instructions`, `conventional-config`, `devcontainer-configuration`, `pull-request-template`, `skill-exclusions` with `--configuration=write`
   - **Measure Code** — `nx run-many --target=codometer-weigh --configuration=write` and `nx run configuration:codometer:write`
   - **Coin Vocabulary** — `nx run-many --target=coinagerie-check --configuration=write`

9. **Tag Codebase** — Runs `deployment:tag-codebase` (semantic-release). This:
   - Analyzes commits since last release to determine version bump
   - Generates release notes grouped by gitmoji sections
   - Updates root `CHANGELOG.md`, `README.md`, `package.json`, `pnpm-lock.yaml`
   - Commits all version-bumped files (including package versions/changelogs from step 6) as `chore(release): 🔖 tag codebase <version>`
   - Tags the commit `v<version>` and creates GitHub release

10. **Tag Packages** — Runs `deployment:tag-packages`:
    - Tags each newly versioned ic-suite package as `<project>@<version>` on the release commit
    - Pushes tags six at a time (GitHub rejects >6 refs per push), retries up to 3 times
    - If no codebase release occurred (e.g., `scope:no-release`), commits package versions separately as `chore(release): 🔖 tag packages`

11. **Publish Packages** — Runs `deployment:publish-packages`:
    - `pnpm -r publish --provenance` publishes every package in the Nx release group whose version is not on npm yet
    - Each gets an npm provenance attestation linking to the commit and workflow run
    - Mirrors to GitHub Packages under `@organizzolini/<package>` scope

12. **Link Packages** — Runs `deployment:link-packages`:
    - Creates storage records on the organization's Linked artifacts page for each npm package
    - Names npm as registry, links npmjs.com page, SHA-256 of tarball, this repository
    - Marks versions published in this run for attestation

13. **Attest Packages** — Uses `actions/attest@v4` to create GitHub build-provenance attestations for each npm tarball this run published.

14. **Cleanup Codebase** — Saves Nx cache for the next release run.

### Infrastructure Apply (apply-terraform)

Runs on push to `main` when Terraform files changed, or on workflow_dispatch. Applies three Terraform roots in order: `openrouter` (first, GitHub root reads its outputs), `linode`, `github`. State stored in Linode bucket with no locking; the workflow's per-ref concurrency group prevents overlapping applies.

---

## Continuous Compliance Workflow

**File**: `.github/workflows/continuous-compliance.yml`

### Triggers

- Push to `main`
- Issues (opened, reopened, unassigned, edited, labeled, unlabeled)
- Pull requests (opened, reopened, synchronize, edited, labeled, unlabeled, assigned, unassigned, ready_for_review)
- Merge group (checks_requested)
- Weekly schedule: Friday 12:18 UTC (8:18am NYC EDT / 13:18 UTC EST)
- Manual dispatch

### Concurrency

- Group: `${{ github.workflow }}-${{ github.event_name == 'pull_request' && github.head_ref || (github.ref == 'refs/heads/main' && github.sha || github.run_id) }}`
- Cancel in-progress for PRs

### Permissions

- `contents: read`, `issues: write`, `pull-requests: write`

### Jobs

| Job | Name | Trigger | Purpose |
|-----|------|---------|---------|
| **issue** | 🧑‍💼 Issue | Issues, schedule, manual | Validates issue metadata, types, hierarchy, release significance; labels and assigns |
| **enforce** | 👮 Enforce | PRs, merge group | Repository governance and workflow security; runs before a change lands |
| **comply** | 🧑‍⚖️ Comply | PRs, merge group | Pull request metadata and commit message conventions |

All three jobs use the `compliance` CLI (Node.js) which runs directly without Nx cache or full dependency install. They install only the compliance project and its dependencies.

---

## Refresh Documentation Workflow

**File**: `.github/workflows/refresh-documentation.yml`

### Triggers

- Weekly schedule: Friday 8:18am UTC (cron: `18 8 * * 5`)
- Manual dispatch

### Concurrency

- Group: `${{ github.workflow }}-${{ github.ref }}`
- Cancel in-progress: true

### Permissions

- `contents: write`, `pull-requests: write`

### Configuration

Uses OpenWiki with OpenRouter provider:
- `OPENWIKI_PROVIDER=openrouter`
- `OPENWIKI_MODEL_ID` from repository variable
- `OPENROUTER_API_KEY` from secret
- `OPENWIKI_MAX_OUTPUT_TOKENS=16384`
- `OPENWIKI_PROVIDER_RETRY_ATTEMPTS=12` (free models allow 20 req/min; retries outlast a spent minute)
- `OPENWIKI_TELEMETRY_DISABLED=true`
- `OPENROUTER_SESSION_ID` groups requests in OpenRouter Sessions view

### Steps

1. **Checkout** — Full history (`fetch-depth: 0`)
2. **Setup Codebase** — With `nx-shas: false` (no Nx affected needed)
3. **Refresh Documentation** — Runs `nx run documentation:refresh-documentation`. The command retries rate-limited runs, writes attempts to job summary, outputs `wiki-changed` (false when only bookkeeping files changed).
4. **Import GPG Key** — If `wiki-changed != 'false'`, imports GPG key for signed commits.
5. **Upsert Pull Request** — If `wiki-changed != 'false'`, creates/updates PR on `docs/documentation-refresh` branch with signed commits, title `docs(documentation): 📝 refresh`, auto-deletes branch on merge.

### Notes

- Read-only Nx cache access (scheduled run has no reason to write what `main` reads)
- 360-minute timeout (6 hours) for large documentation refreshes

---

## Upgrade Dependencies Workflow

**File**: `.github/workflows/upgrade-dependencies.yml`

### Triggers

- Weekly schedule: Friday 8:18am UTC (cron: `18 8 * * 5`)
- Manual dispatch

### Concurrency

- Group: `${{ github.workflow }}-${{ github.ref }}`
- Cancel in-progress: true

### Permissions

- `contents: write`, `pull-requests: write`

### Steps

1. **Checkout**
2. **Setup Codebase** — With `nx-shas: false`
3. **Upgrade Dependencies** — Runs `integration:upgrade-dependencies` which:
   - Upgrades pnpm, Node, Python, lockfile, Python dependencies, skills in turn
   - A failed upgrade is undone and the rest still run
   - PR body lists what was skipped
   - Job fails only when an undo fails
   - Outputs `has_dependency_updates` and `body_path`
4. **Import GPG Key** — If updates exist
5. **Open Pull Request** — If updates exist:
   - Branch: `chore/dependencies-upgrade`
   - Commit message: `chore(dependencies): ⬆️ upgrade`
   - Title: `chore(dependencies): ⬆️ upgrade`
   - Labels: `dependencies`, `automated`, `type:chore`, `scope:dependencies`, `source:agent` (required by Comply)
   - Assignee: `JimmyPaolini`
   - Signed commits with imported GPG key

### Notes

- 45-minute timeout
- The pre-commit hook runs every check on all ~58 projects, taking ~20 minutes

---

## Release Process

The release process is fully automated on merge to `main`. It uses two versioning systems:

- **Nx release** owns independent ic-suite package versions (tagged `<project>@<version>`, each with its own `CHANGELOG.md` inside the package)
- **semantic-release** owns the single codebase version (tagged `v<version>`, creates GitHub releases shown in the README badge)

See [Release Process](../workflows/release.md) and `deployment/documentation/release-process.md` for complete details.

### Key Properties

1. **Single release commit** — The semantic-release commit (`chore(release): 🔖 tag codebase <version>`) carries the package versions and changelogs from Nx release, so a release lands as one commit after the change itself.

2. **Supersession handling** — If `main` advances during the run, later steps detect it and skip (`RELEASE_SUPERSEDED`), so the newer commit's run releases everything.

3. **Provenance and attestations** — Every npm publish includes provenance; GitHub build-provenance attestations are created for packages published in the run.

4. **GitHub Packages mirror** — Each package is mirrored to `@organizzolini/<package>` on GitHub Packages (requires GitHub token to install).

5. **Linked artifacts** — Every version on npm gets a storage record on the organization's Linked artifacts page.

6. **New publishable packages** — Need `"version": "0.0.0"` added to `package.json` by hand (conformetry templates omit `version` since Nx owns it once released).

---

## Related Documentation

- [Release Process](../workflows/release.md) — Detailed release automation documentation
- [Development Workflow](../workflows/development.md) — Local development and PR workflow
- [Code Quality](../workflows/code-quality.md) — Linting, formatting, typechecking
- [Infrastructure](../architecture/infrastructure.md) — Terraform, devcontainer, deployment architecture
- [Local Development](../operations/local-development.md) — Running workflows locally
