# 🪙 Exclusions

`include`, `exclude.paths`, and `exclude.words` decide which files and words
count, and `.gitignore` is always honored on top of them.

## Run it

```bash
cd examples/exclusions/project
mkdir scratch && echo 'export const leftoverWord = 1;' > scratch/leftover.ts
coinagerie
```

It exits 0 and prints four words: `harbor`, `high`, `tide`, and `water`.

## What it shows

[`coinagerie.config.ts`](project/coinagerie.config.ts) reads only `src/**`,
leaves out every `*.test.ts` file and the `src/generated` folder, and excludes
the words `service` and `src`. Five things are therefore missing from the
glossary:

- `mockTideTable`, because it lives in a test file.
- `GeneratedSchemaRow`, because it lives in an excluded folder.
- `service` and `src`, because the configuration names them.
- `leftoverWord`, because [`.gitignore`](project/.gitignore) hides `scratch/`.
  The guide has you create that folder yourself — an ignored file cannot be
  committed beside the example.

Globs are relative to the configuration file's folder, so the run behaves the
same wherever you start it.

## Next

[folding](../folding/README.md) — merge word forms into one headword.
