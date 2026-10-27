# 🪙 Coinagerie Examples

**Small invented multi-language projects, one per thing coinagerie does.**

Coinagerie lists the words a codebase uses and keeps a glossary of them in
step with the code. Reading about folding, layered glossaries, or a `--check`
that refuses to run is slower than trying them against something small enough
to hold in your head.

This package is that something. Every project is invented — none is copied
from this repository — and every command in every guide is runnable. A test
asserts each glossary and each failure message, so a guide that drifts from the
tool fails a check rather than misleading you.

```bash
nx run coinagerie-examples:examples   # run every example, gate on the exit code its guide promises
nx run coinagerie-examples:vitest     # assert every glossary and message below
```

Agents arriving from a coinagerie failure should start at
[AGENTS.md](AGENTS.md), which maps "coinagerie said X" to the example that
explains X.

## The examples

Each directory under [`examples/`](examples) is one example. It holds a
`README.md` guide and a `project/` folder, the small codebase the guide runs
coinagerie over. Read them in this order for a walkthrough; jump straight in
for an answer. Every command starts from `cd examples/<name>/project`, because
the folder a run starts in is the folder it scans unless `--config` names a
file elsewhere.

| Example | Answers |
| ------- | ------- |
| [zero-config](examples/zero-config/README.md) | What does `coinagerie` do in a folder with no configuration? |
| [exclusions](examples/exclusions/README.md) | How do I leave files and words out? |
| [folding](examples/folding/README.md) | How do `aspects` and `aspect` become one entry, and `configuration` and `configure`? |
| [layered-glossaries](examples/layered-glossaries/README.md) | How does a package avoid redefining the root's words? |
| [outputs](examples/outputs/README.md) | How do I write markdown and JSON, and what does `--write` keep? |
| [check-failures](examples/check-failures/README.md) | Why did `--check` fail, and what does each message mean? |

## The fixtures

A guide's `project/` folder is the fixture: a few files, a handful of words,
small enough to count by hand. A guide quoting "four words" is only worth
reading if you can check.

- Nothing in a fixture is meant to be good code. Every file exists to be read
  for its words, and the polyglot and check-failure sources carry words in
  comments and strings that have to stay out of the glossary.
- The `coinagerie` command line is also run against these fixtures by its own
  end-to-end suite, in [coinagerie-cli](../coinagerie-cli), so a change to a
  fixture is a change to that suite.

## Layout

```text
coinagerie-examples/
├── examples/
│   └── <name>/
│       ├── README.md                  the guide for this example
│       └── project/                   the fixture the guide runs coinagerie over
└── testing/
    ├── coinagerie.ts                  the command-line driver every test goes through
    ├── runs.ts                        every documented command and the exit code its guide promises
    ├── run-examples.ts                the `examples` target's runner
    └── examples.integration.test.ts   the glossaries and messages the guides quote
```

- Every run happens in a staged copy under this package's gitignored `tmp/`,
  never in the committed fixture and never in the system temporary directory:
  a copy outside the workspace breaks the swc register hook on a Linux runner.
- There is no `src/`. Every line of TypeScript outside `examples/` is a test or
  the harness that runs one, which is why the package declares no `build`
  target and measures no coverage.

## Test

```bash
nx run coinagerie-examples:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).
