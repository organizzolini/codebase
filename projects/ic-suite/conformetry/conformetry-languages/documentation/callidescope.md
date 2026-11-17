<!-- callidescope:start -->

## 🔭 Callidescope

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
🚀 JupyterService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:153]
   ↳ Reports every notebook difference: envelope, missing cells, cell contents.
  └─> JupyterService.map(…)(…): { error: { differenceType: "code"; expected: string; fix: string; language: "python"; message: string; weight: number; }; weight: number; } [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:173]
    └─> JupyterService.weighMissingCell(args: { cell: PairedCells; document: PreparedValidationDocument; }): number [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:140]
       ↳ Weighs a cell the notebook does not have.
      └─> JupyterService.validateCell(…): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:90]
         ↳ Validates one paired cell with the validator matching its kind.
        └─> MarkdownService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown.service.ts:48]
           ↳ Reports every markdown structure the template requires and the file lacks.
          └─> MarkdownTreeService.compareContainer(args: CompareNodeArguments): CompareNodeResult (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:80]
             ↳ Matches a container node, then descends into it.
            └─> MarkdownTreeService.map(…)(…): { captures: { [x: string]: string; }; differences: MarkdownComparisonError[]; lastMatchedNode: MarkdownNode; totalWeight: number; } (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:107]
              └─> MarkdownTreeService.compareChildren(args: CompareChildrenArguments): CompareChildrenResult (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:170]
                 ↳ Compares one level of two trees, descending into containers.
                └─> MarkdownTreeService.compareLeaf(args: CompareNodeArguments): CompareNodeResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:135]
                   ↳ Matches a leaf node on its own identity, without descending.
                  └─> MarkdownTreeService.findCandidates(args: CompareNodeArguments): MarkdownNode[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:156]
                     ↳ Finds every instance sibling satisfying the template node.
                    └─> MarkdownTreeService.filter(…)(instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:157]
                      └─> MarkdownNodesService.capture(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:116]
                         ↳ Matches an instance node against a template node, returning what any placeholder value in the template node's text…
                        └─> MarkdownNodesService.readText(node: MarkdownNode): string [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:190]
                           ↳ Reads a node's rendered plain text.
```

**2. `JsonService.validateDocument`** — depth 12 · orphan-root

```text
🚀 JsonService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json.service.ts:39]
   ↳ Reports every key or value the template requires and the instance lacks.
  └─> JsonComparisonService.compareArrayItem(…): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:103]
     ↳ Matches one required array entry against the instance array.
    └─> JsonComparisonService.map(…)(instanceItem: JsonValue, index: number): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:158]
      └─> JsonComparisonService.compare(args: CompareJsonArguments): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:304]
         ↳ Compares a template value against an instance value, returning every way the instance fails to contain what the…
        └─> JsonComparisonService.compareArrays(…): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:177]
           ↳ Compares two arrays.
          └─> JsonComparisonService.map(…)(templateItem: JsonValue): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:184]
            └─> JsonComparisonService.compareObjects(…): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:191]
               ↳ Compares two objects, requiring every template key to be present.
              └─> JsonComparisonService.map(…)([key, templateValue]: [string, JsonValue]): JsonComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:200]
                └─> JsonComparisonService.countNodes(value: JsonValue): number (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:243]
                   ↳ Counts a JSON value and every value nested inside it.
                  └─> JsonComparisonService.reduce(…)(total: number, item: JsonValue): number (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:245]
                    └─> JsonComparisonService.reduce(…)(total: number, nested: JsonValue): number (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:251]
                      └─> JsonComparisonService.isJsonObject(value: JsonValue): value is Record<string, JsonValue> [projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:271]
                         ↳ Returns whether a value is a plain JSON object.
