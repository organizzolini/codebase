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

- **assignment**: A TypeScript syntax kind, PropertyAssignment, whose quoted object key the tokenizer reads as a name.
- **bare**: Describes a name with no quotes around it, read by the scanner's plain identifier pattern rather than a quoted key rule.
- **breadth**: The maximumBreadth limit in this package's callidescope configuration, capping how many callees one callable may make.
- **effect**: The action a YAML rule takes on a match: skip, block, or key, read by the YAML scanner's rules.
- **grammar**: The LexicalGrammar object a language constant supplies to the shared scanner, holding its rules and key patterns.
- **hcl**: The HashiCorp Configuration Language, one of the languages this package reads, through its HclService and HCL_GRAMMAR.
- **hit**: The result of one YAML rule match, carrying its effect, captured keys, and length, or YAML_UNMATCHED.
- **lexical**: Describes the scanner approach that reads names without a parser, using comment, string, and key rules only.
- **quotable**: Names the TypeScript declaration kinds, such as enum members, whose quoted name counts as a key.
- **reload**: The HCL test's dynamic re-import of its service after mocking the scanner, so the module binds the replacement.
- **scan**: The ScannerService method that walks a file's text with a LexicalGrammar and returns its raw identifier list.
- **scanner**: The shared lexical engine, ScannerService, that every non-TypeScript language's tokenizer delegates its text reading to.
- **splice**: Array method call in TYPESCRIPT_KEYWORDS that inserts each keyword in sorted position, avoiding toSorted for older libraries.
- **syntax**: Grammar rules a language's own tokenizer reads: the TypeScript compiler's tree, or the scanner's comment and string rules.
- **tokenize**: The method each tokenizer exposes to return every identifier in a file's content, repeats kept, as a string array.
- **tokenizer**: The per-language reader registered for a file extension, taking content and path and returning its identifiers.
- **toml**: The TOML language package support, read through TomlService and tomlKeywords for keys and table names.
- **unmatched**: Describes a position where no YAML rule matches, which YAML_UNMATCHED resolves to one skipped character.
- **unmock**: The Vitest vi.doUnmock call that restores the real scanner so later tests load it unmocked.

<!-- coinagerie:end -->
