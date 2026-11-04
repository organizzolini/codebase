# 🪙 Check Failures

One fixture, ten configurations, and every message coinagerie can fail a run
with.

## Run it

```bash
cd examples/check-failures/project
coinagerie --config missing.config.ts --check
```

That exits 1. Swap `missing` for another configuration name to reproduce the
others.

## What it shows

Every configuration scans the same
[`src/lunar-phase.service.ts`](project/src/lunar-phase.service.ts), whose words
are `angle`, `aspect`, `lunar`, `phase`, `service`, and `src`, and points at a
different glossary under [`glossaries/`](project/glossaries).

| Configuration | Exit | Message |
| ------------- | ---- | ------- |
| `missing` | 1 | `Found a glossary out of step with the code`, naming `angle`, `service`, and `src` under `missing` |
| `stale` | 1 | The same message, naming `vanished` under `stale` |
| `undefined` | 0 | `Found every glossary in step with the code` — empty definitions never fail |
| `unparsable` | 1 | `Refused a glossary it cannot parse`: a stray line inside the block |
| `duplicate` | 1 | `Refused a glossary it cannot parse`: `lunar` listed twice |
| `broken-json` | 1 | `Refused a glossary it cannot parse`: a JSON destination holding invalid JSON |
| `no-destination` | 1 | `Found no glossary destination to check` |
| `bad-shape` | 1 | `Rejected the configuration`: `exclude` must be an object |
| `throwing-words` | 1 | `Rejected the configuration`: `exclude.words` threw, and the file is named |
| `empty-fold` | 1 | `Rejected the configuration`: `fold` returned an empty string |

Add `--write` and the three parse refusals still exit 1 and leave the glossary
untouched, so a malformed edit never deletes a hand-written definition. Passing
`--check` and `--write` together is rejected before anything runs.

## Next

Back to the [guided tour](../../README.md).
