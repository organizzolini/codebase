---
type: "Reference"
title: "Coinagerie Testing"
description: "Documents the testing approach for the Coinagerie vocabulary toolchain. Covers unit tests for vocabulary extraction, folding, and exclusion logic; integration tests for glossary generation and comparison; CLI packing tests; and test fixtures for multi-language projects."
tags: ["testing", "coinagerie", "vocabulary", "glossary", "integration", "unit", "fixtures"]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-25T18:55:00.444Z
sources:
  - id: openwiki-source-0144ea531e31aa5c07ef9da9
    resource: repo://configuration/typescript/vitest.config.ts
  - id: openwiki-source-146038c965029e9cdb787e14
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/configuration/vitest.config.ts
  - id: openwiki-source-c782c5f4d341f62f31fe8aab
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/package.json
  - id: openwiki-source-fadb2af32c0186cd8acc2af5
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/project.json
  - id: openwiki-source-cb8ea6fd8e68fb0f16b0e7e6
    resource: repo://projects/ic-suite/coinagerie/coinagerie-cli/testing/coinagerie-cli.packed.test.ts
  - id: openwiki-source-15f3036c83c5c3226c3adb12
    resource: repo://projects/ic-suite/coinagerie/coinagerie-examples/configuration/vitest.config.ts
  - id: openwiki-source-31ea8c6f11daca322fa216fd
    resource: repo://projects/ic-suite/coinagerie/coinagerie-examples/project.json
  - id: openwiki-source-c8b7d99bf6b40ca5c69d264c
    resource: repo://projects/ic-suite/coinagerie/coinagerie-examples/testing/examples.integration.test.ts
  - id: openwiki-source-0f786c03187701a6ebb1d9c5
    resource: repo://projects/ic-suite/coinagerie/coinagerie-examples/testing/run-examples.ts
  - id: openwiki-source-7a131128109833bdb63e9a41
    resource: repo://projects/ic-suite/coinagerie/coinagerie-examples/testing/runs.ts
  - id: openwiki-source-fd5a7207dc2eee266f96846a
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/configuration/vitest.config.ts
  - id: openwiki-source-30d75b38e319b302ec825e0e
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/project.json
  - id: openwiki-source-d33e44f6901d7d4ceb3e57a7
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/css/css.service.unit.test.ts
  - id: openwiki-source-316d4a6ddfb90ca45669f3f6
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/hcl/hcl.service.unit.test.ts
  - id: openwiki-source-1f07bedbda3ed1448a3c266c
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/json/json.service.unit.test.ts
  - id: openwiki-source-fc296e128961e50602af9a4f
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/python/python.service.unit.test.ts
  - id: openwiki-source-f0e5361f594c1ff202b9444a
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/shell/shell.service.unit.test.ts
  - id: openwiki-source-b52a50773a21e7b247badb0f
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/sql/sql.service.unit.test.ts
  - id: openwiki-source-0d0478931a571547a5fe675b
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/toml/toml.service.unit.test.ts
  - id: openwiki-source-a6da73760dcfc790b72a1102
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.unit.test.ts
  - id: openwiki-source-d4f062129c82d76b6e718cc9
    resource: repo://projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.unit.test.ts
  - id: openwiki-source-fea62684da5ba2d95dcc3522
    resource: repo://projects/ic-suite/coinagerie/coinagerie-nx/project.json
  - id: openwiki-source-76dff91407afb2340c85cf82
    resource: repo://projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/batch-executor.unit.test.ts
  - id: openwiki-source-91a28ef941c24037a736a4ca
    resource: repo://projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.unit.test.ts
  - id: openwiki-source-5f1facf0bc98490e5f722055
    resource: repo://projects/ic-suite/coinagerie/coinagerie-nx/src/index.unit.test.ts
  - id: openwiki-source-64bb17892814f6763ed7e353
    resource: repo://projects/ic-suite/coinagerie/coinagerie-nx/testing/coinagerie-nx.packed.test.ts
  - id: openwiki-source-d9beb5e3b1172ee0958ece67
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/configuration/vitest.config.ts
  - id: openwiki-source-347c68f86a13b6e7135295c1
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/package.json
  - id: openwiki-source-d740ffb7861a3fb7c35528bc
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/project.json
  - id: openwiki-source-3a3a2838d2fe0c4a69fbc396
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/src/modules/comparison/comparison.service.unit.test.ts
  - id: openwiki-source-dea2e37fcae41ab7580606ff
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.unit.test.ts
  - id: openwiki-source-d7074d13eebe5468e0a3abff
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.unit.test.ts
  - id: openwiki-source-ca0b640deef8aa0bba6169b6
    resource: repo://projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.unit.test.ts
  - id: openwiki-source-b8296c6a1f153d2490c9a361
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/configuration/vitest.config.ts
  - id: openwiki-source-8c0b95231e8cdb31b9cc8c5f
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/package.json
  - id: openwiki-source-570f4b453a6a63a61dce6558
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/project.json
  - id: openwiki-source-e0ce648d3104cf4b33e8d245
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/src/modules/discovery/discovery.service.unit.test.ts
  - id: openwiki-source-788a78ad1419fa56a74f4c36
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/src/modules/folding/folding.service.unit.test.ts
  - id: openwiki-source-b1d9c1c32186d3dc76de908d
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/src/modules/vocabulary/vocabulary.service.unit.test.ts
  - id: openwiki-source-f79d9d1e2be203a6739ca67e
    resource: repo://projects/ic-suite/coinagerie/coinagerie-vocabulary/src/modules/words/words.service.unit.test.ts
