# 🪙 Exclusion Patterns

`exclude.words` takes regular expressions as well as exact words, so one entry
can leave out a whole family of headwords.

## Run it

```bash
cd examples/exclusion-patterns/project
coinagerie
```

It exits 0 and prints three words: `check`, `mdx`, and `src`. The file name
`checks` folds into its singular, as every word does.

## What it shows

[`coinagerie.config.ts`](project/coinagerie.config.ts) excludes two patterns:
`/^md\d{3}$/` for lint rule IDs and `/^(task|test|risk)\d{3}$/` for plan IDs.
[`src/checks.ts`](project/src/checks.ts) declares `md001`, `md013`, `task001`, and
`test002`, which both patterns match, so none of them is listed. `mdx` is kept,
because no pattern matches it.

A pattern is tested against each word twice: as the lowercase word the code
wrote, and as its headword after folding. Words are lowercase, so a pattern
needs the `i` flag to match uppercase text. A pattern never sees a separator,
because the words never hold one: `task-001` is only `task`, so write the pattern
for `task001`.

## Next

[folding](../folding/README.md) — merge word forms into one headword.
