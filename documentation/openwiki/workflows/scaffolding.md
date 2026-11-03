---
type: workflow
title: Scaffolding with Conformetry
description: How to scaffold new projects, modules, and components using conformetry generators. Covers the nx g conformetry:<generator> command, the template picker, required inputs, and the validation that ensures generated code stays conformant. Lists available templates and their use cases.
tags: [scaffolding, generators, conformetry, nx, project-creation, module-creation, file-creation]
sources:
  - id: openwiki-source-d5a2a32b7849ae8b44301e20
    resource: repo://.agents/skills/nx-generate/SKILL.md
  - id: openwiki-source-8037e2358a2c4f9b2c722a11
    resource: repo://AGENTS.md
  - id: openwiki-source-75161601af5a39bb60abb392
    resource: repo://configuration/conformetry.config.ts
  - id: openwiki-source-1c93486ff1df6379518854cc
    resource: repo://documentation/adr/0011-hold-one-path-law-for-every-project-type.md
  - id: openwiki-source-f7338b666d73b255add2354c
    resource: repo://documentation/adr/0025-run-the-workspace-tools-from-a-configuration-project.md
  - id: openwiki-source-fe18d479c15c3084164d71b2
    resource: repo://projects/ic-suite/callidescope/callidescope-cli/project.json
  - id: openwiki-source-15595f87d2b72a10e2cbba47
    resource: repo://projects/ic-suite/conformetry/conformetry-cli/README.md
  - id: openwiki-source-687a69dfdec0ebf92b0babfb
    resource: repo://projects/ic-suite/conformetry/conformetry-nx/generators.json
  - id: openwiki-source-51289acac01f188bf1ca3053
    resource: repo://projects/ic-suite/conformetry/conformetry-nx/project.json
  - id: openwiki-source-4eb0d21efbe34e65dacab4d0
    resource: repo://projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts
  - id: openwiki-source-23775c3de52f3ab95a13cb8b
    resource: repo://README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Scaffolding with Conformetry

This page documents how to create new projects, modules, and files using the **conformetry** generator system. Conformetry is the workspace's template-driven code generation and conformance validation system. Its templates live in `configuration/conformetry-templates/` and are defined in `configuration/conformetry.config.ts`. The Nx plugin is synced by running `nx run synchronization:conformetry-generators:write`.

> **Always invoke the `nx-generate` skill first** before exploring or calling MCP tools when scaffolding new artifacts. The skill handles generator discovery, dry-runs, and verification.

## Project Types

Every Nx project in this workspace carries a `type` tag in its `project.json`:

- **`type:application`** — A runnable entry point (CLI, web server, GraphQL API, Jupyter notebook). Has a bootstrap file (`*.main.ts`, `*.ipynb`) and can be executed directly.
- **`type:package`** — A library/package shared across projects. No entry point; exports modules, services, types, or components for consumers.

> The `type` tag is **not** derived from the folder name. It is explicitly declared in `project.json` and used by conformetry to match instance groups (see ADR 0011).

## Generator Categories

Conformetry generators fall into three tiers:

| Tier | Generators | Purpose |
|------|------------|---------|
| **Project** | `jupyter-notebook-application`, `nestjs-command-project`, `nestjs-graphql-application`, `nestjs-service-project`, `tanstack-application` | Create a brand-new Nx project (new `project.json`, `package.json`, `tsconfig`, bootstrap, etc.) |
| **Module** | `nestjs-command-module`, `nestjs-dataloader-module`, `nestjs-graphql-module`, `nestjs-service-module`, `tanstack-server-function` | Add a new module directory inside an **existing** NestJS/TanStack project (`src/modules/<name>/`) |
| **File** | `nestjs-service-file`, `nestjs-resolver-file`, `react-component`, `react-hook`, `tanstack-route` | Add one or two files inside an existing module/project without creating a new module directory |

## The 14 Generators

All generators are defined in `configuration/conformetry.config.ts`.

### Project Generators (5)

