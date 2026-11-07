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
- **grammar**: The LexicalGrammar object a language constant supplies to the shared scanner, holding its rules and key patterns.
- **splice**: Array method call in TYPESCRIPT_KEYWORDS that inserts each keyword in sorted position, avoiding toSorted for older libraries.

<!-- coinagerie:end -->