generated: { by: "openwiki/0.9.0", at: "2026-11-25T18:55:00.444Z" }
---

# Coinagerie Testing

This document describes the testing strategy for the Coinagerie vocabulary toolchain — a set of packages that discover, fold, exclude, render, and compare the vocabulary of a codebase.

## Test Organization

Coinagerie tests are organized by package, each with its own `vitest` configuration extending a shared base:

| Package | Test Command | Purpose |
|---------|--------------|---------|
| `@coinagerie/cli` | `nx run coinagerie-cli:vitest` | CLI packing and end-to-end command tests |
| `@coinagerie/vocabulary` | `nx run coinagerie-vocabulary:vitest` | Discovery, tokenization, word splitting, folding, exclusion |
| `@coinagerie/output` | `nx run coinagerie-output:vitest` | Markdown/JSON rendering, comparison, anchor block splicing |
| `@coinagerie/languages` | `nx run coinagerie-languages:vitest` | Tokenizers for TypeScript, Python, JSON, YAML, TOML, Shell, SQL, HCL, CSS |
| `@coinagerie/examples` | `nx run coinagerie-examples:examples` | Integration smoke gate over documented example runs |
| `@coinagerie/nx` | `nx run coinagerie-nx:vitest` | Nx plugin inference, `coinagerie-check` executor, and batch executor tests |

All packages require **100% type coverage** (`typeCoverage.atLeast: 100`, `strict: true`) and **96% code coverage** on branches, functions, lines, and statements (defined in `configuration/typescript/vitest.config.ts`).

## Vocabulary Service Unit Tests (`coinagerie-vocabulary`)

The vocabulary service is the core of Coinagerie. Its unit tests exercise the complete pipeline: file discovery → language tokenization → word splitting → folding → exclusion → sorted headwords.

### Test Infrastructure

- **`buildTestingModule`** (from `@codebase/testing/nestjs`) — compiles a minimal NestJS testing module with real providers (no mocks for internal services)
- **`createTemporaryDirectory`** (from `@codebase/testing`) — creates an isolated temporary directory with its own `.git` folder so `.gitignore` rules are self-contained
- **`writeTree`** helper — writes a fixture tree keyed by relative path

### Discovery Tests (`discovery.service.unit.test.ts`)

Tests file discovery honoring `.gitignore` rules at every level:

```typescript
it("honors every .gitignore inside the root, the innermost deciding", () => {
  writeTree({
    ".gitignore": "*.log\nbuild/\n",
    "build/out.js": "",
    "debug.log": "",
    "nested/.gitignore": "!keep.log\n",
    "nested/keep.log": "",
    "src/a.ts": "",
  });
  expect(discover()).toStrictEqual([
    ".gitignore",
    "nested/.gitignore",
    "nested/keep.log",
    "src/a.ts",
  ]);
});
```

