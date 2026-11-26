<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-languages`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 166 |
| Files | 56 |
| Calls traced | 216 |
| Call stacks | 15 |
| Deepest stack | 13 |
| Stacks through recursion | 3 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 13 |
| `maximumBreadth` | 11 |

### Call stacks (depth)

**1. `JupyterService.validateDocument`** — depth 13 · orphan-root

```text
🚀 JupyterService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:147]
   ↳ Reports every notebook difference: envelope, missing cells, cell contents.
  └─> JupyterService.map(…)(…): { error: { differenceType: "code"; expected: string; fix: string; language: "python"; message: string; weight: number; }; weight: number; } [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:167]
    └─> JupyterService.weighMissingCell(args: { cell: PairedCells; document: PreparedValidationDocument; }): number [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:134]
       ↳ Weighs a cell the notebook lacks, against an empty instance. A flat weight would price a large cell like an empty one.
      └─> JupyterService.validateCell(…): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:88]
         ↳ Validates one paired cell with the validator matching its kind.
        └─> MarkdownService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown.service.ts:48]
           ↳ Reports every markdown structure the template requires and the file lacks.
          └─> MarkdownTreeService.compareContainer(args: CompareNodeArguments): CompareNodeResult (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:72]
             ↳ Matches a container node, then descends into it.
            └─> MarkdownTreeService.map(…)(…): { captures: { [x: string]: string; }; differences: MarkdownComparisonError[]; lastMatchedNode: MarkdownNode; totalWeight: number; } (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:99]
              └─> MarkdownTreeService.compareChildren(args: CompareChildrenArguments): CompareChildrenResult (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:162]
                 ↳ Compares one level of two trees, descending into containers.
                └─> MarkdownTreeService.compareLeaf(args: CompareNodeArguments): CompareNodeResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:127]
                   ↳ Matches a leaf node on its own identity, without descending.
                  └─> MarkdownTreeService.findCandidates(args: CompareNodeArguments): MarkdownNode[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:148]
                     ↳ Finds every instance sibling satisfying the template node.
                    └─> MarkdownTreeService.filter(…)(instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:149]
                      └─> MarkdownNodesService.capture(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:106]
                         ↳ Matches an instance node against a template node, returning placeholder captures.
                        └─> MarkdownNodesService.readText(node: MarkdownNode): string [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:174]
                           ↳ Reads a node's rendered plain text.
```

**2. `JsonService.validateDocument`** — depth 12 · orphan-root

```text
🚀 JsonService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json.service.ts:39]
   ↳ Reports every key or value the template requires and the instance lacks.
  └─> JsonComparisonService.compareArrayItem(…): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:95]
     ↳ Matches one required array entry against the instance array.
    └─> JsonComparisonService.map(…)(instanceItem: JsonValue, index: number): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:150]
      └─> JsonComparisonService.compare(args: CompareJsonArguments): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:291]
         ↳ Compares a template value against an instance value, returning every way the instance fails to contain what the…
        └─> JsonComparisonService.compareArrays(…): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:166]
           ↳ Compares two arrays. Scalars may appear anywhere; objects match the entry with the fewest differences.
          └─> JsonComparisonService.map(…)(templateItem: JsonValue): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:173]
            └─> JsonComparisonService.compareObjects(…): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:180]
               ↳ Compares two objects, requiring every template key to be present.
              └─> JsonComparisonService.map(…)([key, templateValue]: [string, JsonValue]): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:189]
                └─> JsonComparisonService.countNodes(value: JsonValue): number (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:232]
                   ↳ Counts a JSON value and every value nested inside it.
                  └─> JsonComparisonService.reduce(…)(total: number, item: JsonValue): number (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:234]
                    └─> JsonComparisonService.reduce(…)(total: number, nested: JsonValue): number (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:240]
                      └─> JsonComparisonService.isJsonObject(value: JsonValue): value is Record<string, JsonValue> [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:260]
                         ↳ Returns whether a value is a plain JSON object.
