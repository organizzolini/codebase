# 🪙 Zero Configuration

Run `coinagerie` in a folder with no configuration file and it prints every
word the code uses, writes nothing, and reads nine languages at once.

## Run it

```bash
cd examples/zero-config/project
coinagerie
```

It exits 0 and prints a sorted glossary block of fifty headwords, each with an
empty definition (`- **dome**:`). No file is created or changed — printing is
the default, so trying the tool never edits yours.

## What it shows

[`project/`](project) is an invented observatory scheduler with one file per
language: TypeScript, Python, shell, JSON, YAML, SQL, HCL, CSS, and TOML. Each
file carries a word in a comment or a string that must not reach the glossary,
and each also carries identifiers that must:

- `TelescopeBookingService` contributes `telescope`, `book` (the inflection
  `booking` folds to its lemma), and `service`.
- A quoted key such as `"mirrorAngle"` or `starName` counts as an identifier;
  the value beside it does not.
- A file name contributes too: `rotate_mirror.py` gives `rotate` and `mirror`,
  and its extension is dropped.
- Language keywords such as `def`, `return`, `from`, and `select`, and values
  such as the CSS `red`, are words like any other. Nothing excludes them unless
  you add a keyword list to `exclude.words`.
- Nothing printed contains `hidden`, the word planted in every comment and
  string.

## Next

[exclusions](../exclusions/README.md) — choose which files and words count.
