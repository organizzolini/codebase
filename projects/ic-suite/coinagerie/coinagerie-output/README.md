# @coinagerie/output

[![npm](https://img.shields.io/npm/v/@coinagerie/output?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/output)

Renders and parses the markdown and JSON glossaries coinagerie writes, and compares them with the vocabulary of the codebase to name the words that are missing or stale.

```bash
npm install @coinagerie/output
```

## Test

```bash
nx run coinagerie-output:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-output:coinagerie-check:write`.

- **anchor**: The HTML comment markers coinagerie:start and coinagerie:end that bracket the managed block in a markdown file.
- **boundary**: Edge where glossary text enters the package, where it is parsed and validated before any comparison or write happens.
- **breadth**: The maximumBreadth limit, set to four in this project's callidescope configuration, bounding callees per function.
- **bullet**: One word's entry in a glossary block, written as a dash, bolded word, and colon, read by the markdown parser.
- **glossary**: The map from each word to its definition, which the parsers fill and comparison checks against the codebase.
- **hand**: Manually written or manually scanned: tests use hand-written blocks, and tokenizing scans JSON by hand rather than regex.
- **preamble**: Free text opening a generated block, made of the start anchor, heading, and description before the bullets.
- **reconcile**: Rewrites a glossary to exactly the codebase vocabulary, sorted, keeping existing definitions and dropping stale words.
- **splice**: Inserts or replaces the anchored block inside a file's content, preserving that file's own CRLF or LF line endings.
- **vocabulary**: The set of words the codebase uses, which comparison checks each glossary against to find missing or stale words.

<!-- coinagerie:end -->
