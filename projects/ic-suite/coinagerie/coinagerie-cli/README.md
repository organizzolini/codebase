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
- **comparison**: Service that diffs the code's words against each glossary, producing the missing and stale sets that a check reports.
- **deliver**: Private method of the collect command that writes or prints the reconciled glossary for the chosen mode, once words are collected.
- **delivery**: Final stage of a collect run, reached through the deliver method, where words are printed, checked, or written to destinations.
- **destination**: Output target of a glossary, a markdown or JSON file declared in configuration, which a run reads, checks, or rewrites.
- **disagree**: Of a glossary whose words differ from the code's, missing some or listing stale ones, so a check fails on it.
- **discovery**: Step of finding the files a run scans, bounded by the include globs and the gitignore rules the run honors.
- **glossary**: The markdown or JSON file of word-to-definition entries that a run checks against the code and rewrites when asked.
- **leftover**: Word from a scratch-directory fixture file that the end-to-end test asserts stays out of the printed output.
- **lunar**: Sample glossary word in the check-failure fixtures, given an empty definition, which a check still passes though it stays undefined.
- **malformed**: Glossary block whose structure cannot be fully parsed, which a run refuses to write, leaving the file untouched.
- **mark**: The emoji that opens every line a check prints, kept in REPORT_MARK so the batch command reads like the collect command.
- **phase**: Sample glossary word in the check-failure fixtures, given a short definition that the markdown and JSON tests assert on.
- **polyglot**: Repository mixing several languages, whose identifiers coinagerie gathers across every file type it scans into one glossary.
- **reconcile**: Method of the comparison service that merges collected words with existing glossary entries, keeping definitions for words still in use.
- **rejection**: Reason string that rejectionOf returns when a command line is invalid, halting the run before any words are collected.
- **rewrite**: Action of the write mode that rewrites every glossary to hold exactly the code's words, keeping definitions for words still present.
- **scratch**: Folder name of a throwaway fixture the end-to-end test writes into a temporary workspace, holding a file whose words must stay out.
- **stale**: Glossary entry for a word the code no longer uses, which a check names and a write deletes along with its definition.
- **vanish**: Condition of a glossary word no longer in the code, so a check reports it stale and a write removes it.
- **verdict**: The pass-or-fail result and report CheckService returns for one project, printed as one entry of the batch command's JSON.
- **vocabulary**: Workspace package that collects the words a codebase uses, depended on by coinagerie-cli to gather its vocabulary.

<!-- coinagerie:end -->