Key behaviors tested:
- Lists every file including dotfiles, sorted and relative to root
- Innermost `.gitignore` wins (negation patterns work)
- `include` / `exclude.paths` globs filter the discovered set
- Symlinks outside the root are not followed
- Files written to glossary destinations are excluded from discovery

### Word Splitting Tests (`words.service.unit.test.ts`)

Tests `splitIdentifier` (camelCase, PascalCase, snake_case, SCREAMING_SNAKE, kebab-case, dotted, prefixed) and `splitPath` (drops final extension, splits on separators):

```typescript
it.each([
  ["CallidescopeGateService", ["callidescope", "gate", "service"]],
  ["HTTPServer", ["http", "server"]],
  ["snake_case_name", ["snake", "case", "name"]],
  ["dotted.name.parts", ["dotted", "name", "parts"]],
  ["#privateField", ["private", "field"]],
])("splits %s", (raw, expected) => {
  expect(service.splitIdentifier(raw)).toStrictEqual(expected);
});
```

Drops: one-letter parts, pure numbers, trailing digit runs, empty/only-separators.

### Folding Tests (`folding.service.unit.test.ts`)

Tests English inflection folding (plurals → singular, past/present participles → lemma, irregulars) and the configurable `fold` function:

```typescript
it.each([
  ["a regular plural", "aspects", "aspect"],
  ["an irregular plural", "indices", "index"],
  ["a plural in -ies", "glossaries", "glossary"],
  ["a past participle", "configured", "configure"],
  ["an irregular past tense", "ran", "run"],
])("folds %s", (_case, word, expected) => {
  expect(service.fold(word)).toBe(expected);
});

it("runs the configured fold on the folded lemma, not the surface form", () => {
  const fold = (word: string) => word === "configure" ? "setup" : word;
  expect(service.headword("configured", configure(fold))).toBe("setup");
});
```

Invariants: keeps 2-letter words (`ts`, `as`, `js`) whole; leaves derivational family members (`configuration`), invariants (`series`), and bare lemmas alone.

### Exclusion Tests (`vocabulary.service.unit.test.ts`)

Tests the full exclusion pipeline: `exclude.words` (exact strings, case-insensitive), `exclude.patterns` (RegExp tested against raw lowercase word AND folded headword), and `exclude.paths` (globs). Key assertions:

```typescript
it("excludes after the configured fold, so a merged family goes together", async () => {
  writeTree({ "src/main.ts": "const configuration = configure;\n" });
  const fold = (word) => word === "configuration" ? "configure" : word;
  await expect(service.collect(configure({
    exclude: { paths: [], patterns: [], words: ["configuration"] },
    fold,
  }))).resolves.toStrictEqual(["main", "src"]);
});

it("tests a pattern against the folded headword, so a pattern for the singular covers its plural", async () => {
  writeTree({ "src/main.ts": "const services = 1;\nconst gate = 2;\n" });
  await expect(service.collect(configure({
    exclude: { paths: [], patterns: [/^service$/], words: [] },
  }))).resolves.toStrictEqual(["gate", "main", "src"]);
});
```

Language keywords (`default`, `type`, `return`, `def`, `select`, `from`, CSS `red`, etc.) are treated as words like any other — they appear in the glossary unless explicitly added to `exclude.words`.

## Language Tokenizer Tests (`coinagerie-languages`)

Each language module has a dedicated unit test file testing its `tokenize(source, filePath)` method. All tokenizers share a `ScannerService` (state machine for strings, comments, numbers) and declare an `Object` dependency fallback when the scanner isn't loaded yet (import-cycle guard tested explicitly).

### Covered Languages

