# 🪙 Outputs

An `outputs` array writes the glossary as a markdown block, a flat JSON object,
or both, and each destination is judged on its own.

## Run it

```bash
cd examples/outputs/project
coinagerie --check
coinagerie --write
coinagerie --format json
```

The first two exit 0 and leave the files byte for byte as they were. The third
prints the flat JSON glossary of six words with empty definitions.

## What it shows

[`coinagerie.config.ts`](project/coinagerie.config.ts) names two destinations.
The block in [`README.md`](project/README.md) sits between `coinagerie:start`
and `coinagerie:end` under a `## 🪙 Coinagerie` heading, with the description
the configuration gave it. [`glossary.json`](project/glossary.json) is a flat
object sorted by word, with `""` for an undefined one.

The two hold different definitions on purpose. `kilometer` is defined in the
markdown block and empty in the JSON; `orbit` is the reverse. Neither write
copies a definition across.

- `--write` keeps every definition for a word still in use, adds a bare
  `- **word**:` (or `""`) for a new word, and deletes a stale word with its
  definition. A second write changes nothing.
- A destination with no anchors gets the block appended on the first write.
- `--check` passes while definitions are empty; only a missing or stale word
  fails it.
- A flag such as `--output-json glossary.json` replaces the configured
  `outputs`.

## Next

[check-failures](../check-failures/README.md) — every message `--check` can
print.
