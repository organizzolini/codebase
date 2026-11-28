<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-languages`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 207 |
| Files | 69 |
| Calls traced | 204 |
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
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:112]
  └─> HclCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:108]
     ↳ Reads every `#`, `//`, and block comment in order.
    └─> HclCommentsService.readBlocks(content: string): { end: number; start: number; token: CommentToken; }[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:65]
       ↳ Every block comment's span, as a positioned token.
      └─> HclCommentsService.map(…)(…): { end: number; start: number; token: { line: number; ownLine: boolean; prose: string; source: string; }; } [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:68]
        └─> HclCommentsService.lineOf(content: string, index: number): number [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:60]
           ↳ The 1-indexed line an offset sits on.
```

**2. `LanguageCommentsService.read`** — depth ≥ 5 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:120]
  └─> SqlCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:105]
     ↳ Reads every `--` and block comment in order.
    └─> SqlCommentsService.readBlocks(content: string): { end: number; start: number; token: CommentToken; }[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:62]
       ↳ Every block comment's span, as a positioned token.
      └─> SqlCommentsService.map(…)(…): { end: number; start: number; token: { line: number; ownLine: boolean; prose: string; source: string; }; } [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:65]
        └─> SqlCommentsService.lineOf(content: string, index: number): number [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:57]
           ↳ The 1-indexed line an offset sits on.
```

**3. `LanguageCommentsService.read`** — depth 5 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string, filePath: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:125]
  └─> TypescriptCommentsService.read(content: string, filePath: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:122]
     ↳ Reads every non-JSDoc comment the parse finds, in source order.
    └─> TypescriptCommentsService.flatMap(…)(this: undefined, range: tsCompiler.CommentRange): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:136]
      └─> TypescriptCommentsService.toToken(range: tsCompiler.CommentRange, content: string): CommentToken | undefined [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:101]
         ↳ Turns one comment range into a token, unless it is a JSDoc block.
        └─> TypescriptCommentsService.isJsDoc(range: tsCompiler.CommentRange, source: string): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:72]
           ↳ Whether this range is a JSDoc block, measured elsewhere.
```

<details>
<summary>14 more call stacks</summary>

**4. `LanguageCommentsService.read`** — depth 4 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:108]
  └─> CssCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/css/css-comments.service.ts:55]
     ↳ Reads every comment postcss finds, in document order. A stylesheet postcss cannot parse yields none.
    └─> CssCommentsService.walkComments(…)(comment: postcss.Comment): void [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/css/css-comments.service.ts:59]
      └─> CssCommentsService.toBody(comment: Comment): string [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/css/css-comments.service.ts:29]
         ↳ Restores the whitespace postcss split off a comment's text. Both `raws` fields are always set after a real parse.
```

**5. `LanguageCommentsService.read`** — depth 4 · orphan-root

```text
🚀 LanguageCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:130]
  └─> YamlCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/yaml/yaml-comments.service.ts:92]
     ↳ Reads every comment the tokenizer found, in the order they appear.
    └─> YamlCommentsService.collectComments(candidate: unknown, scan: YamlCommentScan): void [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/yaml/yaml-comments.service.ts:32]
       ↳ Walks one parsed token, recording every comment beneath it.
      └─> YamlCommentsService.isCommentToken(…): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/yaml/yaml-comments.service.ts:59]
         ↳ Whether a parsed token is a comment carrying an offset.
```

**6. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:53]
  └─> TypescriptService.handleFunction(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:278]
     ↳ Increments function, method, async, sync, exported, and generic counts for a function node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**7. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:58]
  └─> TypescriptService.handleEnum(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:272]
     ↳ Increments enum and exported counts for an enum declaration node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**8. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:60]
  └─> TypescriptService.handleFunction(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:278]
     ↳ Increments function, method, async, sync, exported, and generic counts for a function node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**9. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:62]
  └─> TypescriptService.handleFunction(node: tsCompiler.Node, stats: TypescriptResult, insideClass: boolean): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:278]
     ↳ Increments function, method, async, sync, exported, and generic counts for a function node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**10. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:64]
  └─> TypescriptService.handleMethodOrAccessor(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:322]
     ↳ Increments method and async or sync counts for a method or accessor node.
    └─> TypescriptService.hasAsyncKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:356]
       ↳ Returns true when the node has an async modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.AsyncKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:362]
