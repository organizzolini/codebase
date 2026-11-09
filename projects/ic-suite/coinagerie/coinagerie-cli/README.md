# @coinagerie/cli

[![npm](https://img.shields.io/npm/v/@coinagerie/cli?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/cli)

**Keep a glossary of the words your codebase uses.**

```bash
npm install --save-dev @coinagerie/cli
```

```bash
npx @coinagerie/cli
```

## Usage

`coinagerie` lists the words a codebase uses — every identifier, object key,
enum member, folder name, and file name, split into lowercase words — and keeps
a markdown glossary of them in step with the code.

```bash
coinagerie                       # print the glossary block, write nothing
coinagerie --check               # exit 1 naming missing and stale words
coinagerie --write               # rewrite every glossary, keeping definitions
coinagerie --config path/to/coinagerie.config.ts --check
```

Without `--config`, a `coinagerie.config.ts` in the working directory is used
when there is one, and defaults apply when there is not. The folder the
configuration file sits in is the root the run scans:

```ts
export default {
  exclude: { paths: ["**/*.test.ts"] },
  include: ["src/**"],
  outputs: [
    { description: "Words this project uses.", path: "README.md", type: "markdown" },
  ],
};
```

Every `.gitignore` git would honor is honored, and the files a run writes are
never scanned. A glossary block that cannot be fully parsed is never written.

## Start

```bash
nx run coinagerie-cli:start
```

## Test

```bash
nx run coinagerie-cli:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run coinagerie-cli:coinagerie-check:write`.

- **anchor**: Start and end marker comments bracketing the coinagerie block in a markdown glossary, so a write replaces only that span.
- **angle**: Sample glossary word the end-to-end tests define as the gap between two bodies, used to exercise a failing check.
- **aspect**: Sample glossary word in the collect command's JSON and check-failure fixtures, standing for an identifier that must be defined.
- **batch**: The command that checks or writes the glossaries of many project directories in one process, printing a JSON verdict for each.
- **breadth**: Second limit in callidescope's gate, the count of distinct callees one callable may reach, here capped at five in this package.
- **bullet**: Glossary entry line in the form dash, bold word, colon, which carries the definition beneath it and is what the parser reads.
- **disagree**: Of a glossary whose words differ from the code's, missing some or listing stale ones, so a check fails on it.
- **glossary**: The markdown or JSON file of word-to-definition entries that a run checks against the code and rewrites when asked.
- **lunar**: Sample glossary word in the check-failure fixtures, given an empty definition, which a check still passes though it stays undefined.
- **phase**: Sample glossary word in the check-failure fixtures, given a short definition that the markdown and JSON tests assert on.
- **reconcile**: Method of the comparison service that merges collected words with existing glossary entries, keeping definitions for words still in use.
- **rewrite**: Action of the write mode that rewrites every glossary to hold exactly the code's words, keeping definitions for words still present.
- **vocabulary**: Workspace package that collects the words a codebase uses, depended on by coinagerie-cli to gather its vocabulary.

<!-- coinagerie:end -->
