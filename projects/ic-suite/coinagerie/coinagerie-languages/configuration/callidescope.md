<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-languages`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 38 |
| Files | 52 |
| Calls traced | 22 |
| Call stacks | 11 |
| Deepest stack | 4 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `CssService.tokenize`** — depth 4 · orphan-root

```text
🚀 CssService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/css/css.service.ts:34]
   ↳ Every identifier in a CSS stylesheet, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

**2. `HclService.tokenize`** — depth 4 · orphan-root

```text
🚀 HclService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/hcl/hcl.service.ts:34]
   ↳ Every identifier in an HCL file, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

**3. `JsonService.tokenize`** — depth 4 · orphan-root

```text
🚀 JsonService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/json/json.service.ts:34]
   ↳ Every key in a JSON document, in the order written, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

<details>
<summary>8 more call stacks</summary>

**4. `PythonService.tokenize`** — depth 4 · orphan-root

```text
🚀 PythonService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/python/python.service.ts:33]
   ↳ Every identifier in a Python file, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

**5. `ShellService.tokenize`** — depth 4 · orphan-root

```text
🚀 ShellService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/shell/shell.service.ts:33]
   ↳ Every identifier in a shell script, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

**6. `SqlService.tokenize`** — depth 4 · orphan-root

```text
🚀 SqlService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/sql/sql.service.ts:33]
   ↳ Every identifier in a SQL script, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

**7. `TomlService.tokenize`** — depth 4 · orphan-root

```text
🚀 TomlService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/toml/toml.service.ts:33]
   ↳ Every identifier in a TOML document, repeats kept.
  └─> ScannerService.scan(content: string, grammar: LexicalGrammar): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111]
     ↳ Every identifier in a file written in the grammar's language, in the order written, repeats kept.
    └─> ScannerService.readToken(…): LexicalToken | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73]
       ↳ The token at `index`, or `undefined` when only punctuation is there.
      └─> ScannerService.matchAt(pattern: RegExp, content: string, index: number): null | RegExpExecArray [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:62]
         ↳ Whether the text at `index` matches a sticky pattern.
```

**8. `TypescriptService.tokenize`** — depth 4 · orphan-root

```text
🚀 TypescriptService.tokenize(content: string, filePath: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:70]
   ↳ Every identifier in a source file, in the order written, repeats kept.
  └─> TypescriptService.visit(node: ts.Node): void [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:80]
    └─> TypescriptService.readIdentifier(node: ts.Node): string | undefined [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:50]
       ↳ The identifier a node spells, or `undefined` when it spells none.
      └─> TypescriptService.isQuotedName(node: ts.Node): node is ts.StringLiteral [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:38]
         ↳ Whether a node is a string literal naming a key, such as `"quoted-key"`.
```

**9. `YamlService.tokenize`** — depth 3 · orphan-root

```text
🚀 YamlService.tokenize(content: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.ts:94]
   ↳ Every key in a YAML document, in the order written, repeats kept.
  └─> YamlService.isInsideBlock(line: string, owner: number): boolean [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.ts:38]
     ↳ Whether a line is text inside the block scalar owned at `owner`.
    └─> YamlService.indentOf(line: string): number [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.ts:33]
       ↳ How many columns a line is indented.
```

**10. `reduce(…)`** — depth 2 · orphan-root

```text
🚀 reduce(…)(sorted: string[], keyword: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.constants.ts:56]
  └─> findIndex(…)(existing: string): boolean [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.constants.ts:59]
```

**11. `LanguagesService.constructor`** — depth ≥ 2 · orphan-root

```text
🚀 LanguagesService.constructor(…): LanguagesService [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/languages/languages.service.ts:28]
  └─> LanguagesService.set(…)(content: string, filePath: string): string[] [projects/ic-suite/coinagerie/coinagerie-languages/src/modules/languages/languages.service.ts:53]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `YamlService.tokenize` | 3 | `YamlService.isInsideBlock`, `YamlService.readLine`, `YamlService.filter(…)` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.ts:94` |
| `ScannerService.readToken` | 2 | `ScannerService.matchAt`, `ScannerService.isKey` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:73` |
| `YamlService.readLine` | 2 | `YamlService.indentOf`, `YamlService.matchRule` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.ts:69` |

<details>
<summary>14 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ScannerService.scan` | 1 | `ScannerService.readToken` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/scanner/scanner.service.ts:111` |
| `CssService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/css/css.service.ts:34` |
| `HclService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/hcl/hcl.service.ts:34` |
| `JsonService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/json/json.service.ts:34` |
| `PythonService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/python/python.service.ts:33` |
| `ShellService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/shell/shell.service.ts:33` |
| `SqlService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/sql/sql.service.ts:33` |
| `TomlService.tokenize` | 1 | `ScannerService.scan` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/toml/toml.service.ts:33` |
| `reduce(…)` | 1 | `findIndex(…)` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.constants.ts:56` |
| `TypescriptService.readIdentifier` | 1 | `TypescriptService.isQuotedName` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:50` |
| `TypescriptService.tokenize` | 1 | `TypescriptService.visit` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:70` |
| `TypescriptService.visit` | 1 | `TypescriptService.readIdentifier` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/typescript/typescript.service.ts:80` |
| `YamlService.isInsideBlock` | 1 | `YamlService.indentOf` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/yaml/yaml.service.ts:38` |
| `LanguagesService.constructor` | 1 | `LanguagesService.set(…)` | `projects/ic-suite/coinagerie/coinagerie-languages/src/modules/languages/languages.service.ts:28` |

</details>
<!-- callidescope:end -->
