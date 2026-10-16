# 🪝 Hooks

A generator can declare two functions that run around generation:
`preGenerate`, before any file is written, and `postGenerate`, after the
template is rendered. This example uses the first to refuse a bad name and the
second to write a receipt beside the generated file.

## Run it

```bash
pnpm exec nx run conformetry-examples:hooks
```

```text
Receipt written: tmp/conformetry-examples/hooks/mars/receipt.log
  tmp/conformetry-examples/hooks/mars/mars.txt
```

The receipt is not part of the template: the `postGenerate` hook wrote it, so
the command does not list it among the files it rendered.

Now give it a name the `preGenerate` hook refuses:

```bash
pnpm exec nx run conformetry-cli:start -- generate --template receipt --name "Not Kebab" --directory tmp/conformetry-examples/hooks-refused --config projects/ic-suite/conformetry/conformetry-examples/examples/hooks/conformetry.config.ts
```

The run exits non-zero and `tmp/conformetry-examples/hooks-refused` does not
exist afterwards: the hook threw before anything was written.

`tmp/` is git-ignored, so delete it whenever you like.

## What is here

```text
hooks/
├── conformetry.config.ts                      the generator and both hooks
└── templates/
    └── receipt/
        └── {{nameKebabCase}}/
            └── {{nameKebabCase}}.txt          the template
```

Three facts do all the work:

- **A hook is a function in the configuration.** It receives the generator's
  definition, its inputs, the substitutions rendered from them, the output
  directory, and, in `postGenerate`, the files rendered so far.
- **A hook that throws fails the run.** A throwing `preGenerate` leaves nothing
  written; a throwing `postGenerate` leaves what the render already wrote.
- **Unknown keys under `hooks` are refused.** `afterGenerate` is not a hook, and
  the configuration is rejected rather than the key being ignored.

## Next

[embedding](../embedding/README.md), for driving the same generation from your
own tool.
