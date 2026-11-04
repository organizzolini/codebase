# 🪙 Folding

Plurals and inflections fold into one headword, `fold` merges a family you
choose, and `exclude.words` applies after all of it.

## Run it

```bash
cd examples/folding/project
coinagerie
```

It exits 0 and prints four words: `aspect`, `configure`, `engine`, and `src`.

## What it shows

[`src/aspect-engine.ts`](project/src/aspect-engine.ts) uses `aspects`,
`configured`, `configuring`, `configuration`, and `services`. The glossary
holds:

- `aspect` once, because the plural `aspects` folds into its singular.
- `configure` once, because `configured` and `configuring` fold into their
  lemma, and the configuration's own `fold` sends the derivational relative
  `configuration` there too. Left alone, `configuration` would stay a separate
  entry with a definition of its own.
- No `service`, although only `services` appears in the code. The configuration
  excludes `service` with an async function, and exclusion runs after folding,
  so the plural is covered.

`fold` must be synchronous and return a non-empty string. An empty return is
refused; see [check-failures](../check-failures/README.md).

## Next

[layered-glossaries](../layered-glossaries/README.md) — keep shared words in
one place.
