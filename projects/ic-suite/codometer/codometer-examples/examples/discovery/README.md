# 🧭 One named configuration

Codometer measures **one directory** and knows nothing about workspaces or
project graphs. The configuration is the file `--config` names: it is required,
nothing is searched for, and no other file contributes anything. There is no
`--directory` flag either, so which directory is measured is decided entirely
by where you run it from.

## Run it

```bash
# examples/discovery/nested carries its own configuration, and it answers alone:
# one badge, "Configurations", and none of this package's counters.
cd examples/discovery/nested
codometer --config codometer.config.ts

# The same folder, naming this package's configuration instead: "Service Files"
# and "Unit Tests" return, "Configurations" does not — and so does the
# package's own "Corpus" target, now reported as an empty match rather than a
# size, since this folder holds no examples/corpus/.
cd examples/discovery
codometer --config ../../codometer.config.ts

# Naming nothing is refused outright, naming the flag:
codometer
```

## What is here

```text
discovery/
└── nested/
    └── codometer.config.ts    answers alone whenever it is the one named
```

The named file answers alone; nothing from any other file is folded in,
because a merged configuration leaves a limit that never applied looking
exactly like one that did.

Three configuration files sit above that nested one — this package's, the
workspace root's, and the file the root one re-exports — and a run naming
`examples/discovery/nested/codometer.config.ts` takes nothing from any of them.

## A configuration is one plain object, whichever folder is measured

A configuration file authored as a function is no longer recognized — every
file is a plain object, resolved once and reused however it was reached.
This package's own [`codometer.config.ts`](../../codometer.config.ts) used to
be a function for exactly the reason a named file answers alone here: it
branched on whether the folder being measured was the package root itself
(where the corpus is a size-gated `Corpus` target) or a folder beneath it
(where it was not). That branch is gone along with the capability, so the same
file now answers both cases identically, `Corpus` target included.

Run the second command above and see it: the run still exits `0` — nothing
here asks for `--check` or `--output-*`, and a run that neither writes nor
gates only _reports_ a failure — but standard error now names a failed metric
alongside the badges, `Target "Corpus" matched no files, and a limit is
written against its "size" metric`. A folder measured with the package's
configuration but not equal to it always resolves the same `Corpus` target,
empty or not.

## Next

[staleness](../staleness/README.md), the last example, and the one that is a
warning rather than a feature.
