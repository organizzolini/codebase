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

- **after**:
- **array**:
- **assignment**:
- **bare**:
- **block**:
- **breadth**:
- **bug**:
- **child**:
- **clear**:
- **compile**:
- **compiler**:
- **console**:
- **constant**:
- **controller**:
- **count**:
- **css**:
- **declaration**:
- **decorator**:
- **define**:
- **describe**:
- **each**:
- **effect**:
- **entry**:
- **equal**:
- **exp**:
- **experimental**:
- **extname**:
- **fake**:
- **flat**:
- **gitkeep**:
- **grammar**:
- **greater**:
- **hcl**:
- **hit**:
- **homepage**:
- **identifier**:
- **implementation**:
- **indent**:
- **injectable**:
- **inside**:
- **kind**:
- **last**:
- **least**:
- **length**:
- **lexical**:
- **literal**:
- **lower**:
- **math**:
- **maximum**:
- **member**:
- **meta**:
- **method**:
- **mock**:
- **plain**:
- **quotable**:
- **quote**:
- **real**:
- **recursive**:
- **reg**:
- **reload**:
- **resolution**:
- **scan**:
- **scanner**:
- **second**:
- **slice**:
- **sort**:
- **split**:
- **spy**:
- **strict**:
- **syntax**:
- **synthetic**:
- **text**:
- **than**:
- **timer**:
- **tokenize**:
- **tokenizer**:
- **toml**:
- **trim**:
- **unmatched**:
- **unmock**:
- **vi**:
- **visit**:

<!-- coinagerie:end -->