```

**3. `TypescriptService.validateDocument`** — depth 12 · orphan-root

```text
🚀 TypescriptService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:170]
   ↳ Reports every declaration and comment the template requires.
  └─> TypescriptService.validateStructure(…): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:107]
     ↳ Compares the syntax trees and describes each missing declaration.
    └─> TypescriptTreeService.compareBestCandidate(…): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:69]
       ↳ Descends into whichever candidate explains the template best.
      └─> TypescriptTreeService.map(…)(…): { captures: { [x: string]: string; }; differences: TypescriptComparisonError[]; totalWeight: number; } (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:74]
        └─> TypescriptTreeService.compareTree(args: CompareTreeArguments): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:179]
           ↳ Compares one level of two trees, descending into every match.
          └─> TypescriptTreeService.map(…)(templateChild: Node): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:186]
            └─> TypescriptTreeService.compareChild(…): TreeComparison (cycle) [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:95]
               ↳ Matches one template child against the instance's children.
              └─> TypescriptTreeService.flatMap(…)(…): { captures: Record<string, string>; node: Node; }[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:101]
                └─> TypescriptTreeService.matchKey(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:144]
                   ↳ Matches a template node on its key, returning what any placeholder value in the key captured, or `undefined` when the…
                  └─> TypescriptNodesService.readKey(node: Node): null | string [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:201]
                     ↳ Reads a node's identity, or `null` when it has none.
                    └─> TypescriptNodesService.readDecoratorKey(node: Decorator): null | string [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:75]
                       ↳ Keys a decorator by its callee, so `@Injectable()` matches `@Injectable`.
                      └─> TypescriptNodesService.buildDottedName(callee: Node): null | string [projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:46]
                         ↳ Builds a dotted name such as `Nest.Injectable` from a callee expression.
```

<details>
<summary>12 more call stacks</summary>

**4. `PythonService.validateDocument`** — depth 6 · orphan-root

```text
🚀 PythonService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python.service.ts:38]
   ↳ Reports every declaration and comment the template requires.
  └─> PythonBridgeService.validatePythonSource(args: RunPythonBridgeArguments): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:162]
     ↳ Compares one Python source against its rendered template.
    └─> PythonBridgeService.map(…)(error: Readonly<Record<string, unknown>>): ConformetryDifference [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:187]
      └─> PythonBridgeService.toConformetryDifference(error: PythonBridgeError): ConformetryDifference [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:134]
         ↳ Maps one snake_case bridge error onto the shared error shape.
        └─> PythonBridgeService.readValues(error: PythonBridgeError): Partial<ConformetryDifference> [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:123]
           ↳ Reads the optional expected and actual values.
          └─> PythonBridgeService.readString(error: PythonBridgeError, key: string): string | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:113]
             ↳ Narrows an untrusted string field from the bridge payload.
```

**5. `LanguagesService.validateDocument`** — depth 5 · orphan-root

```text
🚀 LanguagesService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:80]
  └─> TextService.validateDocument(document: PreparedValidationDocument): DocumentValidationResult [projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:113]
     ↳ Reports every template line missing from the instance.
    └─> TextService.findMissingLines(document: PreparedValidationDocument): LineComparison [projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:74]
       ↳ Finds template lines the instance does not supply often enough.
      └─> TextService.captureLine(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:39]
         ↳ Captures what a template line's placeholder values stand for, taking the first unclaimed instance line that fits it as…
        └─> capturePlaceholderValues(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.utilities.ts:21]
           ↳ Reads what each placeholder value in `templateText` stands for in `instanceText`.
```

**6. `MarkdownNodesService.table`** — depth 3 · orphan-root

```text
🚀 MarkdownNodesService.table(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:69]
  └─> MarkdownNodesService.readColumnCount(node: MarkdownNode): number [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92]
     ↳ Counts a table's columns from its first row.
    └─> MarkdownNodesService.readChildren(node: MarkdownNode): MarkdownNode[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:185]
       ↳ Reads a node's children, or an empty list for a leaf.
