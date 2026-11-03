---
type: "Reference"
title: "Release Process"
description: "Documents the fully automated release pipeline on merge to main: Nx release determines ic-suite package versions from conventional commits, semantic-release bumps root version and creates GitHub release, packages are tagged and published to npm with provenance, then mirrored to GitHub Packages. Explains the dual versioning scheme (per-package + root)."
tags: ["release", "workflow", "nx-release", "semantic-release", "npm", "github-packages"]
sources:
  - id: openwiki-source-57b81e54d1113287ebfdf6f8
    resource: repo://.github/CONTRIBUTING.md
  - id: openwiki-source-105f2705156f283beb3d513c
    resource: repo://.github/workflows/continuous-deployment.yml
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-8b3afa19acb17914a58dded3
    resource: repo://configuration/release.config.cjs
  - id: openwiki-source-97a6b16797389e96d8f2c425
    resource: repo://documentation/adr/0016-inline-logger-into-published-packages.md
  - id: openwiki-source-b42e459b34f258e0cbfab07f
    resource: repo://documentation/adr/0017-independent-package-versioning-with-cascading-dependents.md
  - id: openwiki-source-cbacafef122fab5636a5e673
    resource: repo://documentation/development/release-process.md
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-946ec89b1bfb69ca9e4f59aa
    resource: repo://publication/src/modules/link-packages/link-packages.service.ts
  - id: openwiki-source-b0db28b0e85226073d8f1915
    resource: repo://publication/src/modules/publish-packages/publish-packages.service.ts
  - id: openwiki-source-44d538acf37b0d483c71fdae
    resource: repo://publication/src/modules/tag-packages/tag-packages.constants.ts
  - id: openwiki-source-25f41164acd961929d3c4cbb
    resource: repo://publication/src/modules/tag-packages/tag-packages.service.ts
  - id: openwiki-source-b5468ca0b2773b8c34e743e2
    resource: repo://publication/src/modules/version-packages/version-packages.service.ts
  - id: openwiki-source-becef891dbc56230c5b6e585
    resource: repo://validation/src/modules/pull-request-release-significance/pull-request-release-significance.service.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---
# Release Process

Releases are fully automated on merge to `main`. The process runs in the **Continuous Deployment** workflow (`.github/workflows/continuous-deployment.yml`) as the **🦸 Releases** target. It coordinates Nx Release for the 29 publishable ic-suite packages and semantic-release for the single codebase version, so a release lands on `main` as one commit that carries both the root version and every package version.

## Overview

The repository operates at two distinct release tiers:

| Tier | Tool | What it versions | Tag format | Published to npm |
|------|------|------------------|------------|------------------|
| Repository root | semantic-release | Root `package.json` version | `v<version>` (e.g., `v2.34.0`) | No |
| Publishable packages | Nx Release | Each ic-suite package independently | `<project>@<version>` (e.g., `codometer-core@0.1.0`) | Yes |

Only the 29 **publishable packages** across the four IC suites (`conformetry`, `codometer`, `callidescope`, `codependix`) are published. The 8 non-publishable packages (`*-agents` and `*-examples`) are explicitly excluded in `nx.json` and never reach npm.

### Dual Versioning Scheme

- **Nx Release owns per-package versions**: Each of the 29 publishable packages gets its own independent version derived from conventional commits affecting that package (reach determined by the dependency graph as described in ADR 0023). Tags follow the pattern `<projectName>@{version}` (e.g., `conformetry-cli@0.1.0`). Each package maintains its own `CHANGELOG.md` that ships inside the published package.
- **semantic-release owns the root version**: The repository root has a single version (`v<version>`, e.g., `v2.34.0`) that semantic-release bumps based on the squashed merge commit. This is the only GitHub release created; the README version badge points at the latest `v*` tag.

The two versioning systems are independent: a codebase release may happen without any package releasing (if only non-publishable code changed), and packages may release without a codebase release (if a `no-release` commit bumps packages but not the root).

### PR Title Significance Rule

The PR title determines the semantic-release bump. Because the repository squash-merges using the PR title, **the title is the only thing semantic-release ever sees**—every individual commit on the branch is discarded at squash time.

The `pull-request-release-significance` check enforces that the PR title's type is **at least as release-significant as the most significant commit on the branch**. It also requires that the title's scope list overlaps with every commit's scopes (at least one shared scope per commit). If a change genuinely spans scopes, list them comma-separated (`feat(lexico,logger): ...`) or split into separate PRs.

Release significance order (highest to lowest): `BREAKING CHANGE`/`!` → `feat` (minor) → `fix`/`perf`/`refactor`/`build`/`ci` (patch) → `docs`/`style`/`test`/`chore` (none). The `no-release` scope suppresses any bump.

## The 6 Release Steps

### 1. 🏷️ Version Packages (`nx release --skip-publish`)

`nx release --skip-publish` reads conventional commits since each package's last tag, determines its independent semver bump, writes the new version to the package's `package.json`, and prepends a release entry to its `CHANGELOG.md`. Neither the version bump nor the changelog edit is committed; semantic-release's release commit will carry them.

- Nx uses `projectsRelationship: "independent"` and `specifierSource: "conventional-commits"` (configured in `nx.json`).
- The `configuration` project is ignored for this step by temporarily adding it to `.nxignore`, so tooling-only commits do not trigger package releases.
- If `main` has already moved past the commit this run is releasing, the step detects it via `MainTipService` and the run steps aside (`RELEASE_SUPERSEDED=1`), letting the newer commit's run release everything.

