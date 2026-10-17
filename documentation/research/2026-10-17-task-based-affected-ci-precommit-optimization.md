# Task-Based Affected Execution for CI and Pre-Commit Optimization

## Executive Summary

Nx 23.3 introduces **task-based affected** execution (`NX_LEGACY_AFFECTED=false` or `affected.legacy: false` in `nx.json`). This fundamental shift moves `nx affected` from coarse, defensive project-graph invalidation to fine-grained, input-aware task-graph invalidation.

In this monorepo (55 projects), adopting task-based affected provides dramatic speedups and simplifies architecture:

1. **Pre-commit hooks (`lint-staged`)**: Eliminates the cascading execution of 6 targets across dozens of downstream projects when touching shared libraries, and skips irrelevant targets (such as `tsc` or `vitest`) on non-code changes.
2. **CI Pipelines (`continuous-integration.yml`)**: Eliminates downstream linting/formatting in matrix jobs and prevents test suite re-runs across dependent packages when only specs or documentation change.
3. **Architecture Simplification**: Renders the custom workaround in `projects/publication/src/modules/run-affected/` (which dropped `.cspell/` files and manually injected `conformetry.config.ts`) obsolete by letting Nx's native task inputs govern what runs.

---

## 1. Primary Sources & Architectural Mechanics

### 1.1 Primary Sources

