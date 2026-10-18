# Alternative Approaches for Masking Generator Templates in Nx Monorepos

## Executive Summary

In this codebase, generator templates in `projects/configuration/conformetry-templates/` contain raw template files named `project.json`, `package.json`, `pyproject.toml`, `vite.config.*`, `eslint.config.*`, etc.

Historically, `.nxignore` was used to mask these files from Nx:

```gitignore
projects/configuration/conformetry-templates/**/project.json
projects/configuration/conformetry-templates/**/package.json
projects/configuration/conformetry-templates/**/pyproject.toml
projects/configuration/conformetry-templates/**/vite.config.*
projects/configuration/conformetry-templates/**/vitest.config.*
projects/configuration/conformetry-templates/**/eslint.config.*
projects/configuration/conformetry-templates/**/codometer.config.*
projects/configuration/conformetry-templates/**/callidescope.config.*
```

The drawback of `.nxignore` is that **Nx drops matching files from its git file-tracking completely**. Consequently, changes to template files produce an empty affected file list in `nx affected`, requiring manual diff interception and `--stdin` injection in `projects/publication/src/modules/run-affected/` and `projects/configuration/lint-staged.config.ts`.

This research investigates whether alternative masking mechanisms exist in Nx and TypeScript tooling that allow template files to be tracked by Git in `nx affected` without causing Nx or plugins to infer false projects.

---

## 1. Analysis of Primary Sources & Nx Project Discovery

### 1.1 How Nx Discovers Projects

Nx discovers projects via two plugin sources:

1. **Built-in Core Plugins** (`packages/nx/src/project-graph/plugins/get-plugins.ts`):
   - `nx/core/project-json`: matches `project.json` and `**/project.json`.
   - `nx/core/package-json`: matches `package.json` and `**/package.json` (filtered against workspace package patterns and/or sibling `project.json`).
2. **Inferred Target Plugins** (configured in `nx.json#plugins`):
   - `@nx/vite/plugin`, `@nx/eslint/plugin`, `@nx/vitest`, `@callidescope/nx`, `@codependix/nx`, `@conformetry/nx`.
   - These plugins inspect matching configuration files (e.g. `vite.config.ts`, `eslint.config.ts`).

### 1.2 The Failure Mode When Unmasking Templates

When template files were unmasked in experiment:

1. Built-in `nx/core/project-json` parsed `projects/configuration/conformetry-templates/**/{{nameKebabCase}}/project.json`.
2. Because the file contains unprocessed mustache tokens (`"{{type}}/{{nameKebabCase}}"`), Nx failed to resolve valid filesystem paths for project roots and crashed during project graph configuration.
3. Plugins (`@conformetry/nx`, `@callidescope/nx`, `@codependix/nx`) failed because `createNodes` received template config files containing mustache placeholders instead of real configurations.

---

## 2. Comprehensive Architectural Alternatives

### Approach A: Plugin-Level Exclusions (`plugins[].exclude` in `nx.json`)

Nx plugins in `nx.json` support `include` and `exclude` glob patterns:

```json
{
  "plugin": "@nx/vite/plugin",
  "exclude": [
    "projects/configuration/**",
    "projects/configuration/conformetry-templates/**"
  ]
}
```

- **How it works**: Inferred plugins (`@nx/vite`, `@nx/eslint`, `@callidescope/nx`, `@codependix/nx`) skip scanning the template directory.
- **Limitation**: The built-in core plugins `nx/core/project-json` and `nx/core/package-json` are default plugins loaded directly by Nx core; `nx.json` does not expose an `exclude` property for default plugins. Therefore, raw `project.json` in template folders is still intercepted by `nx/core/project-json`.

---

### Approach B: Template File Suffix Renaming (e.g. `*.template` or `*.tmpl`)

Instead of storing raw filenames like `project.json` or `package.json` inside template directories, template files are named with an explicit template extension:

- `project.json.template` (or `project.json.tmpl` / `__project.json`)
- `package.json.template`
- `vite.config.ts.template`
- `eslint.config.ts.template`