| Generator | Description | Type Tag | Key Inputs |
|-----------|-------------|----------|------------|
| `jupyter-notebook-application` | Standalone Python app with Jupyter notebook entry point, pytest/pyright/ruff tooling, shared uv workspace venv | `type:application` | `name` (kebab-case), `description` |
| `nestjs-command-project` | Standalone NestJS CLI app built on `nest-commander`, for a new command-line tool in `projects/` | `type:application` | `name` (kebab-case), `type` (nesting directory, e.g. `projects/ic-suite/callidescope`), `workspaceRelativePrefix` (e.g. `../../../../`) |
| `nestjs-graphql-application` | Standalone NestJS GraphQL API application, for a new backend service exposing a GraphQL schema over HTTP | `type:application` | `name` (kebab-case) |
| `nestjs-service-project` | Standalone NestJS library package for internal workspace code shared across projects, no CLI entry point or HTTP server | `type:package` | `name` (kebab-case), `type` (nesting directory), `workspaceRelativePrefix` |
| `tanstack-application` | Standalone TanStack Start web app — server rendering, file-based routes, Tailwind CSS, Vitest — for a new frontend in `projects/` | `type:application` | `name` (kebab-case) |

### Module Generators (5)

| Generator | Description | Target Projects (tags) | Key Inputs |
|-----------|-------------|------------------------|------------|
| `nestjs-command-module` | nest-commander command module — command, module, constants, types, unit test — for an existing NestJS CLI project | `framework:nest-commander` | `name` (kebab-case), `project` (parent project name) |
| `nestjs-dataloader-module` | GraphQL dataloader module — dataloader, module, types, unit test — for batching lookups inside an existing NestJS project | `framework:nestjs`, `language:graphql` | `name`, `project` |
| `nestjs-graphql-module` | GraphQL module — resolver, entities, args/input types, factories, constants, unit test — for an existing NestJS project | `framework:nestjs`, `language:graphql` | `name`, `project` |
| `nestjs-service-module` | Plain service module — module, service, constants, types, unit test — for an existing NestJS project | `framework:nestjs` | `name`, `project` |
| `tanstack-server-function` | TanStack Start server function module — GET/POST server functions, utilities, schemas, types, unit test — for an existing TanStack Start project | `framework:tanstack-start` | `name`, `project` |

### File Generators (4)

| Generator | Description | Target Projects (tags) | Key Inputs |
|-----------|-------------|------------------------|------------|
| `nestjs-service-file` | Service + unit test file for an existing NestJS module, without surrounding module files | `framework:nestjs` | `module` (target module), `name` (service name), `project` |
| `nestjs-resolver-file` | Resolver + unit test file for an existing NestJS module, without surrounding module files | `framework:nestjs`, `language:graphql` | `module`, `name`, `project` |
| `react-component` | React component + unit test file for an existing React project, placed in `src/components/` | `framework:react` | `name` (kebab-case), `project` |
| `react-hook` | React hook + unit test file for an existing React project, placed in `src/hooks/` (name must start with `use-`) | `framework:react` | `name` (kebab-case, `use-*`), `project` |
| `tanstack-route` | TanStack Start file route + integration test — the route and the page it renders — for an existing TanStack Start project | `framework:tanstack-start` | `name` (route file stem, e.g. `index`, `word.$id`), `project`, `path` (URL path, e.g. `/`, `/word/$id`) |

## Running Generators

Generators are invoked through Nx. **Always run with `--dry-run` first** to verify file placement.

```bash
# List all conformetry generators
nx list conformetry

# Show options for a specific generator
nx g conformetry:nestjs-service-module --help

# Dry-run (no files written)
nx g conformetry:nestjs-service-module --name=users --project=callidescope-core --dry-run --no-interactive

# Actually generate
nx g conformetry:nestjs-service-module --name=users --project=callidescope-core --no-interactive
```

### Common Patterns

**Create a new NestJS service project (library):**

```bash
nx g conformetry:nestjs-service-project \
  --name=my-domain \
  --type=projects/ic-suite/my-suite \
  --workspaceRelativePrefix=../../../../ \
  --no-interactive
```

**Create a new TanStack Start web application:**

```bash
nx g conformetry:tanstack-application \
  --name=my-web \
  --no-interactive
```

**Add a service module to an existing NestJS project:**

```bash
nx g conformetry:nestjs-service-module \
  --name=users \
  --project=callidescope-core \
  --no-interactive
```

**Add a React component to an existing React project:**

```bash
nx g conformetry:react-component \
  --name=button \
  --project=caelundas-web \
  --no-interactive
```

**Add a TanStack route to an existing TanStack Start project:**

```bash
nx g conformetry:tanstack-route \
  --name=search \
  --path=/search \
  --project=caelundas-web \
  --no-interactive
```

## Direct CLI Usage (conformetry generate)

The conformetry CLI can also be invoked directly, which is useful outside Nx or for scripting:

```bash
# Scaffold a new module from the nestjs-service-module template
conformetry generate --config configuration/conformetry.config.ts --template nestjs-service-module --name billing --directory projects/my-project/src/modules

# Check every existing instance still matches the template it came from
conformetry validate --config configuration/conformetry.config.ts
```

### Interactive Template Picker

Omitting `--template` at a terminal offers an autocomplete picker over every configured template, each shown with its description, filtering as you type. Typing `service` is the quickest way to reach `nestjs-service-module` without running a separate lookup command.

**With no terminal (CI, scripts, hooks)**, a missing `--template` is **refused** — listing every available name — rather than waiting, so a CI job fails immediately instead of hanging until timeout.

### Required Inputs

Every input a template declares is **required**. A template substitutes each of its placeholders, and mustache renders a missing one as an empty string rather than failing, so an optional input would quietly produce a hole in the generated file.

- **With a terminal**: missing inputs are prompted for interactively.
- **Without a terminal**: a missing input is **refused** — naming the flag to pass — and the run exits non-zero.

### Destination Directory

The `--directory` flag is required for `conformetry generate`. It specifies where to write the rendered files. A blank `--directory` is refused.

## Validation (conformetry validate)

Conformetry validates that generated files conform to their templates. The same template folder that produces a new module is the specification that module is later checked against.

```bash
# Validate all instances against their templates
conformetry validate --config configuration/conformetry.config.ts

# Validate specific templates
conformetry validate --config configuration/conformetry.config.ts --templates nestjs-service-module,react-component

# Validate specific instance paths
conformetry validate --config configuration/conformetry.config.ts --instances projects/common/observability/src/modules/logger
```

This command runs in CI as part of the `guard-code` target. It exits non-zero when any instance scores below its threshold (default: 100% — perfect match).

### Scoring

Validation reports **how much** of its template an instance honours, not just whether it does. Every template element weighed is one requirement, and a missing element costs the whole subtree it stood for — so deleting a class costs far more than dropping an import.

The same three numbers — met, total, percentage — are reported at every level:
- **File**: How much of this file drifted
- **Instance**: Whether this instance clears its threshold (thresholds apply here)
- **Total**: How the whole run did across every instance/template pair

An instance must score at or above its **threshold** to pass. Three levels set it, narrowest first:
1. Instance group: `instances[].threshold` in the generator config
2. Generator: `threshold` on the generator definition
3. CLI flag: `--threshold` on the validate command

## Instance Matching & Validation

The **InstancesService** (`projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts`) resolves which instances belong to which project:

- **Project generators** use **untagged instance groups** (workspace globs like `projects/**/*-web`)
- **Module/file generators** use **tagged instance groups** (e.g., `{ patterns: ["src/modules/*"], tags: ["framework:nestjs"] }`)

Tags like `framework:nestjs`, `language:graphql`, `framework:tanstack-start`, `framework:react` are declared in each project's `project.json` and determine which module/file generators apply.

A template whose instances are scoped by project tags **cannot be located by the CLI host** (`conformetry validate`) — tag resolution belongs to the Nx plugin, and the CLI host locates instances by glob alone. Such groups are left out rather than expanded from the working directory. Run those through `@conformetry/nx`, or pass `--instances` with explicit paths.

## SHADCN_GENERATED_PATTERNS Exclusion

Presentation components managed by the `shadcn` CLI are **excluded from conformetry validation** because they are vendored code that the shadcn CLI overwrites on every `shadcn add`. Holding them to a template would mean editing files the next `shadcn add` overwrites.

The exclusion is defined in `configuration/conformetry.config.ts`:

```typescript
const SHADCN_GENERATED_PATTERNS = [
  "projects/common/presentation/src/components/examples/**",
  "projects/common/presentation/src/components/reui/**",
  "projects/common/presentation/src/components/ui/**",
  "projects/common/presentation/src/hooks/**",
  "projects/common/presentation/src/lib/**",
];
```

These patterns are applied as `exclude` on the `react-component` and `react-hook` instance groups. If you add shadcn components to a different project, update this list accordingly.

## Template Structure

Templates live in `configuration/conformetry-templates/<generator-name>/` and use `{{placeholder}}` syntax (double braces) for substitution.

**Project template example** (`nestjs-service-project`):