| Language | Test File | Key Behaviors |
|----------|-----------|---------------|
| TypeScript | `typescript.service.unit.test.ts` | Declarations, classes, decorators, private fields, template literals (keep substitutions), regex, object keys (quoted/computed), enum members, imports (aliases, not specifiers), TSX elements/attributes, keywords excluded |
| Python | `python.service.unit.test.ts` | Comments (line, inline), strings (single, double, triple, raw, bytes, f-string), docstrings excluded, dict keys/values, numbers, underscores, non-ASCII names |
| JSON | `json.service.unit.test.ts` | Keys (quoted, escaped, multi-line), nested objects, arrays of objects/strings, comments (line/block), unterminated handling |
| YAML | `yaml.service.unit.test.ts` | Keys (bare, quoted, hyphenated, dotted, with colons), nested mappings, sequences, flow style, block scalars (literal/folded), anchors/aliases, tags, directives, comments |
| Shell | `shell.service.unit.test.ts` | Commands, variables, comments, quoted strings (single/double/ansi-c), here-docs (quoted/indented), arithmetic, here-strings, associative arrays |
| SQL | `sql.service.unit.test.ts` | Keywords, identifiers (double-quoted, backtick, empty), dollar-quoted bodies (tagged/unterminated), positional params (`$1`), string prefixes (`E'`, `N'`, `X'`), comments |
| HCL | `hcl.service.unit.test.ts` | Attributes, blocks (labels, unlabeled), object keys, interpolations, here-docs, comments (hash/slash/block), comparisons, for expressions |
| CSS | `css.service.unit.test.ts` | Rules, custom properties (`--name`), vendor prefixes, at-rules, pseudo-elements, attribute selectors, URLs (quoted/unquoted), comments, strings |
| TOML | `toml.service.unit.test.ts` | Keys (bare, quoted, dotted, hyphenated), tables (regular, dotted, array), inline tables, strings (basic, literal, multi-line), dates, numbers (underscores), booleans |

### Common Tokenizer Patterns

- **Comments and string values are never tokenized** — only identifiers, keys, and structural tokens
- **Strings are excluded entirely** — their content never produces words
- **Numbers and pure punctuation are dropped**
- **Repeated tokens are kept** (tests assert exact multiplicity)
- **Linear-time parsing** — JSON test includes a 50,000-key minified document

## Output Service Unit Tests (`coinagerie-output`)

### Comparison Tests (`comparison.service.unit.test.ts`)

Tests `compare(words, glossary)` → `{ missing, stale }` and `reconcile(words, glossary)` → sorted glossary preserving definitions:

```typescript
it.each([
  ["agreement", ["alpha", "beta"], ["alpha", "beta"], [], []],
  ["missing words", ["alpha", "beta", "gamma"], ["beta"], ["alpha", "gamma"], []],
  ["stale words", ["beta"], ["zeta", "beta", "alpha"], [], ["alpha", "zeta"]],
])("compares %s", (_case, words, listed, missing, stale) => {
  expect(service.compare(words, new Map(listed.map(w => [w, "defined"]))))
    .toStrictEqual({ missing, stale });
});
```

Empty definitions (`""`) never count as missing or stale.

### Markdown Rendering Tests (`markdown.service.unit.test.ts`)

Tests rendering a glossary `Map<word, definition>` into an anchor-delimited block:

```
<!-- coinagerie:start -->
## 🪙 Coinagerie

Words this project uses.

- **aspect**: An angle between two bodies.
- **gate**:

<!-- coinagerie:end -->
```

Behaviors:
- Sorts words alphabetically
- Description rendered under heading (optional)
- Empty glossary → heading only
- Multi-line definitions preserved with indentation

### JSON Rendering Tests (`json.service.unit.test.ts`)

Tests flat JSON object with sorted keys, escaped quotes, empty string for undefined:

```json
{
  "angle": "",
  "aspect": "First.",
  "phase": "Second.\n  Continued."
}
```

Parses back to the same structure; rejects non-objects, non-string values, invalid JSON.

### Delivery Tests (`delivery.service.unit.test.ts`)

Tests `check(destinations, words)` and `write(destinations, words)` for multiple outputs (markdown + JSON), each judged independently:

- `check` returns per-destination `{ missing, stale, path, type }`
- `write` splices into anchor blocks (appends if absent), preserves definitions for words still in use, adds bare entries for new words, deletes stale words entirely
- `--check` and `--write` together is rejected before execution
- Parse failures (malformed JSON, duplicate keys, stray anchor content) fail without modifying files

## Nx Plugin Tests (`coinagerie-nx`)

The `@coinagerie/nx` package provides the `coinagerie-check` inferred target and its executor. Its tests cover the plugin's target inference, the single-project executor, and the batch executor that runs `coinagerie batch` across multiple projects.

### Target Inference Tests (`index.unit.test.ts`)

