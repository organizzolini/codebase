<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-languages`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 210 |
| Files | 69 |
| Calls traced | 207 |
| Call stacks | 17 |
| Deepest stack | 5 |
| Stacks through recursion | 0 |
| Unfollowable calls | 5 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 11 |
| `maximumBreadth` | 12 |

### Call stacks (depth)

**1. `LanguageCommentsService.read`** — depth ≥ 5 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:124]
  └─> HclCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:122]
     ↳ Reads every `#`, `//`, and `/* *\/` comment, in the order they appear.
    └─> HclCommentsService.readBlocks(content: string): { end: number; start: number; token: CommentToken; }[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:75]
       ↳ Every block comment's span, as a positioned token.
      └─> HclCommentsService.map(…)(…): { end: number; start: number; token: { line: number; ownLine: boolean; prose: string; source: string; }; } [projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:78]
        └─> HclCommentsService.lineOf(content: string, index: number): number [projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:70]
           ↳ The 1-indexed line an offset sits on.
```

**2. `LanguageCommentsService.read`** — depth ≥ 5 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:132]
  └─> SqlCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:118]
     ↳ Reads every `--` and `/* *\/` comment, in the order they appear.
    └─> SqlCommentsService.readBlocks(content: string): { end: number; start: number; token: CommentToken; }[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:70]
       ↳ Every block comment's span, as a positioned token.
      └─> SqlCommentsService.map(…)(…): { end: number; start: number; token: { line: number; ownLine: boolean; prose: string; source: string; }; } [projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:73]
        └─> SqlCommentsService.lineOf(content: string, index: number): number [projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:65]
           ↳ The 1-indexed line an offset sits on.
```

**3. `LanguageCommentsService.read`** — depth 5 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string, filePath: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:137]
  └─> TypescriptCommentsService.read(content: string, filePath: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:140]
     ↳ Reads every non-JSDoc comment the parse finds, in source order.
    └─> TypescriptCommentsService.flatMap(…)(this: undefined, range: tsCompiler.CommentRange): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:154]
      └─> TypescriptCommentsService.toToken(range: tsCompiler.CommentRange, content: string): CommentToken | undefined [projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:119]
         ↳ Turns one comment range into a token, unless it is a JSDoc block.
        └─> TypescriptCommentsService.isJsDoc(range: tsCompiler.CommentRange, source: string): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:90]
           ↳ Whether this range is a JSDoc block, measured elsewhere.
```

<details>
<summary>14 more call stacks</summary>

**4. `LanguageCommentsService.read`** — depth 4 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:120]
  └─> CssCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/css-comments.service.ts:70]
     ↳ Reads every comment postcss's parse finds, in document order.
    └─> CssCommentsService.walkComments(…)(comment: postcss.Comment): void [projects/ic-suite/codometer/codometer-languages/src/modules/comments/css-comments.service.ts:74]
      └─> CssCommentsService.toBody(comment: Comment): string [projects/ic-suite/codometer/codometer-languages/src/modules/comments/css-comments.service.ts:36]
         ↳ A comment's text with the whitespace postcss split off restored. `raws.left`/`raws.right` are typed optional, but…
```

**5. `LanguageCommentsService.read`** — depth 4 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:142]
  └─> YamlCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/yaml-comments.service.ts:103]
     ↳ Reads every comment the tokenizer found, in the order they appear.
    └─> YamlCommentsService.collectComments(candidate: unknown, scan: YamlCommentScan): void [projects/ic-suite/codometer/codometer-languages/src/modules/comments/yaml-comments.service.ts:43]
       ↳ Walks one parsed token, recording every comment beneath it.
      └─> YamlCommentsService.isCommentToken(…): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/comments/yaml-comments.service.ts:70]
         ↳ Whether a parsed token is a comment carrying an offset.
```

**6. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:66]
  └─> TypescriptService.handleFunction(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:298]
     ↳ Increments function, method, async, sync, exported, and generic counts for a function node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**7. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:71]
  └─> TypescriptService.handleEnum(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:292]
     ↳ Increments enum and exported counts for an enum declaration node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**8. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:73]
  └─> TypescriptService.handleFunction(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:298]
     ↳ Increments function, method, async, sync, exported, and generic counts for a function node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**9. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:75]
  └─> TypescriptService.handleFunction(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:298]
     ↳ Increments function, method, async, sync, exported, and generic counts for a function node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**10. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:77]
  └─> TypescriptService.handleMethodOrAccessor(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:342]
     ↳ Increments method and async or sync counts for a method or accessor node.
    └─> TypescriptService.hasAsyncKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:376]
       ↳ Returns true when the node has an async modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.AsyncKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:382]
```

**11. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:81]
  └─> TypescriptService.handleInterface(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:332]
     ↳ Increments interface, exported, and generic counts for an interface declaration node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**12. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:83]
  └─> TypescriptService.handleMethodOrAccessor(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:342]
     ↳ Increments method and async or sync counts for a method or accessor node.
    └─> TypescriptService.hasAsyncKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:376]
       ↳ Returns true when the node has an async modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.AsyncKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:382]
```

**13. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:85]
  └─> TypescriptService.handleMethodOrAccessor(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:342]
     ↳ Increments method and async or sync counts for a method or accessor node.
    └─> TypescriptService.hasAsyncKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:376]
       ↳ Returns true when the node has an async modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.AsyncKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:382]
```

**14. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:87]
  └─> TypescriptService.handleTypeAlias(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:355]
     ↳ Increments exported and generic counts for a type alias declaration node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**15. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:89]
  └─> TypescriptService.handleVariable(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:364]
     ↳ Increments constant and exported counts for a const variable statement.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:394]
```

**16. `LanguageCommentsService.readHash`** — depth 3 · orphan-root

```text
🚀 LanguageCommentsService.readHash(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:109]
  └─> HashCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/hash-comments.service.ts:49]
     ↳ Reads every `#` comment in a file, with its line and its placement.
    └─> HashCommentsService.isShebang(index: number, marker: number, line: string): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/comments/hash-comments.service.ts:42]
       ↳ Whether this is the interpreter line rather than a comment. `#!` on the first line is an instruction to the kernel, not…
```

**17. `TypescriptService.anonymous`** — depth 2 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:79]
  └─> TypescriptService.handleImport(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:318]
     ↳ Increments import count and tracks the external package name if applicable.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `LanguagesService.analyze` | 12 | `PythonService.analyze`, `LanguageCommentsService.measure`, `CssService.analyze`, `HclService.analyze`, `JsonService.analyze`, `JupyterService.analyze`, `MarkdownService.analyze`, `ShellService.analyze`, `SqlService.analyze`, `TomlService.analyze`, `TypescriptService.analyze`, `YamlService.analyze` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/languages.service.ts:56` |
| `HclCommentsService.read` | 8 | `HclCommentsService.readBlocks`, `HclCommentsService.filter(…)`, `HclCommentsService.readMatches(…)`, `HclCommentsService.readMatches`, `HclCommentsService.filter(…)`, `HclCommentsService.readMatches(…)`, `HclCommentsService.map(…)`, `HclCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:122` |
| `SqlCommentsService.read` | 6 | `SqlCommentsService.readBlocks`, `SqlCommentsService.filter(…)`, `SqlCommentsService.readMatches(…)`, `SqlCommentsService.readMatches`, `SqlCommentsService.map(…)`, `SqlCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:118` |

<details>
<summary>103 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TypescriptService.walkNode` | 6 | `TypescriptService.countSymbols`, `TypescriptService.collectDeclarationComments`, `TypescriptService.handleClass`, `TypescriptService.forEachChild(…)`, `TypescriptService.dispatchNode`, `TypescriptService.forEachChild(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:459` |
| `JsonService.countNode` | 5 | `JsonService.isArrayNode`, `JsonService.countArrayNode`, `JsonService.isRecordNode`, `JsonService.countRecordNode`, `JsonService.countPrimitiveNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:111` |
| `JupyterService.analyze` | 5 | `JupyterService.collectParts`, `JsonService.analyze`, `PythonService.analyzeContents`, `MarkdownService.analyzeContents`, `JupyterService.countHeadings` | `projects/ic-suite/codometer/codometer-languages/src/modules/jupyter/jupyter.service.ts:166` |
| `TypescriptService.createEmptyResult` | 5 | `TypescriptService.seedDeclarationCommentCounts`, `TypescriptService.filter(…)`, `TypescriptService.map(…)`, `TypescriptService.filter(…)`, `TypescriptService.filter(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:203` |
| `CommentsService.flatMap(…)` | 4 | `CommentsService.readProse`, `CommentsService.measureText`, `CommentsService.toExcerpt`, `CommentsService.readSource` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:165` |
| `TypescriptCommentsService.toToken` | 4 | `TypescriptCommentsService.isJsDoc`, `TypescriptCommentsService.lineOf`, `TypescriptCommentsService.isOwnLine`, `TypescriptCommentsService.toProse` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:119` |
| `TypescriptCommentsService.read` | 4 | `TypescriptCommentsService.getScriptKind`, `TypescriptCommentsService.collectComments`, `TypescriptCommentsService.flatMap(…)`, `TypescriptCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:140` |
| `JsonService.consumeJsoncCharacter` | 4 | `JsonService.handleLineCommentState`, `JsonService.handleBlockCommentState`, `JsonService.handleStringState`, `JsonService.consumeCharacterOutsideComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:66` |
| `DeclarationCommentsService.prepare` | 4 | `DeclarationCommentsService.filter(…)`, `DeclarationCommentsService.getJsDocRange`, `DeclarationCommentsService.getDeclarationName`, `DeclarationCommentsService.readProse` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/declaration-comments.service.ts:71` |
| `YamlCommentsService.read` | 3 | `YamlCommentsService.collectComments`, `YamlCommentsService.map(…)`, `YamlCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/yaml-comments.service.ts:103` |
| `JsonService.parseDocuments` | 3 | `JsonService.map(…)`, `JsonService.filter(…)`, `JsonService.stripJsoncComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:258` |
| `JsonService.analyze` | 3 | `JsonService.filter(…)`, `JsonService.parseDocuments`, `JsonService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:308` |
| `SqlService.analyze` | 3 | `SqlService.stripComments`, `SqlService.filter(…)`, `SqlService.countKeywords` | `projects/ic-suite/codometer/codometer-languages/src/modules/sql/sql.service.ts:63` |
| `TypescriptService.analyzeFile` | 3 | `TypescriptService.getScriptKind`, `TypescriptService.scanComments`, `TypescriptService.walkNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:98` |
| `TypescriptService.handleFunction` | 3 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasAsyncKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:298` |
| `TypescriptService.analyze` | 3 | `TypescriptService.createEmptyResult`, `TypescriptService.analyzeFile`, `TypescriptService.getCountersForFile` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:485` |
| `CommentsService.measure` | 2 | `CommentsService.flatMap(…)`, `CommentsService.groupIntoBlocks` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:164` |
| `CommentsService.measureText` | 2 | `CommentsService.map(…)`, `CommentsService.declaredLimits` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:187` |
| `CssCommentsService.walkComments(…)` | 2 | `CssCommentsService.toBody`, `CssCommentsService.toOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/css-comments.service.ts:74` |
| `HclCommentsService.readBlocks` | 2 | `HclCommentsService.map(…)`, `HclCommentsService.findBlockComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:75` |
| `HclCommentsService.map(…)` | 2 | `HclCommentsService.lineOf`, `HclCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:78` |
| `HclCommentsService.map(…)` | 2 | `HclCommentsService.lineOf`, `HclCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:96` |
| `SqlCommentsService.readBlocks` | 2 | `SqlCommentsService.map(…)`, `SqlCommentsService.findBlockComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:70` |
| `SqlCommentsService.map(…)` | 2 | `SqlCommentsService.lineOf`, `SqlCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:73` |
| `SqlCommentsService.map(…)` | 2 | `SqlCommentsService.lineOf`, `SqlCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:91` |
| `YamlCommentsService.collectComments` | 2 | `YamlCommentsService.isCommentToken`, `YamlCommentsService.toToken` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/yaml-comments.service.ts:43` |
| `LanguageCommentsService.measureLanguage` | 2 | `LanguageCommentsService.readFile`, `CommentsService.measure` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:68` |
| `LanguageCommentsService.measureOneLanguage` | 2 | `LanguageCommentsService.measurePython`, `LanguageCommentsService.measureLanguage` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:96` |
| `MarkdownService.countNode` | 2 | `MarkdownService.countHeading`, `MarkdownService.countListItem` | `projects/ic-suite/codometer/codometer-languages/src/modules/markdown/markdown.service.ts:62` |
| `PythonService.analyzeContents` | 2 | `PythonService.map(…)`, `PythonService.analyze` | `projects/ic-suite/codometer/codometer-languages/src/modules/python/python.service.ts:87` |
| `JupyterService.collectParts` | 2 | `JupyterService.readNotebook`, `JupyterService.collectCell` | `projects/ic-suite/codometer/codometer-languages/src/modules/jupyter/jupyter.service.ts:88` |
| `SqlService.stripComments` | 2 | `SqlService.replaceAll(…)`, `SqlService.replaceAll(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/sql/sql.service.ts:48` |
| `TomlService.analyze` | 2 | `TomlService.countLine`, `TomlService.isInsideMultilineString` | `projects/ic-suite/codometer/codometer-languages/src/modules/toml/toml.service.ts:98` |
| `DeclarationCommentsService.measure` | 2 | `DeclarationCommentsService.prepare`, `CommentsService.measureText` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/declaration-comments.service.ts:139` |
| `TypescriptService.countSymbols` | 2 | `TypescriptService.getSymbolModifiers`, `TypescriptService.every(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:173` |
| `TypescriptService.handleClass` | 2 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:285` |
| `TypescriptService.handleInterface` | 2 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:332` |
| `TypescriptService.handleTypeAlias` | 2 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:355` |
| `YamlService.countDocument` | 2 | `YamlService.countComments`, `YamlService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/yaml/yaml.service.ts:88` |
| `YamlService.countNode` | 2 | `YamlService.countComments`, `YamlService.countCollection` | `projects/ic-suite/codometer/codometer-languages/src/modules/yaml/yaml.service.ts:95` |
| `CommentsService.declaredLimits` | 1 | `CommentsService.countWords` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:64` |
| `CommentsService.readProse` | 1 | `CommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:102` |
| `CommentsService.readSource` | 1 | `CommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:110` |
| `CssCommentsService.read` | 1 | `CssCommentsService.walkComments(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/css-comments.service.ts:70` |
| `HashCommentsService.read` | 1 | `HashCommentsService.isShebang` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hash-comments.service.ts:49` |
| `HclCommentsService.readMatches` | 1 | `HclCommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:91` |
| `HclCommentsService.overlapsBlock` | 1 | `HclCommentsService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:124` |
| `HclCommentsService.filter(…)` | 1 | `HclCommentsService.overlapsBlock` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:131` |
| `HclCommentsService.filter(…)` | 1 | `HclCommentsService.overlapsBlock` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/hcl-comments.service.ts:136` |
| `SqlCommentsService.readMatches` | 1 | `SqlCommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:86` |
| `SqlCommentsService.filter(…)` | 1 | `SqlCommentsService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/sql-comments.service.ts:125` |
| `TypescriptCommentsService.flatMap(…)` | 1 | `TypescriptCommentsService.toToken` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/typescript-comments.service.ts:154` |
| `LanguageCommentsService.readHash` | 1 | `HashCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:109` |
| `LanguageCommentsService.read` | 1 | `CssCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:120` |
| `LanguageCommentsService.read` | 1 | `HclCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:124` |
| `LanguageCommentsService.read` | 1 | `SqlCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:132` |
| `LanguageCommentsService.read` | 1 | `TypescriptCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:137` |
| `LanguageCommentsService.read` | 1 | `YamlCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:142` |
| `LanguageCommentsService.measurePython` | 1 | `LanguageCommentsService.flatMap(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:162` |
| `LanguageCommentsService.flatMap(…)` | 1 | `CommentsService.measure` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:175` |
| `LanguageCommentsService.measure` | 1 | `LanguageCommentsService.flatMap(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:212` |
| `LanguageCommentsService.flatMap(…)` | 1 | `LanguageCommentsService.measureOneLanguage` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:234` |
| `CssService.analyze` | 1 | `CssService.walk(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/css/css.service.ts:74` |
| `CssService.walk(…)` | 1 | `CssService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/css/css.service.ts:88` |
| `HclService.countLine` | 1 | `HclService.countBlock` | `projects/ic-suite/codometer/codometer-languages/src/modules/hcl/hcl.service.ts:60` |
| `HclService.analyze` | 1 | `HclService.countLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/hcl/hcl.service.ts:87` |
| `JsonService.countArrayNode` | 1 | `JsonService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:95` |
| `JsonService.countPrimitiveNode` | 1 | `JsonService.countPrimitiveValue` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:126` |
| `JsonService.countRecordNode` | 1 | `JsonService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:162` |
| `JsonService.stripJsoncComments` | 1 | `JsonService.consumeJsoncCharacter` | `projects/ic-suite/codometer/codometer-languages/src/modules/json/json.service.ts:273` |
| `MarkdownService.walk` | 1 | `MarkdownService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/markdown/markdown.service.ts:81` |
| `MarkdownService.analyze` | 1 | `MarkdownService.analyzeContents` | `projects/ic-suite/codometer/codometer-languages/src/modules/markdown/markdown.service.ts:98` |
| `MarkdownService.analyzeContents` | 1 | `MarkdownService.walk` | `projects/ic-suite/codometer/codometer-languages/src/modules/markdown/markdown.service.ts:126` |
| `JupyterService.collectCell` | 1 | `JupyterService.readSource` | `projects/ic-suite/codometer/codometer-languages/src/modules/jupyter/jupyter.service.ts:57` |
| `ShellService.countLine` | 1 | `ShellService.countStatements` | `projects/ic-suite/codometer/codometer-languages/src/modules/shell/shell.service.ts:45` |
| `ShellService.analyze` | 1 | `ShellService.countLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/shell/shell.service.ts:93` |
| `TomlService.countLine` | 1 | `TomlService.countKey` | `projects/ic-suite/codometer/codometer-languages/src/modules/toml/toml.service.ts:61` |
| `DeclarationCommentsService.getJsDocRange` | 1 | `DeclarationCommentsService.findLast(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/declaration-comments.service.ts:46` |
| `DeclarationCommentsService.readProse` | 1 | `DeclarationCommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/declaration-comments.service.ts:117` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleFunction` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:66` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleEnum` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:71` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleFunction` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:73` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleFunction` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:75` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleMethodOrAccessor` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:77` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleImport` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:79` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleInterface` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:81` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleMethodOrAccessor` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:83` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleMethodOrAccessor` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:85` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleTypeAlias` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:87` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleVariable` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:89` |
| `TypescriptService.collectDeclarationComments` | 1 | `DeclarationCommentsService.measure` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:127` |
| `TypescriptService.getCountersForFile` | 1 | `TypescriptService.filter(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:240` |
| `TypescriptService.filter(…)` | 1 | `TypescriptService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:245` |
| `TypescriptService.handleEnum` | 1 | `TypescriptService.hasExportKeyword` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:292` |
| `TypescriptService.handleMethodOrAccessor` | 1 | `TypescriptService.hasAsyncKeyword` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:342` |
| `TypescriptService.handleVariable` | 1 | `TypescriptService.hasExportKeyword` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:364` |
| `TypescriptService.hasAsyncKeyword` | 1 | `TypescriptService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:376` |
| `TypescriptService.hasExportKeyword` | 1 | `TypescriptService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:388` |
| `TypescriptService.scanComments` | 1 | `TypescriptService.countComment` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:412` |
| `TypescriptService.forEachChild(…)` | 1 | `TypescriptService.walkNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:472` |
| `TypescriptService.forEachChild(…)` | 1 | `TypescriptService.walkNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/typescript/typescript.service.ts:479` |
| `YamlService.countCollection` | 1 | `YamlService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/yaml/yaml.service.ts:46` |
| `YamlService.analyze` | 1 | `YamlService.countDocument` | `projects/ic-suite/codometer/codometer-languages/src/modules/yaml/yaml.service.ts:123` |

</details>
<!-- callidescope:end -->