```

**3. `TypescriptService.validateDocument`** — depth 12 · orphan-root

```text
🚀 TypescriptService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:168]
   ↳ Reports every declaration and comment the template requires.
  └─> TypescriptService.validateStructure(…): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:107]
     ↳ Compares the syntax trees and describes each missing declaration.
    └─> TypescriptTreeService.compareBestCandidate(…): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:55]
       ↳ Descends into whichever candidate leaves the least of the template unaccounted for.
      └─> TypescriptTreeService.map(…)(…): { captures: { [x: string]: string; }; differences: TypescriptComparisonError[]; totalWeight: number; } (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:60]
        └─> TypescriptTreeService.compareTree(args: CompareTreeArguments): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:162]
           ↳ Compares one level of two trees, descending into every match.
          └─> TypescriptTreeService.map(…)(templateChild: Node): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:169]
            └─> TypescriptTreeService.compareChild(…): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:81]
               ↳ Matches one template child against the instance's children.
              └─> TypescriptTreeService.flatMap(…)(…): { captures: Record<string, string>; node: Node; }[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:87]
                └─> TypescriptTreeService.matchKey(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:127]
                   ↳ Matches a template node on its key, returning placeholder captures.
                  └─> TypescriptNodesService.readKey(node: Node): null | string [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:195]
                     ↳ Reads a node's identity, or `null` when it has none. A `null` key matches by syntax kind alone.
                    └─> TypescriptNodesService.readDecoratorKey(node: Decorator): null | string [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:73]
                       ↳ Keys a decorator by its callee, so `@Injectable()` matches `@Injectable`.
                      └─> TypescriptNodesService.buildDottedName(callee: Node): null | string [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:44]
                         ↳ Builds a dotted name such as `Nest.Injectable` from a callee expression.
```

<details>
<summary>12 more call stacks</summary>

**4. `PythonService.validateDocument`** — depth 6 · orphan-root

```text
🚀 PythonService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python.service.ts:38]
   ↳ Reports every declaration and comment the template requires.
  └─> PythonBridgeService.validatePythonSource(args: RunPythonBridgeArguments): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:151]
     ↳ Compares one Python source against its rendered template.
    └─> PythonBridgeService.map(…)(error: Readonly<Record<string, unknown>>): ConformetryDifference [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:176]
      └─> PythonBridgeService.toConformetryDifference(error: PythonBridgeError): ConformetryDifference [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:126]
         ↳ Maps one snake_case bridge error onto the shared error shape.
        └─> PythonBridgeService.readValues(error: PythonBridgeError): Partial<ConformetryDifference> [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:115]
           ↳ Reads the optional expected and actual values.
          └─> PythonBridgeService.readString(error: PythonBridgeError, key: string): string | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:105]
             ↳ Narrows an untrusted string field from the bridge payload.
```

**5. `LanguagesService.validateDocument`** — depth 5 · orphan-root

```text
🚀 LanguagesService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:72]
  └─> TextService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:111]
     ↳ Reports every template line missing from the instance.
    └─> TextService.findMissingLines(document: PreparedValidationDocument): LineComparison [projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:74]
       ↳ Finds template lines the instance does not supply often enough.
      └─> TextService.captureLine(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:39]
         ↳ Captures what a template line's placeholder values stand for, taking the first unclaimed instance line that fits it as…
        └─> capturePlaceholderValues(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.utilities.ts:17]
           ↳ Reads what each placeholder value in `templateText` stands for in `instanceText`.
```

**6. `MarkdownNodesService.table`** — depth 3 · orphan-root

```text
🚀 MarkdownNodesService.table(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:62]
  └─> MarkdownNodesService.readColumnCount(node: MarkdownNode): number [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:85]
     ↳ Counts a table's columns from its first row.
    └─> MarkdownNodesService.readChildren(node: MarkdownNode): MarkdownNode[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:169]
       ↳ Reads a node's children, or an empty list for a leaf.
```

**7. `MarkdownNodesService.matches`** — depth 3 · orphan-root

```text
🚀 MarkdownNodesService.matches(args: { instanceNode: MarkdownNode; templateNode: MarkdownNode; }): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:161]
   ↳ Returns whether an instance node satisfies a template node.
  └─> MarkdownNodesService.capture(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:106]
     ↳ Matches an instance node against a template node, returning placeholder captures.
    └─> MarkdownNodesService.readText(node: MarkdownNode): string [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:174]
       ↳ Reads a node's rendered plain text.
```

**8. `MarkdownNodesService.code`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.code(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:29]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Compares two optional string fields, treating absent as empty.
```

**9. `MarkdownNodesService.heading`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.heading(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:35]
  └─> MarkdownNodesService.readText(node: MarkdownNode): string [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:174]
     ↳ Reads a node's rendered plain text.
```

**10. `MarkdownNodesService.html`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.html(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:41]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Compares two optional string fields, treating absent as empty.
```