Tests that the plugin infers a `coinagerie-check` target for every project containing a `coinagerie.config.*` file:

```typescript
it("infers coinagerie-check for a project with a config file", () => {
  const targets = createProjectGraphAndInferTargets({
    "packages/alpha/coinagerie.config.ts": "",
  });
  expect(targets["alpha"]).toContain("coinagerie-check");
});
```

### Check Executor Unit Tests (`executor.unit.test.ts`)

Tests the single-project `checkExecutor` that spawns the `coinagerie batch` command:

- Passes when the CLI exits 0 (glossary matches vocabulary)
- Fails with the CLI's report when the CLI exits non-zero (missing/stale words)
- Writes the glossary when `write: true` option is passed
- Rejects execution with no project or an unknown project

### Batch Executor Unit Tests (`batch-executor.unit.test.ts`)

Tests the batched execution that runs one `coinagerie batch` process per project:

```typescript
it("judges every task from one process, each by its own verdict", async () => {
  const results = await checkBatchExecutor(
    ...buildArguments(["a", "bad-b", "c"]),
  );

  expect(results).toStrictEqual({
    "a:coinagerie-check": { success: true, terminalOutput: "" },
    "bad-b:coinagerie-check": {
      success: false,
      terminalOutput: "missing: argv",
    },
    "c:coinagerie-check": { success: true, terminalOutput: "" },
  });
});
```

Key behaviors:
- Judges every task from one process, each by its own verdict
- Prints a failed task's report under its task ID, nothing for a passing one
- Writes the tasks that ask to write, in a process of their own
- Fails a task whose process printed no verdict, without losing its peers
- Fails every task of a group whose process printed no verdicts, with what it printed
- Fails every task when the process prints invalid JSON (not a list, list holding non-verdicts)
- Fails a task whose project the graph does not know, without losing its peers
- Starts nothing for a batch of no tasks

### Packed Plugin Test (`coinagerie-nx.packed.test.ts`)

End-to-end test that installs the packed `@coinagerie/nx` plugin into an isolated Nx workspace and runs the inferred `coinagerie-check` target:

```typescript
it("passes the check of a project whose glossary covers its words", async () => {
  const written = await runTarget("documented:coinagerie-check", ["--write"]);
  expect(written.exitCode).toBe(0);

  const result = await runTarget("documented:coinagerie-check");
  expect(result.exitCode).toBe(0);
});

it("fails the check of a project whose glossary lacks its words", async () => {
  const result = await runTarget("undocumented:coinagerie-check");
  expect(result.exitCode).not.toBe(0);
  expect(result.stdout + result.stderr).toContain("orbit");
});
```

This validates the complete inference → execution → verdict pipeline against the exact tarball that would be published.

## CLI Packing Tests (`coinagerie-cli`)

The CLI package has a unique test: **`coinagerie-cli.packed.test.ts`** verifies the published `@coinagerie/cli` tarball contents by installing it into a temporary sandbox and running the binary.

### Test Harness

- **`createTarballSandboxRunner`** (from `@codebase/testing/end-to-end`) — creates an isolated npm sandbox with the workspace packages packed as tarballs
- **`run-command.ts`** — spawns the real CLI via `node --import @swc-node/register/esm-register src/coinagerie-cli.main.ts` in a separate process (tests exit codes, stdout, stderr, and written files)

### What It Validates

```typescript
it("lists its commands under --help", async () => {
  const result = await sandbox.command("coinagerie", ["--help"]).run();
  expect(result.stdout).toContain("collect");
  expect(result.stdout).toContain("batch");
});

it("collects the words of a project into a glossary", async () => {
  const result = await coinagerie(writeProject(), []);
  expect(result.stdout).toContain("- **orbit**:");
  expect(result.stdout).toContain("- **planner**:");
});

it("writes a glossary that checks clean, then fails once a word goes missing", async () => {
  const written = await coinagerie(directory, ["--output-markdown", "WORDS.md", "--write"]);
  const clean = await coinagerie(directory, ["--output-markdown", "WORDS.md", "--check"]);
  // ... then delete a word from source and verify --check fails
});
```