```
configuration/conformetry-templates/nestjs-service-project/
└── {{nameKebabCase}}/
    ├── .env.default
    ├── .gitignore
    ├── AGENTS.md
    ├── codometer.config.ts
    ├── eslint.config.ts
    ├── package.json
    ├── project.json        # declares type:package tag
    ├── README.md
    ├── src/
    │   ├── {{nameKebabCase}}.module.ts
    │   ├── {{nameKebabCase}}.service.ts
    │   ├── {{nameKebabCase}}.types.ts
    │   └── {{nameKebabCase}}.constants.ts
    ├── testing/
    ├── tsconfig.build.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── vitest.config.ts
```

**Module template example** (`nestjs-service-module`):

```
configuration/conformetry-templates/nestjs-service-module/
└── {{nameKebabCase}}/
    ├── {{nameKebabCase}}.constants.ts
    ├── {{nameKebabCase}}.module.ts
    ├── {{nameKebabCase}}.service.ts
    ├── {{nameKebabCase}}.service.unit.test.ts
    └── {{nameKebabCase}}.types.ts
```

**File template example** (`react-component`):

```
configuration/conformetry-templates/react-component/
├── {{nameKebabCase}}.tsx
└── {{nameKebabCase}}.unit.test.tsx
```

## Conformetry Configuration

The generator definitions in `configuration/conformetry.config.ts` control:

- **`inputs`** — Zod schema defining the generator's CLI options (converted to JSON Schema for Nx)
- **`instances`** — Where existing instances of this template live in the workspace, used for validation
  - **Untagged groups** = workspace globs (for project generators)
  - **Tagged groups** = `{ patterns: [...], tags: [...] }` matched per-project (for module/file generators)
- **`templatePath`** — Path to the template directory under `configuration/conformetry-templates/`

When you add a new generator, you:
1. Create the template in `configuration/conformetry-templates/<name>/`
2. Add the definition to `configuration/conformetry.config.ts`
3. Run `nx run synchronization:conformetry-generators:write` to regenerate the Nx plugin
4. The plugin is emitted to `projects/ic-suite/conformetry/conformetry-nx/` (see ADR 0025)

## Verification After Generation

After running a generator:

```bash
# Format generated files
nx format --fix

# Run static checks on the affected project
nx run <project>:typecheck-code,lint-code,format-code,deprecate-code,guard-code

# Run tests
nx run <project>:vitest:unit
nx run <project>:vitest:integration
```

If the generator created a new project, also run `nx run-many --target=typecheck-code,lint-code --all` to ensure workspace-wide consistency.

## Workflow: nx-generate Skill

When scaffolding, **invoke the `nx-generate` skill immediately**. It enforces:

1. **Discover generators** — `nx list conformetry` or `nx list @nx/<plugin>`
2. **Match to request** — Prefer local workspace generators (`conformetry:*`) over external plugin generators
3. **Read generator source** — The schema alone is insufficient; understand what files are created and side effects
4. **Examine existing patterns** — Look at similar artifacts in the repo for naming, structure, config
5. **Dry-run** — Verify file placement before committing
6. **Run generator** — Use `--no-interactive`
7. **Format & verify** — `nx format --fix` then run relevant checks (typecheck, lint, test)

See the full skill at `.agents/skills/nx-generate/SKILL.md`.

## ADR References

<!-- openwiki: broken internal link [../architecture/decisions/0011-hold-one-path-law-for-every-project-type.md] file "../architecture/decisions/0011-hold-one-path-law-for-every-project-type.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- **ADR 0011** — [Hold one path law for every project type](../architecture/decisions/0011-hold-one-path-law-for-every-project-type.md): The universal path/naming law lives in `configuration/codebase-structure.json`; per-type shape is enforced by conformetry via tags, not by folder name.
<!-- openwiki: broken internal link [../architecture/decisions/0025-run-the-workspace-tools-from-a-configuration-project.md] file "../architecture/decisions/0025-run-the-workspace-tools-from-a-configuration-project.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- **ADR 0025** — [Run the workspace tools from a configuration project](../architecture/decisions/0025-run-the-workspace-tools-from-a-configuration-project.md): The conformetry Nx plugin lives in `projects/ic-suite/conformetry/conformetry-nx/` (the `configuration` project), and workspace tools run from there.

## Related Pages

- [Generator Template Instance](../concepts/generator-template-instance.md) — The conformetry data model for templates and instances
- [Conformetry](../domain/conformetry.md) — The conformetry system overview
- [Local Development](../operations/local-development.md) — Running and testing locally
