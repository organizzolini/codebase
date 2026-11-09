# 🕸️ Codependix Examples

**Twenty-one small subjects built to be graphed, so every graph codependix draws
has somewhere to point.**

Codependix draws dependency graphs at four levels — the Nx Neighborhood, the
whole-workspace Workspace Graph, a NestJS container's module graph, and a
project's own TypeScript and Python file-level import graphs. Almost none of
that has ever been written down: everything a reader needs to know about
`include`/`exclude` matching a project's root as well as its name, about a
per-project override _replacing_ rather than merging with `defaults`, about the
`@Global()` heuristic that redraws a NestJS graph, or about why `--write`
auto-creates a section it once refused to, lived only in a JSDoc comment on the
type that implements it.

This package is where all of it is stated. Nothing here is meant to be good
code: every subject exists to make one rule, one refusal, or one graph visible,
and several are deliberately broken. Each example's `README.md` is **rendered by
the real graph builders** from the subject beside it, so a reader sees the shape
without running anything — and a claim that stops being true fails a check
rather than misleading somebody.

```bash
nx run codependix-examples:examples          # check the committed guides
nx run codependix-examples:examples:write    # regenerate them
nx run codependix-examples:vitest            # assert every claim below
```

Agents arriving from a codependix export should start at [AGENTS.md](AGENTS.md),
which maps "codependix said X" to the example that explains X.

## The examples

Each directory under [`examples/`](examples) is one example, carries its own
`README.md`, and is readable on its own. The subject it graphs sits in that same
directory.

Every guide is **rendered**, so each one opens with the same `## Run it` command
and closes with a `## Next` link — the reading order below is the same list the
renderer chains them with, declared once in
[`testing/render/reading-order.ts`](testing/render/reading-order.ts).

### The four levels

| Example | What it settles |
| ------- | --------------- |
| [`graph-levels`](examples/graph-levels) | One project graphed at all four levels, so a reader sees what each does and does not say about the same code |
| [`neighborhood-scope`](examples/neighborhood-scope) | A Neighborhood is one hop each way — plus implicit edges, self-edges, external packages, the root project, the subject highlight |
| [`ambient-modules`](examples/ambient-modules) | Why a `@Global()` module is drawn without edges, and the two places the rule stops firing |
| [`preview-mode`](examples/preview-mode) | A `forRootAsync` options factory graphed without ever running |
| [`container-rooting`](examples/container-rooting) | A real root module, a synthetic one, and one that refuses to load |
| [`typescript-resolution`](examples/typescript-resolution) | NodeNext specifiers, path aliases, `extends` chains — and the four statements that draw nothing |
| [`python-scanner`](examples/python-scanner) | Every case the hand-rolled scanner handles, and every case it deliberately refuses |

### Configuring and exporting

| Example | What it settles |
| ------- | --------------- |
| [`configuration-resolution`](examples/configuration-resolution) | `defaults` versus an override, the glob lists, the named file versus its neighbor |
| [`export-targets`](examples/export-targets) | Why `both` is a named target rather than something inferred |
| [`markdown-modes`](examples/markdown-modes) | An anchored splice, and a standalone file |
| [`auto-created-sections`](examples/auto-created-sections) | Exactly where a missing `<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codependix-examples:coinagerie-check:write`.

- **ambient**: Modules marked global that codependix registers implicitly into containers, judged by inbound edge counts in the ambient-modules fixtures.
- **anchor**: The named comment block in a Markdown README where codependix writes its graph, placed by the anchor-placement examples.
- **attribution**: How a boundary finding is assigned to the projects it blames, rendered in the boundary-attribution examples.
- **boundary**: Declared rules judged against each graph, with rendered examples showing which edges and cycles fail a check.
- **charge**: Assigns a boundary finding to the projects it blames, so a cycle fails every project on it even when only one was named.
- **creation**: The rule that fills in a missing anchor or section during a write, instead of refusing to run.
- **exploration**: The outcome recorded for one NestJS container explored from its root module, either explored or failed.
- **forbid**: A boundary rule kind that bans edges from one selector to another, with each violation charged to the edge's source.
- **hand**: Marks a section a person wrote by hand, which anchor-placement must leave alone when it writes a generated block.
- **inventory**: A NestJS module fixture imported by several container and graph-level example projects.
- **neighborhood**: One-hop view of a project's direct dependencies and dependents, rendered as the Nx Neighborhood section.
- **placement**: Where an anchor block lands in a file: appended, placed under a heading, or auto-created, as the anchor-placement examples show.
- **refusal**: The message an invalid configuration or command line produces, reproduced by the refusals example.
- **restrict**: No codependix meaning here; the only use is an ESLint no-restricted-imports rule in this project's config.
- **scenario**: One boundary-attribution case: a fixed workspace plus the run arguments that point codependix at a set of projects.
- **selector**: A boundary rule endpoint that matches nodes by id, path, project, or tags, with at least one field required.
- **self**: A node's edge to itself, which the neighborhood-scope example counts and renders apart from ordinary dependencies.
- **sibling**: A module imported from the same package directory, such as sibling.py imported by main.py in the Python fixture.
- **subheading**: An optional ### heading placed above an anchor block, such as Nx Neighborhood, or omitted for the workspace README.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-5527-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-280.80_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-72-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-91-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-76-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-16-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-29-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-275-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-1-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-3-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-19-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-27-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-295-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-3-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-207-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-91-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-257-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-211-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-163-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-368-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-641-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-15-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-53-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-1-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-4-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-9-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-12-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-4-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-4-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-1-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-1-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-16-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-291-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-67-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-30-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-171-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-126-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-19-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-56-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-243-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-1-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-4-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-1-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-3-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-3-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-4-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-4-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-27-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-1-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-0-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-0-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-0-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-3-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-0-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-23-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-1914-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-22-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-143-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-5-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-196-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-17-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-7-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-58-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-72-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-103-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-491-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