```

**11. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:68]
  └─> TypescriptService.handleInterface(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:312]
     ↳ Increments interface, exported, and generic counts for an interface declaration node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**12. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:70]
  └─> TypescriptService.handleMethodOrAccessor(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:322]
     ↳ Increments method and async or sync counts for a method or accessor node.
    └─> TypescriptService.hasAsyncKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:356]
       ↳ Returns true when the node has an async modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.AsyncKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:362]
```

**13. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:72]
  └─> TypescriptService.handleMethodOrAccessor(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:322]
     ↳ Increments method and async or sync counts for a method or accessor node.
    └─> TypescriptService.hasAsyncKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:356]
       ↳ Returns true when the node has an async modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.AsyncKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:362]
```

**14. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:74]
  └─> TypescriptService.handleTypeAlias(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:335]
     ↳ Increments exported and generic counts for a type alias declaration node.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**15. `TypescriptService.anonymous`** — depth 4 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:76]
  └─> TypescriptService.handleVariable(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:344]
     ↳ Increments constant and exported counts for a const variable statement.
    └─> TypescriptService.hasExportKeyword(node: tsCompiler.Node): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368]
       ↳ Returns true when the node has an export modifier keyword.
      └─> TypescriptService.some(…)(modifier: tsCompiler.Modifier): modifier is tsCompiler.ExportKeyword [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:374]
```

**16. `LanguageCommentsService.readHash`** — depth 3 · orphan-root

```text
🚀 LanguageCommentsService.readHash(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:97]
  └─> HashCommentsService.read(content: string): CommentToken[] [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hash/hash-comments.service.ts:34]
     ↳ Reads every `#` comment in a file, with its line and its placement.
    └─> HashCommentsService.isShebang(index: number, marker: number, line: string): boolean [projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hash/hash-comments.service.ts:27]
       ↳ Whether this is the interpreter line. `#!` on the first line is a kernel instruction, not prose, so it is never a…