### 2. 🔖 Tag Codebase (semantic-release)

semantic-release runs on the same commit. It:
- Bumps the root `package.json` version according to the same conventional-commit rules.
- Updates the root `CHANGELOG.md`.
- Commits the root version, the root changelog, **and** the package versions/changelogs from step 1 together as a single commit: `chore(release): 🔖 tag codebase <version>`.
- Tags that commit `v<version>` (e.g., `v2.34.0`) and creates the GitHub release. The README version badge points at this tag.
- Uses `@semantic-release/git` with an explicit `assets` list so only the intended files are committed (root manifests, changelogs, generated README/AGENTS artifacts, and every ic-suite package's `CHANGELOG.md` and `package.json`).

### 3. 🔖 Tag Packages

Each newly versioned ic-suite package receives an annotated git tag `<project>@<version>` on the release commit. Tags are pushed **six at a time** because GitHub rejects any push to this repository that updates more than six refs; a rejected batch is retried up to three times (4 total attempts with 20-second delays by default). Tags still missing when the run ends are pushed by the next run before it versions packages.

- Nx reads each package's current version from its tag (`currentVersionResolver: "git-tag"`), so an untagged version would otherwise be released again.
- When the codebase itself has no release (e.g., a package-scoped `no-release` commit that Nx still bumps), the package versions and changelogs are committed first on their own, as `chore(release): 🔖 tag packages`.

### 4. 📦 Publish Packages (npm with provenance)

`pnpm -r publish --provenance` publishes every package in the Nx release group whose version is not yet on npm. Each package is published with an npm **provenance attestation** linking it to the commit and workflow run that built it.

- pnpm is used instead of `nx release publish` because pnpm honors provenance **only** via the `--provenance` flag, which Nx cannot pass through.
- The publish step skips versions already on npm, so a re-run completes a run that stopped part way (though it cannot attest packages it did not publish).

### 5. 🪞 Mirror to GitHub Packages

Each published package is mirrored to GitHub Packages, which lists it in the repository's **Packages** sidebar.

- GitHub Packages accepts only packages scoped to the repository owner. `@codometer/cli` is mirrored as `@organizzolini/codometer-cli`; `@conformetry/core` becomes `@organizzolini/conformetry-core`, etc.
- The mirror is a **copy**: npm remains the canonical registry for installation. A mirrored package can start out private (as `codebase-devcontainer` did) and its visibility can only be changed in its package settings, not through the API.

### 6. 🔗 Link & Attest Packages

Each version on npm gets a **storage record** on the organization's **Linked artifacts** page, naming npm as its registry, its npmjs.com page, the SHA-256 of its tarball, and this repository.

- The versions published in the current run also receive a **GitHub build-provenance attestation** via `actions/attest`. Earlier-published versions are recorded but not attested, since an attestation asserts that *this* run built the package.

## Supersession Handling

A release run takes long enough that another pull request often merges while it works. When `main` moves under it, the run steps aside rather than failing on a rejected push:

- Steps 1 and 2 check before they start (via `MainTipService` in the skip logic).
- Steps 2 and 3 check again when a push to `main` is rejected.
- The step that notices sets `RELEASE_SUPERSEDED` for the rest of the job; nothing more is pushed, tagged, or published. The newer commit's own run releases everything this one would have.

## Adding a New Publishable Package

A new publishable package needs `"version": "0.0.0"` added to its `package.json` by hand:

- The conformetry templates leave `version` out, because Nx owns it once the package is released and a pinned value would fail conformance on every bump.
- Nx and `npm publish` both need the field.
- Nx treats the manifest version as the one already released: with no `<project>@<version>` tag yet, it bumps from that version using the package's whole commit history.
- Starting at `0.0.0` makes the first release `0.0.1` when that history resolves to a patch (which covers `feat` and `fix` commits on a `0.x` package). A breaking change in the history makes it `0.1.0` instead.

## Independent Package Versioning with Cascading Dependents

The 29 publishable packages are versioned **independently** using Nx Release (`projectsRelationship: "independent"`), not in lockstep across the repository or per suite. Conventional commits determine the semver bump for every package a commit affects (reach determined by the dependency graph as described in ADR 0023), and Nx Release **automatically cascades patch version bumps to internal dependents** within the publishable packages (`updateDependents: "auto"` in `nx.json`).

This decouples the release cycle of public npm packages from the monorepo's internal applications and tools, while guaranteeing internal consistency across multi-package suites without manual bump tracking.

### Consequences

- **Per-package git tags and changelogs**: Every publishable package generates an independent git tag matching `{projectName}@{version}` and maintains its own `CHANGELOG.md` that ships inside the published package.
- **Automated suite consistency**: Changing a core library (e.g., `@conformetry/core`) automatically increments the patch version of dependent packages (e.g., `@conformetry/generation`, `@conformetry/validation`, `@conformetry/cli`), ensuring consumers always receive compatible dependency ranges.

## Related Pages

- [ic-suite Architecture](../architecture/ic-suite.md) — the four toolchains and their publishable packages
- [CI/CD Workflows](../workflows/ci-cd.md) — broader workflow context
- [Development Workflow](../workflows/development.md) — commit conventions and PR process
