---
type: "Reference"
title: "CI/CD Pipelines"
openwiki_generated: true
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
  - id: openwiki-source-70c07817764b8e76381afb35
    resource: repo://configuration/repository/release.config.cjs
  - id: openwiki-source-cbacafef122fab5636a5e673
    resource: repo://documentation/development/release-process.md
generated: { by: "claude-code", at: "2026-11-22T00:18:20.862Z" }
verified:
  - by: openwiki/0.9.0
    at: 2026-11-22T00:18:20.862Z
---


# CI/CD Pipelines

This page documents the GitHub Actions workflows that form the CI/CD pipeline, the `setup-codebase` composite action that prepares every job, and the fully automated release process that runs on merge to `main`.

## Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Continuous Integration** | Push to `main`, PRs, merge queue | Lint, typecheck, test, build, security scan |
| **Continuous Deployment** | Push to `main`, devcontainer changes | Build devcontainer, release & publish packages |
| **Continuous Compliance** | Issues, PRs, merge queue, weekly schedule | Governance, commit conventions, issue metadata |

All workflows share the `setup-codebase` composite action for environment preparation and the `cleanup-codebase` action for cache persistence.

---

## setup-codebase Composite Action

**Location**: `.github/actions/setup-codebase/action.yml`

The `setup-codebase` action is a composite action that every CI job calls first. It installs tooling, restores caches, and configures the Nx workspace. Every optional step is gated by an input so a job pays only for what it uses.

### Key Responsibilities

1. **Package manager setup** — Installs the pnpm version pinned in `package.json`'s `packageManager` field via a cached `pnpm/action-setup` invocation (see `setup-pnpm` action).
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
12. **Node dependencies install** — Runs `pnpm install --frozen-lockfile` (skippable).
13. **Push-base bounding** — On CI pushes with `nx-base: push-before`, runs `bound-base-to-push` to ensure the base is an ancestor of HEAD.
14. **PR cache import** — On merge group runs, imports the PR's Nx cache from an artifact.
15. **Task database verification** — Discards corrupt databases from cancelled saves before first task runs.
16. **Task database adoption** — Renames restored database to current runner's machine ID so Nx reads it.

### Outputs

- `nx-cache-primary-key`: The exact-match cache key computed for this job (pass to `cleanup-codebase`).
- `nx-cache-scope`: The scope this job used (pass to `cleanup-codebase` for artifact naming).

---

## Continuous Integration Workflow

**File**: `.github/workflows/continuous-integration.yml`

### Triggers

- Push to `main`
- Pull requests (opened, reopened, synchronize, ready_for_review)
- Merge group
- Manual dispatch (with `verbose` input)

### Concurrency

- Group: `${{ workflow }}-${{ ref == main && sha || ref }}`
- Cancel in-progress for non-main refs

### Permissions

- `actions: read`, `contents: write`, `pull-requests: write`, `issues: write`

### Job Matrix (17 legs)