```

**7. `MarkdownNodesService.matches`** — depth 3 · orphan-root

```text
🚀 MarkdownNodesService.matches(args: { instanceNode: MarkdownNode; templateNode: MarkdownNode; }): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:177]
   ↳ Returns whether an instance node satisfies a template node.
  └─> MarkdownNodesService.capture(…): Record<string, string> | undefined [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:116]
     ↳ Matches an instance node against a template node, returning what any placeholder value in the template node's text…
    └─> MarkdownNodesService.readText(node: MarkdownNode): string [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:190]
       ↳ Reads a node's rendered plain text.
```

**8. `MarkdownNodesService.code`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.code(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:36]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:99]
     ↳ Compares two optional string fields, treating absent as empty.
```

**9. `MarkdownNodesService.heading`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.heading(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:42]
  └─> MarkdownNodesService.readText(node: MarkdownNode): string [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:190]
     ↳ Reads a node's rendered plain text.
```

**10. `MarkdownNodesService.html`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.html(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:48]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:99]
     ↳ Compares two optional string fields, treating absent as empty.
```

**11. `MarkdownNodesService.image`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.image(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:51]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:99]
     ↳ Compares two optional string fields, treating absent as empty.
```

**12. `MarkdownNodesService.inlineCode`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.inlineCode(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:57]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:99]
     ↳ Compares two optional string fields, treating absent as empty.
```

**13. `MarkdownNodesService.link`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.link(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:60]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:99]
     ↳ Compares two optional string fields, treating absent as empty.
```

**14. `MarkdownNodesService.tableRow`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.tableRow(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:75]
  └─> MarkdownNodesService.readChildren(node: MarkdownNode): MarkdownNode[] [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:185]
     ↳ Reads a node's children, or an empty list for a leaf.
```

**15. `MarkdownNodesService.text`** — depth 2 · orphan-root

```text
🚀 MarkdownNodesService.text(templateNode: MarkdownNode, instanceNode: MarkdownNode): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:81]
  └─> MarkdownNodesService.sameField(leftValue: string | undefined, rightValue: string | undefined): boolean [projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:99]
     ↳ Compares two optional string fields, treating absent as empty.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `JupyterService.validateDocument` | 11 | `JupyterNotebookService.parseNotebook`, `JupyterNotebookService.pairCells`, `JsonComparisonService.compare`, `JupyterService.readEnvelope`, `JupyterService.map(…)`, `JupyterService.map(…)`, `JupyterService.map(…)`, `JupyterService.flatMap(…)`, `JupyterService.reduce(…)`, `JupyterService.map(…)`, `JupyterService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:153` |
| `JsonComparisonService.compareArrayItem` | 8 | `JsonComparisonService.formatPath`, `JsonComparisonService.countNodes`, `JsonComparisonService.isJsonPrimitive`, `JsonComparisonService.find(…)`, `JsonComparisonService.map(…)`, `JsonComparisonService.buildError`, `JsonComparisonService.pickClosestMatch`, `JsonComparisonService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:103` |
| `JsonComparisonService.compare` | 8 | `JsonComparisonService.countContainer`, `JsonComparisonService.compareArrays`, `JsonComparisonService.isJsonObject`, `JsonComparisonService.compareObjects`, `JsonComparisonService.countNodes`, `JsonComparisonService.captureString`, `JsonComparisonService.formatPath`, `JsonComparisonService.buildError` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:304` |

