---
name: validate-code
description: "Run the quality suite before committing (typecheck-code, format-code, lint-code, deprecate-code, and guard-code, with write and then check) and the coverage, type-coverage, and size gates. Use after any implementation task, before submit-changes, or when told to validate."
license: MIT
---

# Validate Code

Run the codebase's full automated quality suite against your changes **before committing**. This prevents pre-commit hook failures, failed CI jobs, and wasted triage cycles.

## When to Use This Skill

- After finishing implementation of any task — TypeScript, Python, Markdown, YAML, JSON
- Before invoking the [submit-changes skill](../submit-changes/SKILL.md)
- When asked to "validate", "check code quality", "run linting", or "verify changes are clean"
- Anytime you add new dependencies, exports, or files (knip and fallow detect unused ones)

## What the Five Targets Cover

Each target is an aggregator that hangs its tools off `dependsOn`, so one `nx affected` invocation builds one task graph. CI runs the first four in its Static leg and `guard-code` in its Guard leg.

| Target           | Runs                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typecheck-code` | `typecheck` (TypeScript `tsc`, Python `pyright` and `ty`) and `type-coverage`                                                                                                             |
| `format-code`    | `oxfmt`, `ruff-format`, `sqlfluff-format`, `markdown-lint`, `yaml-lint`, and `spell-check` (cspell)                                                                                       |
| `lint-code`      | `eslint`, `oxlint`, `ruff-lint`, `stylelint`, `shellcheck`, `sqlfluff-lint`, `helm-lint`, `compose-config`, and the Terraform checks                                                      |
| `deprecate-code` | `knip`, `fallow-dead-code`, `vulture`, `dependency-cruiser`, `sherif`, `syncpack`, `squawk`, and `nbstripout`                                                                             |
| `guard-code`     | `callidescope-restrict`, `codependix-bound`, `coinagerie-check`, `conformetry-validate`, and the `integration` checks (`lockfile`, `readme-projects`, `skill-descriptions`, and the rest) |

`nx.json`'s `targetDefaults` is the source of truth for each list; read it when a tool seems missing here.

`guard-code` also runs `coinagerie-check`, which judges each project's glossary against the words the code uses. Its `write` pass is what you run to repair it: a new word gains a bare `- **word**:` bullet, which you then define with the [coinagerie-define skill](../coinagerie-define/SKILL.md), and a word the code no longer uses loses its bullet and definition. Never hand-edit the generated listing.

## Validation Workflow

### Step 1 — Auto-fix

Run the five targets in `write` mode to fix everything that fixes itself (formatting, lint autofixes, unused-code whitelist entries, sync checks):

```bash
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=write --base=main
```

`nx affected` misses new, untracked files. Name the project instead — `nx run` takes one target, so several targets go through `run-many`:

```bash
pnpm exec nx run-many --targets=typecheck-code,lint-code,format-code,deprecate-code,guard-code --projects=<project> --configuration=write
```

Review what the write pass changed before going on.

### Step 2 — Verify

Run the same targets in `check` mode to confirm nothing remains:

```bash
pnpm exec nx affected --target=typecheck-code,lint-code,format-code,deprecate-code,guard-code --configuration=check --base=main
```

**All checks must pass before proceeding.** If any fail, triage each failure:

- **Format/lint**: Fix the reported violations, then re-run.
- **Typecheck**: Fix type errors — see the [write-typescript skill](../write-typescript/SKILL.md) for patterns.
- **Type coverage**: Type the untyped expressions it names; `typecheck` passing does not mean this passes.
- **Spell-check**: Fix the typo or reword. Add a word to a dictionary only when it is a genuine domain term, following the [spell-check skill](../spell-check/SKILL.md) — never to silence a misspelling.
- **Knip (unused code)**: Remove the unused export, file, or dependency, or add an exception in `configuration/typescript/knip.config.ts`.
- **Fallow dead-code (unused code)**: The same finding from the other direction — `knip` runs once per workspace, `fallow` once over all of them. The two configurations are kept in step, so fix the code and both pass; if an exception is genuinely warranted, add it to `configuration/typescript/fallow.config.jsonc` _and_ its counterpart in `configuration/typescript/knip.config.ts`. Prefer `overrides` to `ignorePatterns` when suppressing a file: `ignorePatterns` also drops what that file imports out of the module graph, which makes reachable files read as dead.
- **Glossary (`coinagerie-check`)**: Run `pnpm exec nx run <project>:coinagerie-check:write`, then define any bare bullet it added with the [coinagerie-define skill](../coinagerie-define/SKILL.md). See [coinagerie-triage](../coinagerie-triage/SKILL.md) for a failure that survives the write.
- **Skill descriptions (`skill-descriptions`)**: Shorten each named description to 128 words, or the longest ones until all fit 12,288 characters together, moving trigger detail into the skill body.
- **Sync checks**: Run the failing synchronization's own `write` configuration (e.g., `nx run integration:conventional-config:write`), or `nx run-many --targets=conventional-config,devcontainer-configuration,pull-request-template,skill-exclusions --configuration=write` for every derivation at once.

See [triage-integration](../triage-integration/SKILL.md) for detailed per-tool fix instructions.

### Step 3 — Clear the Quality Gates

Run every [quality gate](#quality-gates) that applies to a project you touched.

### Step 4 — Done

Once `write`, `check`, and every applicable gate pass, code quality is confirmed. Proceed to commit or hand off.

## Quality Gates

The five targets do not run the coverage gates. Run each gate that applies to a project you touched:

| Gate          | Threshold                                                                                                                                                                   | How to run                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Test coverage | 96% branches, functions, lines, and statements, set once in `configuration/typescript/vitest.config.ts`                                                                     | `nx run <project>:vitest --configuration=coverage`              |
| Type coverage | Per project, `typeCoverage.atLeast` in its `package.json` (most are 100 with `strict: true`); the workspace-wide 95 is a `--at-least` flag on `configuration:type-coverage` | `nx run <project>:type-coverage`, also part of `typecheck-code` |
| Compiled size | Per project, in its own `codometer.config.ts`; only projects that emit something declare one                                                                                | `nx run <project>:codometer`                                    |
| Duplication   | **Not a gate.** Advisory only; nothing in CI runs it                                                                                                                        | `nx run configuration:jscpd`                                    |

**Type coverage is the one most often forgotten**: `typecheck` asks whether the types are consistent, `type-coverage` asks how much of the code is typed, and a project can pass the first and fail the second. A compiled-size breach belongs to [codometer-triage](../codometer-triage/SKILL.md).

When coverage falls short, raise it with tests of real behavior, following [raising-coverage.md](references/raising-coverage.md). **Never lower a threshold, or raise a limit, to make a change pass.**

## Common Patterns

### New skill added

A skill is one directory, `.agents/skills/<skill-name>/SKILL.md`. `.claude/skills` and `.github/skills` are symlinks to `.agents/skills`, so that one copy already serves both harnesses — there is no second copy to create and no table of contents to regenerate. AGENTS.md deliberately does not list the skills; agents are handed the installed set directly.

Keep its description to about 40 words and never over 128 (`nx run integration:skill-descriptions`). The only extra command applies to a skill installed from another repository, which `skills update` records in `skills-lock.json`:

```bash
# Regenerate the exclusion blocks that keep locked skills out of prettier,
# codometer, Linguist, cspell, and markdownlint
pnpm exec nx run integration:skill-exclusions:write
```

### Generated tables edited

The types and scopes tables in [CONTRIBUTING.md](../../../.github/CONTRIBUTING.md) and the [commit-code skill](../commit-code/SKILL.md) are generated between marker comments from [configuration/repository/conventional.config.cjs](../../../configuration/repository/conventional.config.cjs). Edit the config, never the table, then regenerate:

```bash
pnpm exec nx run integration:conventional-config:write
pnpm exec nx run integration:conventional-config:check
```

Everything outside those markers is hand-written and needs no synchronization run.

## Resources

- [triage-integration skill](../triage-integration/SKILL.md) — Detailed per-tool fix instructions for pre-commit failures
- [write-typescript skill](../write-typescript/SKILL.md) — TypeScript strict mode patterns