| Target | Name | Emoji | Notes |
|--------|------|-------|-------|
| `static-code` | Static | 🧑‍⚕️ | `typecheck-code`, `format-code`, `lint-code` and `deprecate-code` in one `nx affected` call |
| `guard-code` | Guard | 💂 | `catalog-manifests`, `coinagerie-check`, `lockfile`, `project-ports`, `readme-projects`, `vscode-extensions` (kept equal to `guard-code`'s `dependsOn` in `nx.json`, less the gates with legs below) |
| `callidescope-restrict` | Callidescope Restrict | 🔭 | Call-stack depth and breadth gate |
| `codependix-bound` | Codependix Bound | 🕸️ | Dependency boundary gate |
| `conformetry-validate` | Conformetry Validate | 👔 | The one leg that also asks the affected run to include conformetry templates |
| `test-code` | Test Codebase, Test Common, Test Affirmancy, Test Caelundas, Test IC Suite, Test Lexico, Test Meanderaw | 🧑‍🔬 | One leg per project group (see below); Caelundas has a 15-minute timeout |
| `secure-code` | Secure | 🕵️ | Gitleaks and Trivy scanning |
| `build-projects` | Build | 👷 | Build plus the codometer size gate |
| `end-to-end` | End to End IC Suite | 🤵 | Packs the five CLIs and four Nx plugins and runs them as a consumer would |
| `plan-terraform` | Infrastructure | 🧑‍🚀 | Plans the OpenRouter, GitHub and Linode roots when Terraform changed, and comments the plans |
| `build-devcontainer` | Devcontainer | 🧑‍🏭 | Builds and tests the devcontainer image when its inputs changed (15-minute timeout) |

Legs time out after 12 minutes unless they set `timeout-minutes`.

### Test Sharding Strategy

The test suite is split into one parallel leg per project group so no single leg waits for slow projects:

| Leg | Projects included |
|-----|-------------------|
| **Test Codebase** | Everything not in another leg (new projects stay here until split out) |
| **Test Common** | `projects/common/**` (installs the Postgres client) |
| **Test Affirmancy** | `projects/affirmancy/**` |
| **Test Caelundas** | `projects/caelundas/**` |
| **Test IC Suite** | `projects/ic-suite/**` |
| **Test Lexico** | `projects/lexico/**` (installs the Postgres client) |
| **Test Meanderaw** | `projects/meanderaw/**` |

A leg with nothing affected runs nothing.

### Key Steps

1. **Skip Conditionally** — Avoids redundant runs for the same PR by checking for newer workflow runs.
2. **Checkout Repository** — Full history (`fetch-depth: 0`) for Nx affected.
3. **Setup Codebase** — Composite action with granular cache/toggle inputs per matrix leg.
4. **Run Check** — Executes `nx affected` with the target; `guard-code` includes conformetry templates when changed files touch `configuration/conformetry-templates/`.
5. **Report Integration** — Uploads results for build, typecheck, and test targets on main and PRs.
6. **Cleanup Codebase** — Saves Nx cache (skipped on merge group), exports PR cache as artifact on PR runs.

---

## Continuous Deployment Workflow

**File**: `.github/workflows/continuous-deployment.yml`

### Triggers

- Push to `main`
- Pull requests touching `.devcontainer/**`, `.env.default`, `infrastructure/docker/docker-compose.yml`, `package.json`, or this workflow
- Manual dispatch

### Concurrency

- Group: `${{ workflow }}-${{ ref }}`
- Cancel in-progress only for pull requests (never cancel a release run)

### Permissions

- `contents: write`, `packages: write`, `issues: write`, `pull-requests: write`
- `id-token: write` (for npm provenance attestations)
- `attestations: write`, `artifact-metadata: write` (for build-provenance attestations and Linked artifacts)

### Job Matrix (3 targets)

| ID | Name | Emoji | Timeout | Purpose |
|----|------|-------|---------|---------|
| `build-devcontainer` | Devcontainer | 🧑‍🏭 | 20m | Build and test the devcontainer image |
| `push-releases` | Releases | 🦸 | 32m | Full release automation (version, tag, publish, attest) |
| `apply-terraform` | Infrastructure | 🏗️ | 20m | Applies the Terraform roots (openrouter, linode, github) when a push to `main` changes `infrastructure/terraform/**` |

### Devcontainer Build (🧑‍🏭)

1. **Skip Conditionally** — Checks if changed files match devcontainer-relevant patterns (`.devcontainer/**`, `.env.default`, `docker-compose.yml`, workflow file, or `packageManager` pin). If 300+ files changed, builds rather than guessing.
2. **Setup Environment** — Copies `.env.default` to `.env`, adds `LOCAL_WORKSPACE_FOLDER`.
3. **Docker Buildx** — Sets up multi-platform builder.
4. **Login to GHCR** — Uses `GITHUB_TOKEN`.
5. **Build Image** — Uses `devcontainers/ci@v0.3` with cloud config; pushes to `ghcr.io/organizzolini/codebase-devcontainer` only on push/workflow_dispatch to `main`.
6. **Test Image** — Runs `.devcontainer/scripts/test-devcontainer.sh` inside the built image (never pushes).

### Release Automation (🦸)

The release runs entirely on merge to `main`. When `main` moves during a release run, the run steps aside: later steps skip (`RELEASE_SUPERSEDED`) and the newer commit's run releases everything.

#### Release Steps

1. **Setup Codebase**, **Import GPG Key** and **Check Commit Signing Configuration** — the release signs its commits.
2. **🏷️ Version Packages** — `deployment version-packages` versions the ic-suite packages with Nx Release and writes their changelogs, uncommitted, before the build so npm gets the build of the published manifest.
3. **👷 Build Projects** — `nx run-many --target=build`.
4. **Regenerate committed output on the default branch** — 🔭 Trace Calls (`configuration:callidescope:write`), 🕸️ Graph Dependencies (`configuration:codependix:write`), 👔 Inventory Generators (`conformetry-generators` write), 🔗 Synchronize (conventional config, devcontainer configuration, pull request template, skill exclusions), 📊 Measure Code (codometer write for every project and the workspace), 🪙 Coin Vocabulary (`coinagerie-check` write).
5. **🔖 Tag Codebase** — semantic-release versions and tags the codebase itself and creates the `v*` release the README badge shows (never an ic-suite package); its one `chore(release): 🔖 tag codebase` commit also carries the package versions and changelogs the version step wrote.
6. **🔖 Tag Packages** — tags each newly versioned package `<project>@<version>` on the release commit and pushes the tags.
7. **📦 Publish Packages** — publishes each released package to npm with provenance and to GitHub Packages under the owner's scope; a re-run completes a run that stopped partway.
8. **🔗 Link Packages** and **🔏 Attest Packages** — lists each npm package on the organization's Linked artifacts page and attests builds with `actions/attest` for the tarballs this run published.
9. **🧹 Cleanup Codebase** — saves the Nx cache.

The `deployment` project's commands (`version-packages`, `tag-codebase`, `tag-packages`, `publish-packages`, `link-packages`) own the logic; the workflow only orders them.

#### Two Versioning Systems

Nx Release owns independent ic-suite package versions (tagged `<project>@<version>` with per-package `CHANGELOG.md`), while semantic-release owns the single codebase version (tagged `v<version>`, shown in the README badge).

---

## Continuous Compliance Workflow

**File**: `.github/workflows/continuous-compliance.yml`

### Triggers

- Push to `main`
- Issues (opened, reopened, unassigned, edited, labeled, unlabeled)
- Pull requests (opened, reopened, synchronize, edited, labeled, unlabeled, assigned, unassigned, ready_for_review)
- Merge group (checks_requested)
- Weekly schedule (Friday 8:18am New York time: 12:18 UTC in summer, 13:18 UTC in winter)
- Manual dispatch

### Concurrency

- Per-event-group; cancels in-progress for PRs

### Permissions

- `contents: read`, `issues: write`, `pull-requests: write`

### Jobs

#### 🧑‍💼 Issue

Runs on issue events, schedule, and manual dispatch (not dependabot).

1. **Checkout**, **Setup pnpm**, **Setup Node**
2. **Install Root Dependencies** — Only root, `synchronization...`, `validation...` (no Nx graph).
3. **Reconcile Issue Labels** — On `issues.opened` only; applies required labels from issue body.
4. **Ensure Issue Assignee** — Defaults unassigned issues to repository owner.
5. **Ensure Open Issues Have Assignees** — On schedule/manual, sweeps all open unassigned issues.
6. **Audit Single Issue Metadata** — On issue events, validates the issue's metadata.
7. **Audit All Open Issues Metadata** — On schedule/manual, sweeps all open issues and hierarchy relationships.

#### 👮 Enforce

Runs on push, merge group, schedule, manual, and non-draft PRs (includes dependabot).

1. **Checkout**, **Setup pnpm**, **Setup Node**
2. **Install Root Dependencies** — Same minimal filter.
3. **Audit Repository Governance** — Validates `CODEOWNERS` rules and workflow security.

#### 🧑‍⚖️ Comply

Runs on PR events, merge group, and non-draft PRs (includes dependabot; exempts dependabot from title/body checks).

1. **Resolve Merge Group PR** — Extracts PR number/author from `gh-readonly-queue` ref.
2. **Checkout**, **Setup pnpm**, **Setup Node**
3. **Install Root Dependencies**
4. **Reconcile PR Labels** — On PR events only; syncs labels from PR title.
5. **Validate Branch Name** — On PR events; validates against Conventional Commits.
6. **Validate PR Title** — On PR and merge group; validates Conventional Commits format (exempts dependabot).
7. **Validate PR Body** — On PR and merge group; validates required template sections (exempts dependabot).
8. **Validate Release Significance** — PR title significance must match or exceed commits.
9. **Validate Commit Message** — On push to main; validates latest commit subject (exempts dependabot).
10. **Validate Merge Group Commit Message** — On merge group; validates head commit subject (skips generic "Merge pull request #" subjects; exempts dependabot).

---

## Refresh Documentation Workflow

**File**: `.github/workflows/refresh-documentation.yml`

### Triggers

- Weekly schedule (Friday 8:18am UTC)
- Manual dispatch

### Concurrency

- Per-ref; cancels in-progress

### Permissions

- `contents: write`, `pull-requests: write`

### Steps

1. **Checkout** — Full history.
2. **Setup Codebase** — With `nx-shas: false` (no Nx affected needed).
3. **Refresh Documentation** — Runs `nx run documentation:refresh-documentation` with OpenWiki configured for OpenRouter (`OPENWIKI_PROVIDER=openrouter`, the model from the `OPENWIKI_MODEL_ID` variable that Terraform keeps at the OpenRouter preset, 12 provider retries for a free model's rate limits, and the `OPENROUTER_API_KEY` secret).
4. **Import GPG Key** — For signed commits, after the model has finished so the key is not in the job while the model's tools run.
5. **Upsert Pull Request** — Creates or updates a signed PR on the `docs/documentation-refresh` branch, adding only `documentation/openwiki/**`, `AGENTS.md` and the workflow file.

---

## Upgrade Dependencies Workflow

**File**: `.github/workflows/upgrade-dependencies.yml`

### Triggers

- Weekly schedule (Friday 8:18am UTC)
- Manual dispatch

### Concurrency

- Per-ref; cancels in-progress

### Permissions

- `contents: write`, `pull-requests: write`

### Steps

1. **Checkout**
2. **Setup Codebase** — With `nx-shas: false`.
3. **Upgrade Dependencies** — Runs `integration/src/integration.main.ts upgrade-dependencies` which upgrades in sequence: pnpm, Node, Python, lockfile, Python dependencies, skills, Impeccable. Failed upgrades are undone; rest continue. Outputs `has_dependency_updates` and `body_path`.
4. **Import GPG Key** — If upgrades found.
5. **Open Pull Request** — Creates PR on `chore/dependencies-upgrade` with required labels (`dependencies`, `automated`, `type:chore`, `scope:dependencies`, `source:agent`) and assignee.

---

## Related Pages

- [Release Process](../workflows/release.md) — Detailed release automation documentation
- [Code Quality Gates](../workflows/code-quality.md) — IC-Suite quality gates integrated into CI
- [Development Workflow](../workflows/development.md) — Agent development workflow
- [Infrastructure](../architecture/infrastructure.md) — Infrastructure and devcontainer details