```

**17. `TypescriptService.anonymous`** — depth 2 · orphan-root

```text
🚀 TypescriptService.anonymous(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:66]
  └─> TypescriptService.handleImport(node: tsCompiler.Node, stats: TypescriptResult): void [projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:298]
     ↳ Increments import count and tracks the external package name if applicable.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `LanguagesService.analyze` | 12 | `PythonService.analyze`, `LanguageCommentsService.measure`, `CssService.analyze`, `HclService.analyze`, `JsonService.analyze`, `JupyterService.analyze`, `MarkdownService.analyze`, `ShellService.analyze`, `SqlService.analyze`, `TomlService.analyze`, `TypescriptService.analyze`, `YamlService.analyze` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/languages.service.ts:57` |
| `HclCommentsService.read` | 8 | `HclCommentsService.readBlocks`, `HclCommentsService.filter(…)`, `HclCommentsService.readMatches(…)`, `HclCommentsService.readMatches`, `HclCommentsService.filter(…)`, `HclCommentsService.readMatches(…)`, `HclCommentsService.map(…)`, `HclCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:108` |
| `SqlCommentsService.read` | 6 | `SqlCommentsService.readBlocks`, `SqlCommentsService.filter(…)`, `SqlCommentsService.readMatches(…)`, `SqlCommentsService.readMatches`, `SqlCommentsService.map(…)`, `SqlCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:105` |

<details>
<summary>100 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TypescriptService.walkNode` | 6 | `TypescriptService.countSymbols`, `TypescriptService.collectDeclarationComments`, `TypescriptService.handleClass`, `TypescriptService.forEachChild(…)`, `TypescriptService.dispatchNode`, `TypescriptService.forEachChild(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:432` |
| `JsonService.countNode` | 5 | `JsonService.isArrayNode`, `JsonService.countArrayNode`, `JsonService.isRecordNode`, `JsonService.countRecordNode`, `JsonService.countPrimitiveNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:111` |
| `JupyterService.analyze` | 5 | `JupyterService.collectParts`, `JsonService.analyze`, `PythonService.analyzeContents`, `MarkdownService.analyzeContents`, `JupyterService.countHeadings` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/jupyter/jupyter.service.ts:160` |
| `TypescriptService.createEmptyResult` | 5 | `TypescriptService.seedDeclarationCommentCounts`, `TypescriptService.filter(…)`, `TypescriptService.map(…)`, `TypescriptService.filter(…)`, `TypescriptService.filter(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:183` |
| `CommentsService.flatMap(…)` | 4 | `CommentsService.readProse`, `CommentsService.measureText`, `CommentsService.toExcerpt`, `CommentsService.readSource` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:129` |
| `TypescriptCommentsService.toToken` | 4 | `TypescriptCommentsService.isJsDoc`, `TypescriptCommentsService.lineOf`, `TypescriptCommentsService.isOwnLine`, `TypescriptCommentsService.toProse` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:101` |
| `TypescriptCommentsService.read` | 4 | `TypescriptCommentsService.getScriptKind`, `TypescriptCommentsService.collectComments`, `TypescriptCommentsService.flatMap(…)`, `TypescriptCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:122` |
| `JsonService.consumeJsoncCharacter` | 4 | `JsonService.handleLineCommentState`, `JsonService.handleBlockCommentState`, `JsonService.handleStringState`, `JsonService.consumeCharacterOutsideComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:66` |
| `DeclarationCommentsService.prepare` | 4 | `DeclarationCommentsService.filter(…)`, `DeclarationCommentsService.getJsDocRange`, `DeclarationCommentsService.getDeclarationName`, `DeclarationCommentsService.readProse` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/declaration-comments.service.ts:78` |
| `YamlCommentsService.read` | 3 | `YamlCommentsService.collectComments`, `YamlCommentsService.map(…)`, `YamlCommentsService.toSorted(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/yaml/yaml-comments.service.ts:92` |
| `JsonService.parseDocuments` | 3 | `JsonService.map(…)`, `JsonService.filter(…)`, `JsonService.stripJsoncComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:258` |
| `JsonService.analyze` | 3 | `JsonService.filter(…)`, `JsonService.parseDocuments`, `JsonService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:308` |
| `SqlService.analyze` | 3 | `SqlService.stripComments`, `SqlService.filter(…)`, `SqlService.countKeywords` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/sql/sql.service.ts:63` |
| `TypescriptService.analyzeFile` | 3 | `TypescriptService.getScriptKind`, `TypescriptService.scanComments`, `TypescriptService.walkNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:85` |
| `TypescriptService.handleFunction` | 3 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasAsyncKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:278` |
| `TypescriptService.analyze` | 3 | `TypescriptService.createEmptyResult`, `TypescriptService.analyzeFile`, `TypescriptService.getCountersForFile` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:458` |
| `CommentsService.measure` | 2 | `CommentsService.flatMap(…)`, `CommentsService.groupIntoBlocks` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:128` |
| `CommentsService.measureText` | 2 | `CommentsService.map(…)`, `CommentsService.declaredLimits` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:147` |
| `CssCommentsService.walkComments(…)` | 2 | `CssCommentsService.toBody`, `CssCommentsService.toOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/css/css-comments.service.ts:59` |
| `HclCommentsService.readBlocks` | 2 | `HclCommentsService.map(…)`, `HclCommentsService.findBlockComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:65` |
| `HclCommentsService.map(…)` | 2 | `HclCommentsService.lineOf`, `HclCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:68` |
| `HclCommentsService.map(…)` | 2 | `HclCommentsService.lineOf`, `HclCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:86` |
| `SqlCommentsService.readBlocks` | 2 | `SqlCommentsService.map(…)`, `SqlCommentsService.findBlockComments` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:62` |
| `SqlCommentsService.map(…)` | 2 | `SqlCommentsService.lineOf`, `SqlCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:65` |
| `SqlCommentsService.map(…)` | 2 | `SqlCommentsService.lineOf`, `SqlCommentsService.isOwnLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:83` |
| `YamlCommentsService.collectComments` | 2 | `YamlCommentsService.isCommentToken`, `YamlCommentsService.toToken` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/yaml/yaml-comments.service.ts:32` |
| `LanguageCommentsService.measureLanguage` | 2 | `LanguageCommentsService.readFile`, `CommentsService.measure` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:56` |
| `LanguageCommentsService.measureOneLanguage` | 2 | `LanguageCommentsService.measurePython`, `LanguageCommentsService.measureLanguage` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:84` |
| `MarkdownService.countNode` | 2 | `MarkdownService.countHeading`, `MarkdownService.countListItem` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/markdown/markdown.service.ts:56` |
| `PythonService.analyzeContents` | 2 | `PythonService.map(…)`, `PythonService.analyze` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/python/python.service.ts:73` |
| `JupyterService.collectParts` | 2 | `JupyterService.readNotebook`, `JupyterService.collectCell` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/jupyter/jupyter.service.ts:82` |
| `SqlService.stripComments` | 2 | `SqlService.replaceAll(…)`, `SqlService.replaceAll(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/sql/sql.service.ts:48` |
| `TomlService.analyze` | 2 | `TomlService.countLine`, `TomlService.isInsideMultilineString` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/toml/toml.service.ts:94` |
| `DeclarationCommentsService.measure` | 2 | `DeclarationCommentsService.prepare`, `CommentsService.measureText` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/declaration-comments.service.ts:134` |
| `TypescriptService.countSymbols` | 2 | `TypescriptService.getSymbolModifiers`, `TypescriptService.every(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:156` |
| `TypescriptService.handleClass` | 2 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:265` |
| `TypescriptService.handleInterface` | 2 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:312` |
| `TypescriptService.handleTypeAlias` | 2 | `TypescriptService.hasExportKeyword`, `TypescriptService.hasTypeParameters` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:335` |
| `YamlService.countDocument` | 2 | `YamlService.countComments`, `YamlService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/yaml/yaml.service.ts:86` |
| `YamlService.countNode` | 2 | `YamlService.countComments`, `YamlService.countCollection` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/yaml/yaml.service.ts:93` |
| `CommentsService.readProse` | 1 | `CommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:77` |
| `CommentsService.readSource` | 1 | `CommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/comments.service.ts:85` |
| `CssCommentsService.read` | 1 | `CssCommentsService.walkComments(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/css/css-comments.service.ts:55` |
| `HashCommentsService.read` | 1 | `HashCommentsService.isShebang` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hash/hash-comments.service.ts:34` |
| `HclCommentsService.readMatches` | 1 | `HclCommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:81` |
| `HclCommentsService.overlapsBlock` | 1 | `HclCommentsService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:110` |
| `HclCommentsService.filter(…)` | 1 | `HclCommentsService.overlapsBlock` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:117` |
| `HclCommentsService.filter(…)` | 1 | `HclCommentsService.overlapsBlock` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/hcl/hcl-comments.service.ts:122` |
| `SqlCommentsService.readMatches` | 1 | `SqlCommentsService.map(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:78` |
| `SqlCommentsService.filter(…)` | 1 | `SqlCommentsService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/sql/sql-comments.service.ts:112` |
| `TypescriptCommentsService.flatMap(…)` | 1 | `TypescriptCommentsService.toToken` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/modules/typescript/typescript-comments.service.ts:136` |
| `LanguageCommentsService.readHash` | 1 | `HashCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:97` |
| `LanguageCommentsService.read` | 1 | `CssCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:108` |
| `LanguageCommentsService.read` | 1 | `HclCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:112` |
| `LanguageCommentsService.read` | 1 | `SqlCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:120` |
| `LanguageCommentsService.read` | 1 | `TypescriptCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:125` |
| `LanguageCommentsService.read` | 1 | `YamlCommentsService.read` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:130` |
| `LanguageCommentsService.measurePython` | 1 | `LanguageCommentsService.flatMap(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:146` |
| `LanguageCommentsService.flatMap(…)` | 1 | `CommentsService.measure` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:159` |
| `LanguageCommentsService.measure` | 1 | `LanguageCommentsService.flatMap(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:191` |
| `LanguageCommentsService.flatMap(…)` | 1 | `LanguageCommentsService.measureOneLanguage` | `projects/ic-suite/codometer/codometer-languages/src/modules/comments/language-comments.service.ts:209` |
| `CssService.analyze` | 1 | `CssService.walk(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/css/css.service.ts:74` |
| `CssService.walk(…)` | 1 | `CssService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/css/css.service.ts:88` |
| `HclService.countLine` | 1 | `HclService.countBlock` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/hcl/hcl.service.ts:60` |
| `HclService.analyze` | 1 | `HclService.countLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/hcl/hcl.service.ts:87` |
| `JsonService.countArrayNode` | 1 | `JsonService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:95` |
| `JsonService.countPrimitiveNode` | 1 | `JsonService.countPrimitiveValue` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:126` |
| `JsonService.countRecordNode` | 1 | `JsonService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:162` |
| `JsonService.stripJsoncComments` | 1 | `JsonService.consumeJsoncCharacter` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/json/json.service.ts:273` |
| `MarkdownService.walk` | 1 | `MarkdownService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/markdown/markdown.service.ts:75` |
| `MarkdownService.analyze` | 1 | `MarkdownService.analyzeContents` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/markdown/markdown.service.ts:92` |
| `MarkdownService.analyzeContents` | 1 | `MarkdownService.walk` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/markdown/markdown.service.ts:116` |
| `JupyterService.collectCell` | 1 | `JupyterService.readSource` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/jupyter/jupyter.service.ts:51` |
| `ShellService.countLine` | 1 | `ShellService.countStatements` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/shell/shell.service.ts:43` |
| `ShellService.analyze` | 1 | `ShellService.countLine` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/shell/shell.service.ts:91` |
| `TomlService.countLine` | 1 | `TomlService.countKey` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/toml/toml.service.ts:60` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleFunction` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:53` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleEnum` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:58` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleFunction` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:60` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleFunction` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:62` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleMethodOrAccessor` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:64` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleImport` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:66` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleInterface` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:68` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleMethodOrAccessor` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:70` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleMethodOrAccessor` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:72` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleTypeAlias` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:74` |
| `TypescriptService.anonymous` | 1 | `TypescriptService.handleVariable` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:76` |
| `TypescriptService.collectDeclarationComments` | 1 | `DeclarationCommentsService.measure` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:114` |
| `TypescriptService.getCountersForFile` | 1 | `TypescriptService.filter(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:220` |
| `TypescriptService.filter(…)` | 1 | `TypescriptService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:225` |
| `TypescriptService.handleEnum` | 1 | `TypescriptService.hasExportKeyword` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:272` |
| `TypescriptService.handleMethodOrAccessor` | 1 | `TypescriptService.hasAsyncKeyword` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:322` |
| `TypescriptService.handleVariable` | 1 | `TypescriptService.hasExportKeyword` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:344` |
| `TypescriptService.hasAsyncKeyword` | 1 | `TypescriptService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:356` |
| `TypescriptService.hasExportKeyword` | 1 | `TypescriptService.some(…)` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:368` |
| `TypescriptService.scanComments` | 1 | `TypescriptService.countComment` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:392` |
| `TypescriptService.forEachChild(…)` | 1 | `TypescriptService.walkNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:445` |
| `TypescriptService.forEachChild(…)` | 1 | `TypescriptService.walkNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/typescript/typescript.service.ts:452` |
| `YamlService.countCollection` | 1 | `YamlService.countNode` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/yaml/yaml.service.ts:44` |
| `YamlService.analyze` | 1 | `YamlService.countDocument` | `projects/ic-suite/codometer/codometer-languages/src/modules/languages/modules/yaml/yaml.service.ts:121` |

</details>
<!-- callidescope:end -->
