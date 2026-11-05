# @coinagerie/languages

[![npm](https://img.shields.io/npm/v/@coinagerie/languages?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/languages)

Per-language identifier tokenizers and keyword lists that coinagerie uses to turn source files into words.

```bash
npm install @coinagerie/languages
```

## Languages

One tokenizer per language behind `(content, path) => string[]`, chosen by
file extension. Every language also exports its keywords as a plain array,
such as `pythonKeywords`, for a configuration to spread into `exclude.words`.

| Language   | Extensions                               | Reads                                      |
| ---------- | ---------------------------------------- | ------------------------------------------ |
| TypeScript | `.ts .tsx .mts .cts .js .jsx .mjs .cjs`  | Names in the compiler's syntax tree        |
| Python     | `.py .pyi`                               | Names, and quoted dictionary keys          |
| SQL        | `.sql`                                   | Names, and quoted identifiers              |
| Shell      | `.sh .bash .zsh .ksh`                    | Names, and quoted array keys               |
| CSS        | `.css`                                   | Selectors, properties, and at-rule names   |
| HCL        | `.tf .tfvars .hcl`                       | Names, quoted keys, and block labels       |
| TOML       | `.toml`                                  | Keys and table names, quoted or bare       |
| JSON       | `.json .jsonc`                           | Keys only                                  |
| YAML       | `.yaml .yml`                             | Keys only                                  |

## Test

```bash
nx run coinagerie-languages:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-languages:coinagerie-check:write`.

- **breadth**: The maximumBreadth limit in this package's callidescope configuration, capping how many callees one callable may make.
- **effect**: The action a YAML rule takes on a match: skip, block, or key, read by the YAML scanner's rules.
- **grammar**: The LexicalGrammar object a language constant supplies to the shared scanner, holding its rules and key patterns.
- **quotable**: Names the TypeScript declaration kinds, such as enum members, whose quoted name counts as a key.
- **scan**: The ScannerService method that walks a file's text with a LexicalGrammar and returns its raw identifier list.
- **scanner**: The shared lexical engine, ScannerService, that every non-TypeScript language's tokenizer delegates its text reading to.
- **splice**: Array method call in TYPESCRIPT_KEYWORDS that inserts each keyword in sorted position, avoiding toSorted for older libraries.
- **tokenize**: The method each tokenizer exposes to return every identifier in a file's content, repeats kept, as a string array.
- **tokenizer**: The per-language reader registered for a file extension, taking content and path and returning its identifiers.
- **unmatched**: Describes a position where no YAML rule matches, which YAML_UNMATCHED resolves to one skipped character.

<!-- coinagerie:end -->