- **Nx 23.3 Release Announcement**: [Nx 23.3 Release: Task-based affected](https://nx.dev/blog/nx-23-3-release)
- **Nx Source Implementation**:
  - `packages/nx/src/command-line/affected/affected.ts`
  - `packages/nx/src/project-graph/affected/affected-tasks.ts`
  - `packages/nx/src/config/nx-json.ts`
  - `packages/nx/src/native/` (`nativeAffectedTasks` Rust implementation)
- **Codebase Primary References**:
  - `nx.json` (targetDefaults, namedInputs, plugins)
  - `projects/configuration/lint-staged.config.ts`
  - `.github/workflows/continuous-integration.yml`
  - `.github/actions/run-affected/action.yml`
  - `projects/publication/src/modules/run-affected/run-affected.service.ts`
  - `documentation/adr/0007-state-the-real-dependency-in-task-cache-inputs.md`

### 1.2 The Core Mechanism: Project-Based vs Task-Based Affected

| Dimension                                          | Legacy Project-Based Affected (Nx <= 23.2)                            | Task-Based Affected (Nx 23.3+)                                                       |
| :------------------------------------------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Selection Unit**                                 | Projects                                                              | Individual Tasks (`project:target`)                                                  |
| **Dependency Graph**                               | Project dependency graph (`projects.json` / imports)                  | Task graph (`inputs`, `outputs`, and dependencies)                                   |
| **Role of `dependsOn`**                            | Decides which projects are affected                                   | Decides execution order only; does NOT dictate affectedness                          |
| **Blast Radius of Shared Lib Changes**             | Every downstream dependent project re-runs all targets                | Only tasks whose explicit inputs cover the changed files re-run                      |
| **Handling of Leaf Edits (e.g. `*.unit.test.ts`)** | Triggers builds, lints, and tests across all dependent packages       | Triggers only the test task in the owning project                                    |
| **Workspace-Wide Config Edits (e.g. `.cspell/`)**  | Marks root/config project affected -> marks entire workspace affected | Marks only the specific task declaring `.cspell/` in its `inputs` (`spell-check`)    |
| **Activation**                                     | Default behavior                                                      | Opt-in via `affected.legacy: false` or `NX_LEGACY_AFFECTED=false` (Default in Nx 24) |
| **Inspection Tool**                                | None (only lists affected projects)                                   | `--explain` (e.g. `nx affected -t build --explain`)                                  |

Under task-based affected:

1. Nx starts from the files modified in git (`--base`/`--head` or `--files`).
2. A task is **directly touched** if any changed file matches that task's `inputs`.
3. A touched task produces different outputs, which marks downstream tasks that read those outputs (`dependentTasksOutputFiles` or `^production`) as affected.
4. Any task whose inputs remain untouched is **pruned from the task graph entirely**.

---

## 2. Codebase Exploration & Current Pain Points

### 2.1 Pre-Commit Bottleneck (`lint-staged.config.ts`)

In `projects/configuration/lint-staged.config.ts`, the hook runs:

```typescript
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code,conformetry-validate --configuration=check --parallel=${String(ANALYSIS_PARALLELISM)} --outputStyle=static ${getStagedChangeFlags(files)}
```

#### The Problem

- **Massive Target Over-Execution**: When staging a single file in project `foo` (even a `README.md` or test), project-based affected marks project `foo` affected for **all 6 targets**. This forces `tsc --noEmit`, `type-coverage`, `guard-code`, and `conformetry-validate` to schedule and evaluate, even when the changed file cannot possibly affect them.
- **Cascading Across Dependents**: When staging a change in a core library (such as `@callidescope/core` or `@codebase/logging`), project-based affected marks 20+ dependent projects affected. The hook attempts to run `eslint`, `oxlint`, `stylelint`, `spell-check`, and `typecheck` across the entire dependent subtree.
- **Memory Pressure & Process Kills**: Because dozens of projects are marked affected on shared library commits, the pre-commit hook previously suffered OS kills (exit code 137). Complex workarounds were introduced (`getLocalParallelism()`, argument size splitting) to prevent memory exhaustion.
- **Template Workaround**: Staging conformetry templates in `projects/configuration/conformetry-templates/` failed to select instance projects under project-based affected because `.nxignore` masked template files. The hook had to implement `getStagedTemplateFlags()` to manually inject `conformetry.config.ts` into `--files`.

### 2.2 CI Bottleneck & Custom Workarounds (`run-affected.service.ts`)

In `.github/workflows/continuous-integration.yml`, CI runs matrix jobs for `typecheck-code`, `format-code`, `lint-code`, `deprecate-code`, `guard-code`, `test-code`, `build-projects`, and `verify-publishable-packages`.

To avoid running all jobs across all projects, the codebase built an entire custom NestJS CLI service: `projects/publication/src/modules/run-affected/run-affected.service.ts`.

#### CI Invalidation Challenges

- **Dictionary Word Spurious Invalidation**:
  `projects/publication/src/modules/run-affected/run-affected.constants.ts` documents:
  > _"`spell-check` lists them among its `{workspaceRoot}` inputs, and Nx decides affected per project, not per target, so one new word in a dictionary marks every project affected for every target. Only the target that runs `spell-check` should see those files."_
- To prevent dictionary edits from triggering whole-repo test, typecheck, and build runs, `RunAffectedService` intercepts the git diff and strips spelling files from the change set unless `INCLUDE_SPELLING` is true.
- **Lost Fine-Grained Package/Lockfile Diffing**:
  Because `RunAffectedService` modifies the file list, it is forced to feed changes to Nx over `--stdin`. As documented in the service, `--stdin` causes Nx to count every file as changed in full, losing Nx's native ability to diff `package.json` and `pnpm-lock.yaml` field-by-field. Consequently, lockfile changes erroneously touch every project.
- **CI Matrix Redundancy**:
  In the `Lint` matrix job, touching a core package causes every downstream package to execute `lint-code`. Because ESLint and Oxlint only read `{projectRoot}/**/*`, downstream linting is 100% redundant and wastes runner CPU time.

---

## 3. How Task-Based Affected Optimizes CI and Pre-Commit

### 3.1 Pre-Commit Optimization

1. **Zero Downstream Linting/Formatting**:
   Since `eslint`, `oxlint`, `oxfmt`, and `stylelint` only declare `{projectRoot}/**/*` in their inputs (no `^production`), touching `projects/ic-suite/callidescope/callidescope-core/src/index.ts` will **only** run lint and format on `callidescope-core`. Zero downstream packages are scheduled for linting or formatting.
2. **Selective Target Activation on Staged Files**:
   - Staging `README.md` will only match tasks declaring markdown inputs (`markdown-lint`, `oxfmt`, `codometer`). `typecheck`, `vitest`, and `conformetry-validate` are completely omitted.
   - Staging `foo.unit.test.ts` matches `vitest`, but does not match `build` or downstream `test` tasks.
3. **Drastic Hook Execution Speedup**:
   Pre-commit execution drops from minutes to seconds when working on shared libraries, eliminating hook timeouts and high memory spikes.

### 3.2 CI Pipeline Optimization

1. **Isolated CI Matrix Execution**:
   - `Lint` job: Only projects with direct code modifications run linting.
   - `Format` job: Modifying `.cspell/` only runs `spell-check`. It does not trigger unnecessary runs of other formatters.
   - `Test` job: Because `vitest` inputs use `^production` (which explicitly excludes `*.unit.test.ts`), modifying a unit test in a library will **not** trigger tests in downstream packages.
   - `Build` job: Modifying tests or docs does not trigger downstream package builds.
2. **Retirement of Custom Diff Hacking in `run-affected`**:
   - No need to drop spelling files: task-based affected naturally knows that `.cspell/**` is only an input to `spell-check`.
   - CI can use native `--base=${NX_BASE} --head=${NX_HEAD}`, restoring native field-by-field `pnpm-lock.yaml` and `package.json` diffing.
3. **Native Support for Ignored Files (`includeIgnored: true`)**:
   Nx 23.3 introduces `includeIgnored: true` for inputs. Conformetry templates in `.nxignore` can be declared with `includeIgnored: true` in `conformetry-validate` inputs, allowing task-based affected to detect template changes natively without CLI shims.

---

## 4. Key Considerations & Target Inputs Readiness

Task-based affected relies on the exactness of task `inputs`. Fortunately, this codebase already implemented **ADR 0007 ("State the real dependency in task cache inputs")**, ensuring high-quality, granular inputs across `nx.json`:

1. **Aggregator Targets (`nx:noop`)**:
   Aggregator targets like `test-code`, `lint-code`, `typecheck-code`, `format-code`, and `guard-code` delegate execution through `dependsOn`. Under task-based affected, Nx builds the task graph for the requested target and selects any required sub-tasks whose inputs were touched.
2. **`cache: false` Targets**:
   As emphasized in the Nx release notes, targets with `cache: false` that have custom inputs must ensure they declare `^production`, `^default`, or `dependentTasksOutputFiles` if they are intended to re-run on upstream changes. All critical compile and test targets in `nx.json` already declare `^production`.
3. **Diagnostic Verification**:
   The new `--explain` flag (e.g. `nx affected -t test-code --explain --verbose`) provides complete transparency on which files touched which tasks and which downstream tasks were affected by output changes.

---

## 5. Implementation Roadmap

### Phase 1: Nx Version Upgrade

- Update `nx` and `@nx/*` packages in `pnpm-workspace.yaml` catalog from `^23.0.0` (currently resolved to `23.2.1`) to `^23.3.0`.
- Run `pnpm install` and verify project graph construction.

### Phase 2: Enable Task-Based Affected

- In `nx.json`, add:

  ```json
  "affected": {
    "legacy": false
  }
  ```

- Alternatively, validate incrementally via environment variable `NX_LEGACY_AFFECTED=false` in CI workflows and `lint-staged.config.ts`.

### Phase 3: Verify and Tune Task Inputs with `--explain`

- Run `NX_LEGACY_AFFECTED=false pnpm exec nx affected -t typecheck-code,lint-code,format-code,guard-code --explain` against staged changes and commit ranges.
- Confirm that editing a test file selects only the owning project's test task.
- Confirm that editing a shared package source file does not select downstream lint tasks.

### Phase 4: Streamline Pre-Commit and CI Tooling

- Update `projects/configuration/lint-staged.config.ts` to leverage task-based selection and remove unnecessary file flag workarounds.
- Simplify `.github/actions/run-affected/action.yml` and evaluate deprecating or simplifying `projects/publication/src/modules/run-affected/run-affected.service.ts`.
