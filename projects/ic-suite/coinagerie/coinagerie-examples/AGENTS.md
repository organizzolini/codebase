# 🪙 Coinagerie Examples — Agent Guide

Small invented projects with known words, and one runnable example per thing
coinagerie does. Read [README.md](README.md) for the guided tour; this file is
the lookup table for when coinagerie has already said something and you need to
know what to do about it.

## Run one

```bash
nx run coinagerie-examples:examples     # every example, gated on the exit code its guide promises
nx run coinagerie-examples:vitest       # every glossary and message the guides quote
```

One example on its own, which is what a guide's `## Run it` section names:

```bash
cd projects/ic-suite/coinagerie/coinagerie-examples/examples/check-failures/project
coinagerie --config missing.config.ts --check
```

## Coinagerie said X — open this example

| It said | It means | Open |
| ------- | -------- | ---- |
| `Found a glossary out of step with the code`, with a `missing` list | The code uses a word the glossary lacks. Run `--write`, then define the new bullet. Never add the word to `exclude.words` just to quiet it. | [`check-failures`](examples/check-failures/README.md) (`missing.config.ts`) |
| `Found a glossary out of step with the code`, with a `stale` list | The glossary lists a word the code no longer uses, or a word an `exclude.words` now covers. `--write` deletes it with its definition. | [`check-failures`](examples/check-failures/README.md) (`stale.config.ts`), [`layered-glossaries`](examples/layered-glossaries/README.md) |
| `Refused a glossary it cannot parse` | A stray line, a duplicated word, invalid JSON, or a non-string value. Nothing was written. Fix the glossary by hand; `--write` will not touch it. | [`check-failures`](examples/check-failures/README.md) (`unparsable`, `duplicate`, `broken-json`) |
| `Found no glossary destination to check` (or `to write`) | The configuration has no `outputs` and no `--output-json` or `--output-markdown` flag named one. | [`check-failures`](examples/check-failures/README.md) (`no-destination.config.ts`), [`outputs`](examples/outputs/README.md) |
| `Rejected the configuration`, naming a file | The file would not import, has the wrong shape, or its `exclude.words` or `fold` threw or returned the wrong type. | [`check-failures`](examples/check-failures/README.md) (`bad-shape`, `throwing-words`, `empty-fold`) |
| `Rejected the command line`: `--check and --write cannot be combined` | Pick one mode. | [`check-failures`](examples/check-failures/README.md) |
| A word you expected is missing from the glossary | It sits in a comment or a string, a file `.gitignore` hides, an `exclude.paths` glob, or an `exclude.words` list — or it folded into another headword (`aspects` into `aspect`, `booking` into `book`). | [`zero-config`](examples/zero-config/README.md), [`exclusions`](examples/exclusions/README.md), [`folding`](examples/folding/README.md) |
| A word appears that you did not expect | A quoted key, a file name, or a folder name counts as an identifier. | [`zero-config`](examples/zero-config/README.md) |
| Two similar words are listed separately (`configuration`, `configure`) | Derivational families stay apart unless the configuration's `fold` merges them. | [`folding`](examples/folding/README.md) |
| A package glossary repeats words the root already defines | The package's `exclude.words` does not read the root glossary. | [`layered-glossaries`](examples/layered-glossaries/README.md) |
| `--write` changed a definition you wrote | It did not. A definition survives for every word still in use; a stale word's definition is deleted with it. | [`outputs`](examples/outputs/README.md) |

## Layout

```text
coinagerie-examples/
├── examples/<name>/README.md          the guide
├── examples/<name>/project/           the fixture
└── testing/                           the driver, the run table, the runner, and the suite
```

- Every directory under `examples/` is one example and holds both a `README.md`
  and a `project/` folder. The runner fails on one without either.
- The fixtures carry no `.git` folder of their own; the harness adds an empty
  one to each staged copy so a copy is a repository of its own.

## Adding an example

- One folder under `examples/`, named for the behavior rather than numbered,
  holding a `README.md` and a `project/` folder.
- The guide: `# 🪙 Title`, a one- or two-sentence summary, `## Run it` with the
  exact command and the exit code it produces, the explanation, then `## Next`
  linking to the next example.
- A row in the `## The examples` table in [README.md](README.md), and a
  `## Next` link from the example before it.
- Each documented command in `EXAMPLE_RUNS` in [testing/runs.ts](testing/runs.ts).
  A guide with no run fails the `examples` target.
- A case in [testing/examples.integration.test.ts](testing/examples.integration.test.ts)
  asserting what the guide says it prints. An example with no test is a claim,
  not an example.
- A file the guide tells the reader to create, because the example's own
  `.gitignore` hides it, goes in `extraFiles` rather than the repository.
- Keep every fixture's words few enough to count, and plant a word in a comment
  and a string that must stay out.

## Do not fix a deliberately broken example

Nine of the ten `check-failures` configurations are meant to fail, and
`missing`, `stale`, `unparsable`, `duplicate`, `broken-json`, `no-destination`,
`bad-shape`, `throwing-words`, and `empty-fold` each exit non-zero on purpose.
Each is the reproduction of a message a reader will hit, and "fixing" one
deletes the only place that message is demonstrated.

The exit code each produces is recorded in `CHECK_FAILURE_EXIT_CODES` and in
the guide beside it. If a run disagrees with both, the tool changed — that is
the regression this package exists to catch.

Nothing ignored may be committed under `examples/`: a file both tracked and
ignored makes `git add` fail, and lint-staged re-stages every file it touches,
so one such file breaks the pre-commit hook on every later commit.

## Key files

| File | What it is |
| ---- | ---------- |
| [README.md](README.md) | The guided tour, and the `## The examples` index |
| [testing/coinagerie.ts](testing/coinagerie.ts) | The command-line seam every test and the runner go through |
| [testing/runs.ts](testing/runs.ts) | Every documented command and its promised exit code |
| [testing/run-examples.ts](testing/run-examples.ts) | The `examples` target, and the completeness checks |