**11. `MarkdownNodesService.image`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.image(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:44]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Compares two optional string fields, treating absent as empty.
```

**12. `MarkdownNodesService.inlineCode`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.inlineCode(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:50]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Compares two optional string fields, treating absent as empty.
```

**13. `MarkdownNodesService.link`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.link(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:53]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Compares two optional string fields, treating absent as empty.
```

**14. `MarkdownNodesService.tableRow`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.tableRow(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:68]
  └─> MarkdownNodesService.readChildren(node: MarkdownNode): MarkdownNode[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:169]
     ↳ Reads a node's children, or an empty list for a leaf.
```

**15. `MarkdownNodesService.text`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.text(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:74]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Compares two optional string fields, treating absent as empty.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `JupyterService.validateDocument` | 11 | `JupyterNotebookService.parseNotebook`, `JupyterNotebookService.pairCells`, `JsonComparisonService.compare`, `JupyterService.readEnvelope`, `JupyterService.map(…)`, `JupyterService.map(…)`, `JupyterService.map(…)`, `JupyterService.flatMap(…)`, `JupyterService.reduce(…)`, `JupyterService.map(…)`, `JupyterService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:147` |
| `JsonComparisonService.compareArrayItem` | 8 | `JsonComparisonService.formatPath`, `JsonComparisonService.countNodes`, `JsonComparisonService.isJsonPrimitive`, `JsonComparisonService.find(…)`, `JsonComparisonService.map(…)`, `JsonComparisonService.buildError`, `JsonComparisonService.pickClosestMatch`, `JsonComparisonService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:95` |
| `JsonComparisonService.compare` | 8 | `JsonComparisonService.countContainer`, `JsonComparisonService.compareArrays`, `JsonComparisonService.isJsonObject`, `JsonComparisonService.compareObjects`, `JsonComparisonService.countNodes`, `JsonComparisonService.captureString`, `JsonComparisonService.formatPath`, `JsonComparisonService.buildError` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:291` |

<details>
<summary>90 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MarkdownTreeService.compareContainer` | 6 | `MarkdownTreeService.findCandidates`, `MarkdownTreeService.buildError`, `MarkdownNodesService.readChildren`, `MarkdownTreeService.captureFirst`, `MarkdownTreeService.reduce(…)`, `MarkdownTreeService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:72` |
| `PythonBridgeService.toConformetryDifference` | 6 | `PythonBridgeService.readValues`, `PythonBridgeService.readLocations`, `DifferencesService.resolveDifferenceType`, `PythonBridgeService.readString`, `DifferencesService.resolveErrorLanguage`, `PythonBridgeService.readNumber` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:126` |
| `TypescriptNodesService.readKey` | 6 | `TypescriptNodesService.readImportKey`, `TypescriptNodesService.readExportKey`, `TypescriptNodesService.readDecoratorKey`, `TypescriptNodesService.readExpressionStatementKey`, `TypescriptNodesService.readLiteralKey`, `TypescriptNodesService.readNamedKey` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:195` |
| `LanguagesService.resolveValidators` | 5 | `LanguagesService.filter(…)`, `LanguagesService.claimingLanguages`, `LanguagesService.flatMap(…)`, `LanguagesService.filter(…)`, `LanguagesService.widenFallback` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:83` |
| `JsonComparisonService.map(…)` | 4 | `JsonComparisonService.formatPath`, `JsonComparisonService.countNodes`, `JsonComparisonService.buildError`, `JsonComparisonService.compare` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:189` |
| `MarkdownTreeService.compareLeaf` | 4 | `MarkdownTreeService.findCandidates`, `MarkdownNodesService.countSubtree`, `MarkdownTreeService.buildError`, `MarkdownTreeService.captureFirst` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:127` |
| `TypescriptTreeService.compareChild` | 4 | `TypescriptNodesService.readKey`, `TypescriptTreeService.flatMap(…)`, `TypescriptTreeService.buildError`, `TypescriptTreeService.compareBestCandidate` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:81` |
| `FilesService.checkInstanceFiles` | 3 | `ConfigurationService.resolveInstanceFiles`, `FilesService.buildMissingDifference`, `FilesService.countExpectedFiles` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/files/files.service.ts:90` |
| `JsonComparisonService.countNodes` | 3 | `JsonComparisonService.reduce(…)`, `JsonComparisonService.isJsonObject`, `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:232` |
| `JupyterNotebookService.pairCells` | 3 | `JupyterNotebookService.groupSourcesByKind`, `JupyterNotebookService.readCellKind`, `JupyterNotebookService.readCellSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:80` |
| `MarkdownTreeService.map(…)` | 3 | `MarkdownTreeService.compareChildren`, `MarkdownNodesService.readChildren`, `MarkdownTreeService.captureFirst` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:99` |
| `MarkdownService.validateDocument` | 3 | `MarkdownTreeService.compareChildren`, `MarkdownNodesService.filterNodes`, `MarkdownService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown.service.ts:48` |
| `PythonBridgeService.validatePythonSource` | 3 | `PythonBridgeService.buildBridgeError`, `PythonBridgeService.map(…)`, `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:151` |
| `JupyterService.validateCell` | 3 | `MarkdownService.validateDocument`, `JupyterService.attributeToCell`, `PythonBridgeService.validatePythonSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:88` |
| `TypescriptTreeService.compareTree` | 3 | `TypescriptNodesService.readChildren`, `TypescriptTreeService.reduce(…)`, `TypescriptTreeService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:162` |
| `TypescriptService.validateDocument` | 3 | `TypescriptService.parseSourceFile`, `TypescriptService.validateStructure`, `TypescriptService.validateComments` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:168` |
| `FilesService.buildMissingDifference` | 2 | `DifferencesService.buildMissingFileDifference`, `DifferencesService.buildMissingDirectoryDifference` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/files/files.service.ts:48` |
| `JsonComparisonService.compareArrays` | 2 | `JsonComparisonService.combine`, `JsonComparisonService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:166` |
| `JsonComparisonService.compareObjects` | 2 | `JsonComparisonService.combine`, `JsonComparisonService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:180` |
| `JupyterNotebookService.groupSourcesByKind` | 2 | `JupyterNotebookService.readCellKind`, `JupyterNotebookService.readCellSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:31` |
| `MarkdownNodesService.link` | 2 | `MarkdownNodesService.sameField`, `MarkdownNodesService.readText` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:53` |
| `MarkdownNodesService.capture` | 2 | `MarkdownNodesService.readText`, `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:106` |
| `MarkdownNodesService.countSubtree` | 2 | `MarkdownNodesService.reduce(…)`, `MarkdownNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:139` |
| `MarkdownTreeService.buildError` | 2 | `MarkdownNodesService.readText`, `MarkdownNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:38` |
| `MarkdownTreeService.compareChildren` | 2 | `MarkdownTreeService.compareContainer`, `MarkdownTreeService.compareLeaf` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:162` |
| `TextService.findMissingLines` | 2 | `TextService.countLines`, `TextService.captureLine` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:74` |
| `TextService.validateDocument` | 2 | `TextService.findMissingLines`, `TextService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:111` |
| `TypescriptCommentsService.compareComments` | 2 | `TypescriptCommentsService.extractComments`, `TypescriptCommentsService.findIndex(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-comments.service.ts:41` |
| `TypescriptCommentsService.extractComments` | 2 | `TypescriptCommentsService.visit`, `TypescriptCommentsService.toSorted(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-comments.service.ts:71` |
| `TypescriptNodesService.readExpressionStatementKey` | 2 | `TypescriptNodesService.buildDottedName`, `TypescriptNodesService.readLiteralKey` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:96` |
| `TypescriptNodesService.countSubtree` | 2 | `TypescriptNodesService.reduce(…)`, `TypescriptNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:171` |
| `TypescriptTreeService.buildError` | 2 | `TypescriptNodesService.readKindLabel`, `TypescriptNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:36` |
| `TypescriptTreeService.compareBestCandidate` | 2 | `TypescriptTreeService.reduce(…)`, `TypescriptTreeService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:55` |
| `TypescriptTreeService.flatMap(…)` | 2 | `TypescriptTreeService.matchKind`, `TypescriptTreeService.matchKey` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:87` |
| `TypescriptTreeService.matchKey` | 2 | `TypescriptNodesService.readKey`, `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:127` |
| `TypescriptService.validateComments` | 2 | `TypescriptCommentsService.compareComments`, `TypescriptService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:75` |
| `TypescriptService.validateStructure` | 2 | `TypescriptTreeService.compareTree`, `TypescriptService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:107` |
| `DifferencesService.resolveDifferenceType` | 1 | `DifferencesService.find(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/differences/differences.service.ts:75` |
| `DifferencesService.resolveErrorLanguage` | 1 | `DifferencesService.find(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/differences/differences.service.ts:88` |
| `FilesService.countExpectedFiles` | 1 | `FilesService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/files/files.service.ts:74` |
| `ScoringService.sumWeights` | 1 | `ScoringService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/scoring/scoring.service.ts:48` |
| `JsonComparisonService.captureString` | 1 | `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:63` |
| `JsonComparisonService.combine` | 1 | `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:81` |
| `JsonComparisonService.map(…)` | 1 | `JsonComparisonService.captureString` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:109` |
| `JsonComparisonService.map(…)` | 1 | `JsonComparisonService.compare` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:150` |
| `JsonComparisonService.map(…)` | 1 | `JsonComparisonService.compareArrayItem` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:173` |
| `JsonComparisonService.reduce(…)` | 1 | `JsonComparisonService.countNodes` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:234` |
| `JsonComparisonService.reduce(…)` | 1 | `JsonComparisonService.countNodes` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:240` |
| `JsonComparisonService.formatPath` | 1 | `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:249` |
| `JsonComparisonService.pickClosestMatch` | 1 | `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:276` |
| `JsonComparisonService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:277` |
| `JsonService.validateDocument` | 1 | `JsonComparisonService.compare` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json.service.ts:39` |
| `JupyterNotebookService.readCellSource` | 1 | `JupyterNotebookService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:57` |
| `JupyterNotebookService.parseNotebook` | 1 | `JupyterNotebookService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:119` |
| `MarkdownNodesService.code` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:29` |
| `MarkdownNodesService.heading` | 1 | `MarkdownNodesService.readText` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:35` |
| `MarkdownNodesService.html` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:41` |
| `MarkdownNodesService.image` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:44` |
| `MarkdownNodesService.inlineCode` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:50` |
| `MarkdownNodesService.table` | 1 | `MarkdownNodesService.readColumnCount` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:62` |
| `MarkdownNodesService.tableRow` | 1 | `MarkdownNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:68` |
| `MarkdownNodesService.text` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:74` |
| `MarkdownNodesService.readColumnCount` | 1 | `MarkdownNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:85` |
| `MarkdownNodesService.reduce(…)` | 1 | `MarkdownNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:144` |
| `MarkdownNodesService.filterNodes` | 1 | `MarkdownNodesService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:150` |
| `MarkdownNodesService.matches` | 1 | `MarkdownNodesService.capture` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:161` |
| `MarkdownTreeService.captureFirst` | 1 | `MarkdownNodesService.capture` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:53` |
| `MarkdownTreeService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:116` |
| `MarkdownTreeService.findCandidates` | 1 | `MarkdownTreeService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:148` |
| `MarkdownTreeService.filter(…)` | 1 | `MarkdownNodesService.capture` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:149` |
| `PythonBridgeService.readLocations` | 1 | `PythonBridgeService.readNumber` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:78` |
| `PythonBridgeService.readValues` | 1 | `PythonBridgeService.readString` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:115` |
| `PythonBridgeService.map(…)` | 1 | `PythonBridgeService.toConformetryDifference` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:176` |
| `PythonService.validateDocument` | 1 | `PythonBridgeService.validatePythonSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python.service.ts:38` |
| `JupyterService.attributeToCell` | 1 | `JupyterService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:50` |
| `JupyterService.weighMissingCell` | 1 | `JupyterService.validateCell` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:134` |
| `JupyterService.map(…)` | 1 | `JupyterService.weighMissingCell` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:167` |
| `JupyterService.map(…)` | 1 | `JupyterService.validateCell` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:182` |
| `TextService.captureLine` | 1 | `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:39` |
| `TypescriptNodesService.readDecoratorKey` | 1 | `TypescriptNodesService.buildDottedName` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:73` |
| `TypescriptNodesService.readNamedKey` | 1 | `TypescriptNodesService.isNode` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:141` |
| `TypescriptNodesService.reduce(…)` | 1 | `TypescriptNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:172` |
| `TypescriptNodesService.readChildren` | 1 | `TypescriptNodesService.forEachChild(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:178` |
| `TypescriptTreeService.map(…)` | 1 | `TypescriptTreeService.compareTree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:60` |
| `TypescriptTreeService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:72` |
| `TypescriptTreeService.map(…)` | 1 | `TypescriptTreeService.compareChild` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:169` |
| `TypescriptService.map(…)` | 1 | `TypescriptService.readLocation` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:81` |
| `TypescriptService.map(…)` | 1 | `TypescriptService.readLocation` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:116` |
| `LanguagesService.validateDocument` | 1 | `TextService.validateDocument` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:72` |
| `LanguagesService.filter(…)` | 1 | `LanguagesService.some(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:86` |

</details>
<!-- callidescope:end -->
