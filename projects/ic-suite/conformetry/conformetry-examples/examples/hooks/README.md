# 🪝 Hooks

A generator can declare two functions that run around generation:
`preGenerate`, before any file is written, and `postGenerate`, after the
template is rendered. This example uses the first to refuse a bad name and the
second to write a receipt beside the configuration.

## Run it

```bash
pnpm exec nx run conformetry-examples:hooks
```

It prints the hook's own line, then the generated files, each indented two
spaces, with `<this folder>` standing for this example's directory. The
integration test asserts only the substrings `Receipt written:`,
`hooks/mars/mars.txt`, and `receipts/mars.log`:

```text
Receipt written: <this folder>/receipts/mars.log
  tmp/conformetry-examples/hooks/mars/mars.txt
  <this folder>/receipts/mars.log
```

The first line is the `postGenerate` hook announcing itself. The other two are
the run's own list of generated files: the rendered `mars.txt`, and the receipt,
which is on the list because the hook pushed it there.

The test also reads both files back. `mars.txt` holds `Receipt for mars.` and the
receipt names `mars.txt`. The receipt is not part of the template: the hook wrote
it through the same filesystem adapter the run uses, at a path built from the
directory that holds the configuration. `receipts/` is git-ignored, so delete it whenever you like.

Now give it a name the `preGenerate` hook refuses:

```bash
pnpm exec nx run conformetry-cli:start -- generate --template receipt --name "Not Kebab" --directory tmp/conformetry-examples/hooks-refused --config projects/ic-suite/conformetry/conformetry-examples/examples/hooks/conformetry.config.ts
```

The output names the refusal, and the test asserts the output contains:

```text
Refused "Not Kebab"
```

The run exits non-zero and `tmp/conformetry-examples/hooks-refused` does not
exist afterwards: the hook threw before anything was written.

`tmp/` is git-ignored, so delete it whenever you like.

## What is here

```text
hooks/
├── conformetry.config.ts                      the generator and both hooks
├── receipts/                                  written by the hook, git-ignored
└── templates/
    └── receipt/
        └── {{nameKebabCase}}/
            └── {{nameKebabCase}}.txt          the template
```

Three facts do all the work:

- **A hook is a function in the configuration.** It receives the generator's
  definition, its inputs, the substitutions rendered from them, the output
  directory, the filesystem adapter the run uses, the directory that holds the
  configuration, and, in `postGenerate`, the files rendered so far.
- **A hook that throws fails the run.** A throwing `preGenerate` leaves nothing
  written, as the refused run above shows. What a throwing `postGenerate` leaves
  behind depends on the host; the
  [generation README](../../../conformetry-generation/README.md#when-a-hook-throws)
  has the table.
- **Unknown keys under `hooks` are refused.** `afterGenerate` is not a hook, and
  the configuration is rejected rather than the key being ignored.

## Next

[failure-modes](../failure-modes/README.md), for what the whole toolchain lets
through.