This test runs against the **exact tarball** that would be published to npm, catching:
- Missing files in `package.json` `files` array
- Broken bin entry paths
- Missing dependencies
- TypeScript compilation errors in the packed output

## Example Integration Tests (`coinagerie-examples`)

The examples package serves as the **integration smoke gate**. It ships seven example projects under `examples/`:

| Example | Tests |
|---------|-------|
| `zero-config` | Default behavior across 9 languages, no config file |
| `exclusions` | `include`, `exclude.paths`, `exclude.words`, `.gitignore` |
| `exclusion-patterns` | RegExp patterns in `exclude.words` |
| `folding` | Plural/inflection folding + custom `fold` function |
| `layered-glossaries` | Multi-package glossaries sharing root words via `exclude.words` |
| `outputs` | Markdown block + JSON file, `--check` / `--write` / `--format json` |
| `check-failures` | 10 failure configurations with exact exit codes and messages |

### Test Execution

Two complementary test suites:

1. **`examples.integration.test.ts`** — Asserts exact glossary contents and refusal messages for each documented run. Uses `runCoinagerie()` (spawns real CLI via `swc-node`) and `readWords()` (parses markdown bullets). Runs in staged copies (each test gets a fresh `tmp/` clone of the example's `project/`).

2. **`run-examples.ts`** (invoked via `nx run coinagerie-examples:examples`) — Smoke gate that runs every documented command and gates on the exit code the guide promises. Also validates **completeness**:
   - Every example has a `README.md`
   - Every example has a `project/` folder
   - Every example is linked from the package guide index table
   - Every example has at least one entry in `testing/runs.ts` (`EXAMPLE_RUNS`)
   - Every `check-failures` config on disk is named in `CHECK_FAILURE_EXIT_CODES`

### Test Fixtures

Example projects are self-contained under `examples/<name>/project/` with:
- Source files in multiple languages
- `coinagerie.config.ts` (except `zero-config`)
- Expected glossary files (`README.md`, `GLOSSARY.md`, `glossary.json`)
- `.gitignore` for exclusion tests

The `folding` example demonstrates:
- `aspects` → `aspect` (plural folding)
- `configured`, `configuring` → `configure` (inflection folding)
- `configuration` → `configure` via custom `fold` (derivational merge)
- `services` excluded via async `exclude.words` function (runs after folding)

The `layered-glossaries` example demonstrates:
- Root config scans `shared/`, writes `GLOSSARY.md`
- Package config reads root glossary, returns headwords from `exclude.words`
- Moving a word up requires manual edit + root `--write` → package `--check` fails on stale

## Test Configuration

All packages extend `configuration/typescript/vitest.config.ts` with package-specific coverage exclusions:

```typescript
// coinagerie-cli/vitest.config.ts
defineConfig({
  test: {
    coverage: {
      exclude: [
        "src/**/*.constants.ts",
        "src/**/*.module.ts",
        "src/**/*.test.ts",
        "src/**/*.types.ts",
        "src/coinagerie-cli.module.ts",
        "src/coinagerie-cli.main.ts",
      ],
    },
  },
});
```

The examples package disables coverage (`include: []`) and extends timeouts to 180s because each test spawns the full CLI (cold `swc-node` start + Nest bootstrap).

## Running Tests

```bash
# Unit tests per package
nx run coinagerie-vocabulary:vitest
nx run coinagerie-output:vitest
nx run coinagerie-languages:vitest
nx run coinagerie-nx:vitest

# CLI packing test (slow, spawns tarball sandbox)
nx run coinagerie-cli:vitest

# Integration smoke gate over all examples
nx run coinagerie-examples:examples

# All affected tests (CI command)
nx affected --target=vitest --base=main
```

## Key Invariants

1. **No mocks for internal services** — `buildTestingModule` wires real providers; only external I/O (Docker, network) is mocked
2. **Self-contained fixtures** — every test creates its own temporary directory with `.git`; no test depends on another's state
3. **Real CLI for integration** — examples tests spawn the actual binary; no in-process invocation
4. **Exact tarball validation** — CLI packing test runs against the published artifact, not the source
5. **Completeness gates** — examples runner fails on missing docs, unlinked examples, undocumented runs, not just wrong output
6. **Exit codes are the contract** — refusal messages are tested verbatim; a wording change fails the test
