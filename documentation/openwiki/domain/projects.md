---
type: "Reference"
title: "Project Structure & Conventions"
openwiki_generated: true
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
sources:
  - id: openwiki-source-d5a2a32b7849ae8b44301e20
    resource: repo://.agents/skills/nx-generate/SKILL.md
  - id: openwiki-source-57b81e54d1113287ebfdf6f8
    resource: repo://.github/CONTRIBUTING.md
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-641cd559130234bc7c89a631
    resource: repo://configuration/codebase-structure.json
  - id: openwiki-source-257acfa6e234c02c3a7536c7
    resource: repo://configuration/conventional.config.cjs
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-aa414ec11f49c0bd0511815c
    resource: repo://projects/affirmancy/project.json
  - id: openwiki-source-5bafa90f596911b2487bd34f
    resource: repo://projects/common/presentation/project.json
  - id: openwiki-source-fe18d479c15c3084164d71b2
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/project.json
  - id: openwiki-source-e0cf0150cb4d3420082c1bed
    resource: repo://projects/lexico/lexico-web/project.json
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
  - id: openwiki-source-67ef849b01b2a5742552b28f
    resource: repo://synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts
  - id: openwiki-source-832cd3156ac266bc6b2449f0
    resource: repo://validation/src/modules/readme-projects/readme-projects.constants.ts
  - id: openwiki-source-e1d0a10546b987017406e0f9
    resource: repo://validation/src/modules/readme-projects/readme-projects.service.ts
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---


# Project Structure & Conventions

This document describes how projects are organized in the workspace, how their type is determined, how commit scopes relate to projects, and the validation that keeps the root README's project table accurate.

## Project Layout

Every workspace project lives under `projects/`. There are **three nesting patterns**:

| Pattern | Path Example | Used By |
|---------|--------------|---------|
| **Direct** | `projects/<project>` | `affirmancy`, `caelundas`, `meanderaw` |
| **Domain-nested** | `projects/<domain>/<project>` | `lexico/lexico-web`, `lexico/lexico-api`, `lexico/lexico-entities`, `lexico/lexico-cli` |
| **IC-suite nested** | `projects/ic-suite/<toolchain>/<project>` | `ic-suite/callidescope/callidescope-cli`, `ic-suite/codependix/codependix-core`, `ic-suite/codometer/codometer-measurement`, `ic-suite/conformetry/conformetry-configuration` |

A project is **any directory containing its own `package.json`**. Grouping folders (`projects/lexico/`, `projects/ic-suite/callidescope/`) do not have `package.json` and are not projects themselves.

The ESLint rule `project-structure` (configuration in `configuration/codebase-structure.json`) enforces this layout. It defines two project archetypes — `codebase-project` and `documentation-project` — each with a prescribed set of child folders (`src/modules`, `src/components`, `src/lib`, `testing`, `scripts`, `examples`, etc.). A file directly in `projects/` or in a grouping folder is a lint error, not a style preference.

## Project Type: `type:application` vs `type:package`

Whether a project is an application or a package is declared by its **`type` tag in `project.json`**, not by its folder location or nesting depth.

- **`type:application`** — A runnable entry point (CLI, web server, GraphQL API, Jupyter notebook). Has a bootstrap file (`*.main.ts`, `*.ipynb`) and can be executed directly.
- **`type:package`** — A library/package shared across projects. No entry point; exports modules, services, types, or components for consumers.

This tag is what module-boundary rules read. The `type` tag is explicitly declared in each project's `project.json` and is used by conformetry to match instance groups (see ADR 0011).

## Source of Truth: `nx show projects`

**Do not maintain a hand-curated list of projects.** It will drift, and nothing gates it. The authoritative list is:

```bash
nx show projects
```

This command discovers projects by scanning for `package.json` files under `projects/` (and the workspace root) at any depth, matching the same logic the `readme-projects` validation uses.

## README Project Table & Validation

<!-- openwiki: broken internal link [projects/lexico/lexico-web] file "projects/lexico/lexico-web" does not exist. Fix the href or restore the target, then delete this comment. -->
The root `README.md` carries an annotated table — one row per project, with a link to the project's directory (e.g., `[lexico-web](projects/lexico/lexico-web)`). The table is kept in sync by the `readme-projects` target:

```bash
nx run validation:readme-projects
```

This validation (implemented in `validation/src/modules/readme-projects/`) scans the workspace for every directory with a `package.json` (excluding template placeholders like `{{nameKebabCase}}`), then checks that each project path appears as a Markdown link in `README.md`. If any project is missing, the command fails. The validation runs in CI and locally during pre-commit.

## Commit Scopes Are Not Projects

A **commit scope** comes from a **closed vocabulary** defined in `configuration/conventional.config.cjs` (the single source of truth for commitlint, branch validation, release rules, and VS Code autocomplete). The scope list deliberately **collapses each toolchain to a single name**:

| Toolchain Prefix | Collapses To Scope |
|------------------|-------------------|
| `callidescope-*` | `callidescope` |
| `codependix-*` | `codependix` |
| `codometer-*` | `codometer` |
| `conformetry-*` | `conformetry` |

For example, a change to `callidescope-cli`, `callidescope-core`, and `callidescope-graph` in one commit all use the scope `callidescope`. Deriving a scope from a directory name (e.g., `callidescope-cli`) is how an invented scope fails validation.

Other scopes exist for cross-cutting concerns: `ic-suite`, `affirmancy`, `caelundas`, `lexico`, `configuration`, `persistence`, `interface`, `dependencies`, `deployments`, `documentation`, `infrastructure`, `installation`, `integration`, `presentation`, `lexico-entities`, `lexico-cli`, `meanderaw`, `sempientor`, `no-release`, `publication`, `release`, `reporting`, `scripts`, `testing`, `synchronization`, `validation`, and `JimmyPaolini`.

## Conformetry Scaffolding Requirement

**Never hand-create files or modules.** Always use conformetry generators via Nx:

```bash
nx g conformetry:<generator> --name=<name> --project=<project> [--dry-run]
```

Generators fall into three tiers:

- **Project generators** (create new Nx projects): `jupyter-notebook-application`, `nestjs-command-project`, `nestjs-graphql-application`, `nestjs-service-project`, `tanstack-application`
- **Module generators** (add a module inside an existing project): `nestjs-command-module`, `nestjs-dataloader-module`, `nestjs-graphql-module`, `nestjs-service-module`, `tanstack-server-function`
- **File generators** (add files inside an existing module): `nestjs-service-file`, `nestjs-resolver-file`, `react-component`, `react-hook`, `tanstack-route`

Templates live in `configuration/conformetry-templates/` and are synced from `configuration/conformetry.config.ts` by running `nx run synchronization:conformetry-generators:write`. Code written in a shape a template already describes starts life failing conformance; generating ensures correct placement and structure from the start.

## Related Pages

- [Architecture Overview](../architecture/overview.md) — system dependency graphs and package relationships
- [Development Workflow](../workflows/development.md) — coding conventions, quality gates, and PR process
- [Scaffolding & Generators](../workflows/scaffolding.md) — detailed generator reference with examples