Conformetry generator's `renderPath()` is updated to strip `.template` when generating the output.

#### Pros

1. **Completely Eliminates `.nxignore`**: No ignore rules needed. Nx, ESLint, Vite, and Vitest will never attempt to parse them as active workspace configuration files.
2. **Native Git Tracking**: Changes to `project.json.template` are tracked directly by Git and visible to `calculateFileChanges()`.
3. **Native Task-Based Affected**:

   `conformetry-validate` inputs can declare:

   ```json
   "{workspaceRoot}/projects/configuration/conformetry-templates/**/*"
   ```

   Editing any template file immediately marks `conformetry-validate` tasks affected across all instance packages.
4. **Enables Complete Retirement of `run-affected`**:
   Because templates are visible to Git and dictionary files are isolated in task inputs, `run-affected.command.ts`, `run-affected.service.ts`, and `--stdin` injection in `action.yml` and `lint-staged.config.ts` can be deleted.

#### Cons

- Requires updating the generator template renderer to strip the suffix during instantiation, and renaming existing template files in `projects/configuration/conformetry-templates/`.

---

### Approach C: Bundled or Pre-Compiled Template Archive / In-Memory Artifacts

Store template trees as serialized assets (such as a `.tar.gz` archive, zip, or embedded TypeScript strings/modules emitted into `.conformetry/` or `projects/configuration/assets/`).

#### Pros

- Guaranteed zero collision with any workspace linter, scanner, or Nx project locator.
- Single file or asset directory tracking.

#### Cons

- Editing templates requires unbundling or editing serialized strings, losing developer ergonomics and IDE syntax highlighting when writing template code.

---

### Approach D: External / Out-of-Workspace Template Directory

Move `conformetry-templates/` outside the root project scope or to a dedicated directory declared outside project scanning (e.g., inside `.conformetry/templates/` or a sibling repository).

#### Pros

- Clean isolation from `projects/` folder structure.

#### Cons

- If placed in dot-folders (`.conformetry/`), Nx by default ignores dotfiles unless explicitly hashed.

---

## 3. Comparison Matrix

| Evaluation Criterion                | `.nxignore` (Current)               | Suffix Renaming (`*.template`)    | Plugin Exclusions             | Bundled Archive         |
| :---------------------------------- | :---------------------------------- | :-------------------------------- | :---------------------------- | :---------------------- |
| **Workspace Git Tracking**          | ❌ Masked from Nx Git diff          | ✅ Fully tracked                  | ⚠️ Core plugins still collide | ✅ Fully tracked        |
| **Native `nx affected` Support**    | ❌ Requires `--stdin` shim          | ✅ Native without shims           | ❌ Fails on core plugins      | ✅ Native without shims |
| **Enables Deleting `run-affected`** | ❌ No (requires template injection) | ✅ Yes (full deletion possible)   | ❌ No                         | ✅ Yes                  |
| **Authoring Ergonomics**            | ✅ Direct file editing              | ✅ Direct file editing            | ✅ Direct file editing        | ❌ Poor (serialized)    |
| **Implementation Effort**           | Zero (already in place)             | Low (rename files + suffix strip) | Infeasible                    | Medium                  |

---

## 4. Recommendation

The cleanest, most robust alternative to `.nxignore` is **Approach B (Template File Suffix Renaming: `*.template`)**:

1. Rename files that collide with project identifiers:
   - `project.json` → `project.json.template`
   - `package.json` → `package.json.template`
   - `pyproject.toml` → `pyproject.toml.template`
   - `*.config.ts` → `*.config.ts.template`
2. Remove the template entries from `.nxignore`.
3. In `@conformetry/generation`, strip `.template` from destination filenames during `renderPath()`.
4. Result:
   - Template edits natively trigger `conformetry-validate` in `nx affected`.
   - `run-affected.command.ts`, `run-affected.service.ts`, and `--stdin` shims in CI and pre-commit can be permanently deleted.