<details>
<summary>90 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MarkdownTreeService.compareContainer` | 6 | `MarkdownTreeService.findCandidates`, `MarkdownTreeService.buildError`, `MarkdownNodesService.readChildren`, `MarkdownTreeService.captureFirst`, `MarkdownTreeService.reduce(…)`, `MarkdownTreeService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:80` |
| `PythonBridgeService.toConformetryDifference` | 6 | `PythonBridgeService.readValues`, `PythonBridgeService.readLocations`, `DifferencesService.resolveDifferenceType`, `PythonBridgeService.readString`, `DifferencesService.resolveErrorLanguage`, `PythonBridgeService.readNumber` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:134` |
| `TypescriptNodesService.readKey` | 6 | `TypescriptNodesService.readImportKey`, `TypescriptNodesService.readExportKey`, `TypescriptNodesService.readDecoratorKey`, `TypescriptNodesService.readExpressionStatementKey`, `TypescriptNodesService.readLiteralKey`, `TypescriptNodesService.readNamedKey` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:201` |
| `LanguagesService.resolveValidators` | 5 | `LanguagesService.filter(…)`, `LanguagesService.claimingLanguages`, `LanguagesService.flatMap(…)`, `LanguagesService.filter(…)`, `LanguagesService.widenFallback` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:95` |
| `JsonComparisonService.map(…)` | 4 | `JsonComparisonService.formatPath`, `JsonComparisonService.countNodes`, `JsonComparisonService.buildError`, `JsonComparisonService.compare` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:200` |
| `MarkdownTreeService.compareLeaf` | 4 | `MarkdownTreeService.findCandidates`, `MarkdownNodesService.countSubtree`, `MarkdownTreeService.buildError`, `MarkdownTreeService.captureFirst` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:135` |
| `TypescriptTreeService.compareChild` | 4 | `TypescriptNodesService.readKey`, `TypescriptTreeService.flatMap(…)`, `TypescriptTreeService.buildError`, `TypescriptTreeService.compareBestCandidate` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:95` |
| `FilesService.checkInstanceFiles` | 3 | `ConfigurationService.resolveInstanceFiles`, `FilesService.buildMissingDifference`, `FilesService.countExpectedFiles` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/files/files.service.ts:96` |
| `JsonComparisonService.countNodes` | 3 | `JsonComparisonService.reduce(…)`, `JsonComparisonService.isJsonObject`, `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:243` |
| `JupyterNotebookService.pairCells` | 3 | `JupyterNotebookService.groupSourcesByKind`, `JupyterNotebookService.readCellKind`, `JupyterNotebookService.readCellSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:82` |
| `MarkdownTreeService.map(…)` | 3 | `MarkdownTreeService.compareChildren`, `MarkdownNodesService.readChildren`, `MarkdownTreeService.captureFirst` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:107` |
| `MarkdownService.validateDocument` | 3 | `MarkdownTreeService.compareChildren`, `MarkdownNodesService.filterNodes`, `MarkdownService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown.service.ts:48` |
| `PythonBridgeService.validatePythonSource` | 3 | `PythonBridgeService.buildBridgeError`, `PythonBridgeService.map(…)`, `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:162` |
| `JupyterService.validateCell` | 3 | `MarkdownService.validateDocument`, `JupyterService.attributeToCell`, `PythonBridgeService.validatePythonSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:90` |
| `TypescriptTreeService.compareTree` | 3 | `TypescriptNodesService.readChildren`, `TypescriptTreeService.reduce(…)`, `TypescriptTreeService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:179` |
| `TypescriptService.validateDocument` | 3 | `TypescriptService.parseSourceFile`, `TypescriptService.validateStructure`, `TypescriptService.validateComments` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:170` |
| `FilesService.buildMissingDifference` | 2 | `DifferencesService.buildMissingFileDifference`, `DifferencesService.buildMissingDirectoryDifference` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/files/files.service.ts:52` |
| `JsonComparisonService.compareArrays` | 2 | `JsonComparisonService.combine`, `JsonComparisonService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:177` |
| `JsonComparisonService.compareObjects` | 2 | `JsonComparisonService.combine`, `JsonComparisonService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:191` |
| `JupyterNotebookService.groupSourcesByKind` | 2 | `JupyterNotebookService.readCellKind`, `JupyterNotebookService.readCellSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:31` |
| `MarkdownNodesService.link` | 2 | `MarkdownNodesService.sameField`, `MarkdownNodesService.readText` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:60` |
| `MarkdownNodesService.capture` | 2 | `MarkdownNodesService.readText`, `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:116` |
| `MarkdownNodesService.countSubtree` | 2 | `MarkdownNodesService.reduce(…)`, `MarkdownNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:155` |
| `MarkdownTreeService.buildError` | 2 | `MarkdownNodesService.readText`, `MarkdownNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:45` |
| `MarkdownTreeService.compareChildren` | 2 | `MarkdownTreeService.compareContainer`, `MarkdownTreeService.compareLeaf` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:170` |
| `TextService.findMissingLines` | 2 | `TextService.countLines`, `TextService.captureLine` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:74` |
| `TextService.validateDocument` | 2 | `TextService.findMissingLines`, `TextService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:113` |
| `TypescriptCommentsService.compareComments` | 2 | `TypescriptCommentsService.extractComments`, `TypescriptCommentsService.findIndex(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-comments.service.ts:46` |
| `TypescriptCommentsService.extractComments` | 2 | `TypescriptCommentsService.visit`, `TypescriptCommentsService.toSorted(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-comments.service.ts:87` |
| `TypescriptNodesService.readExpressionStatementKey` | 2 | `TypescriptNodesService.buildDottedName`, `TypescriptNodesService.readLiteralKey` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:98` |
| `TypescriptNodesService.countSubtree` | 2 | `TypescriptNodesService.reduce(…)`, `TypescriptNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:176` |
| `TypescriptTreeService.buildError` | 2 | `TypescriptNodesService.readKindLabel`, `TypescriptNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:44` |
| `TypescriptTreeService.compareBestCandidate` | 2 | `TypescriptTreeService.reduce(…)`, `TypescriptTreeService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:69` |
| `TypescriptTreeService.flatMap(…)` | 2 | `TypescriptTreeService.matchKind`, `TypescriptTreeService.matchKey` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:101` |
| `TypescriptTreeService.matchKey` | 2 | `TypescriptNodesService.readKey`, `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:144` |
| `TypescriptService.validateComments` | 2 | `TypescriptCommentsService.compareComments`, `TypescriptService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:75` |
| `TypescriptService.validateStructure` | 2 | `TypescriptTreeService.compareTree`, `TypescriptService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:107` |
| `DifferencesService.resolveDifferenceType` | 1 | `DifferencesService.find(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/differences/differences.service.ts:78` |
| `DifferencesService.resolveErrorLanguage` | 1 | `DifferencesService.find(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/differences/differences.service.ts:91` |
| `FilesService.countExpectedFiles` | 1 | `FilesService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/files/files.service.ts:78` |
| `ScoringService.sumWeights` | 1 | `ScoringService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/scoring/scoring.service.ts:53` |
| `JsonComparisonService.captureString` | 1 | `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:71` |
| `JsonComparisonService.combine` | 1 | `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:89` |
| `JsonComparisonService.map(…)` | 1 | `JsonComparisonService.captureString` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:117` |
| `JsonComparisonService.map(…)` | 1 | `JsonComparisonService.compare` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:158` |
| `JsonComparisonService.map(…)` | 1 | `JsonComparisonService.compareArrayItem` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:184` |
| `JsonComparisonService.reduce(…)` | 1 | `JsonComparisonService.countNodes` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:245` |
| `JsonComparisonService.reduce(…)` | 1 | `JsonComparisonService.countNodes` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:251` |
| `JsonComparisonService.formatPath` | 1 | `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:260` |
| `JsonComparisonService.pickClosestMatch` | 1 | `JsonComparisonService.reduce(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:289` |
| `JsonComparisonService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json-comparison.service.ts:290` |
| `JsonService.validateDocument` | 1 | `JsonComparisonService.compare` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/json/json.service.ts:39` |
| `JupyterNotebookService.readCellSource` | 1 | `JupyterNotebookService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:57` |
| `JupyterNotebookService.parseNotebook` | 1 | `JupyterNotebookService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter-notebook.service.ts:122` |
| `MarkdownNodesService.code` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:36` |
| `MarkdownNodesService.heading` | 1 | `MarkdownNodesService.readText` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:42` |
| `MarkdownNodesService.html` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:48` |
| `MarkdownNodesService.image` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:51` |
| `MarkdownNodesService.inlineCode` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:57` |
| `MarkdownNodesService.table` | 1 | `MarkdownNodesService.readColumnCount` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:69` |
| `MarkdownNodesService.tableRow` | 1 | `MarkdownNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:75` |
| `MarkdownNodesService.text` | 1 | `MarkdownNodesService.sameField` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:81` |
| `MarkdownNodesService.readColumnCount` | 1 | `MarkdownNodesService.readChildren` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:92` |
| `MarkdownNodesService.reduce(…)` | 1 | `MarkdownNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:160` |
| `MarkdownNodesService.filterNodes` | 1 | `MarkdownNodesService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:166` |
| `MarkdownNodesService.matches` | 1 | `MarkdownNodesService.capture` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-nodes.service.ts:177` |
| `MarkdownTreeService.captureFirst` | 1 | `MarkdownNodesService.capture` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:60` |
| `MarkdownTreeService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:124` |
| `MarkdownTreeService.findCandidates` | 1 | `MarkdownTreeService.filter(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:156` |
| `MarkdownTreeService.filter(…)` | 1 | `MarkdownNodesService.capture` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/markdown/markdown-tree.service.ts:157` |
| `PythonBridgeService.readLocations` | 1 | `PythonBridgeService.readNumber` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:86` |
| `PythonBridgeService.readValues` | 1 | `PythonBridgeService.readString` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:123` |
| `PythonBridgeService.map(…)` | 1 | `PythonBridgeService.toConformetryDifference` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python-bridge.service.ts:187` |
| `PythonService.validateDocument` | 1 | `PythonBridgeService.validatePythonSource` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/python/python.service.ts:38` |
| `JupyterService.attributeToCell` | 1 | `JupyterService.map(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:52` |
| `JupyterService.weighMissingCell` | 1 | `JupyterService.validateCell` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:140` |
| `JupyterService.map(…)` | 1 | `JupyterService.weighMissingCell` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:173` |
| `JupyterService.map(…)` | 1 | `JupyterService.validateCell` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/jupyter/jupyter.service.ts:188` |
| `TextService.captureLine` | 1 | `capturePlaceholderValues` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/text/text.service.ts:39` |
| `TypescriptNodesService.readDecoratorKey` | 1 | `TypescriptNodesService.buildDottedName` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:75` |
| `TypescriptNodesService.readNamedKey` | 1 | `TypescriptNodesService.isNode` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:143` |
| `TypescriptNodesService.reduce(…)` | 1 | `TypescriptNodesService.countSubtree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:177` |
| `TypescriptNodesService.readChildren` | 1 | `TypescriptNodesService.forEachChild(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-nodes.service.ts:183` |
| `TypescriptTreeService.map(…)` | 1 | `TypescriptTreeService.compareTree` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:74` |
| `TypescriptTreeService.reduce(…)` | 1 | `ScoringService.sumWeights` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:86` |
| `TypescriptTreeService.map(…)` | 1 | `TypescriptTreeService.compareChild` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript-tree.service.ts:186` |
| `TypescriptService.map(…)` | 1 | `TypescriptService.readLocation` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:81` |
| `TypescriptService.map(…)` | 1 | `TypescriptService.readLocation` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/typescript/typescript.service.ts:116` |
| `LanguagesService.validateDocument` | 1 | `TextService.validateDocument` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:80` |
| `LanguagesService.filter(…)` | 1 | `LanguagesService.some(…)` | `projects/ic-suite/conformetry/conformetry-languages/src/modules/languages/languages.service.ts:98` |

</details>
<!-- callidescope:end -->
