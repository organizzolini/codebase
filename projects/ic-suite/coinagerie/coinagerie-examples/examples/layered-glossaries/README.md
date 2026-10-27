# 🪙 Layered Glossaries

A package's configuration can read the root glossary through `exclude.words`,
so each package defines only the words the root does not cover.

## Run it

```bash
cd examples/layered-glossaries/project
coinagerie --config coinagerie.config.ts --check
coinagerie --config packages/billing/coinagerie.config.ts --check
```

Both exit 0 and print that the glossary is in step with the code.

## What it shows

The root [`coinagerie.config.ts`](project/coinagerie.config.ts) scans `shared/`
and writes [`GLOSSARY.md`](project/GLOSSARY.md): `ledger`, `share`, and `unit`.
The billing package's [configuration](project/packages/billing/coinagerie.config.ts)
is ordinary code, so it reads those headwords out of `GLOSSARY.md` and returns
them from `exclude.words`. Coinagerie never reads another glossary itself; the
file reading is the configuration's own.

[Billing's glossary](project/packages/billing/README.md) therefore lists
`date`, `due`, `invoice`, and `src`, but not `ledger` or `unit`, though its code
uses both.

Moving a word up is deliberate and manual. Add `invoice` to `GLOSSARY.md` and
billing's check fails, naming `invoice` as stale: it is excluded now, so the
package glossary should not list it. Delete the line from billing's README and
the check passes again.

## Next

[outputs](../outputs/README.md) — write the glossary as markdown and JSON.
