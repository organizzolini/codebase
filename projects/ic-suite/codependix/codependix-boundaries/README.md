# 🚧 Codependix Boundaries

[![npm](https://img.shields.io/npm/v/@codependix/boundaries?logo=npm&label=npm)](https://www.npmjs.com/package/@codependix/boundaries)

**Evaluates declared rules against a graph codependix already built, and reports the edges and cycles that break them.**

Codependix draws graphs at three levels and says nothing about whether their
shape is allowed. This turns it from a documentation tool into a gate, at all
three levels — Nx project edges, NestJS module edges, and file-level import
edges, judged separately per language even though TypeScript and Python are
exported together as one `fileImports` graph type.

```bash
codependix map --check boundaries --config configuration/codependix.config.ts
```

## Why not an ESLint rule

`@nx/enforce-module-boundaries` reads import statements, one file at a time.
Three facts it structurally cannot see:

1. **Implicit edges.** An Nx `implicitDependencies` entry creates a
   project-graph edge with no import statement to flag. `NeighborhoodEdge`
   already carries `implicit`, so codependix holds a fact the lint rule has no
   way to reach.
2. **A NestJS module edge is a container fact, not a source fact.**
   `NestjsProjectService.exploreProject` reports what the container resolved,
   so a dynamic module, a `forRootAsync`, or a conditionally composed import
   produces an edge no `import` statement expresses.
3. **A rule can be about the graph rather than the edge.** A cycle, or a
   project's dependents, is a statement about a shape, and a rule that sees
   one file at a time cannot make one.

What this deliberately does **not** replace: the layered `depConstraints`
graph in
[`configuration/eslint.config.ts`](../../../configuration/eslint.config.ts), which
reports at the import site with a line number, and `dependency-cruiser`'s
`no-circular`, which is already this repository's file-cycle gate.

The two were checked against each other rather than assumed equivalent. All 32
of this repository's `depConstraints` translate mechanically —
`onlyDependOnLibsWithTags` is an `allow` rule, `notDependOnLibsWithTags` is a
`forbid` rule, and an empty `onlyDependOnLibsWithTags` is a `forbid` reaching
everything — and with `edges: { implicit: false }` all 32 pass, exactly as
ESLint reports them. Without that narrowing one more edge is reported:
`conformetry-examples → conformetry-cli`, declared by an `implicitDependencies`
entry with no import statement behind it. Its own `depConstraint` comment says
that dependency should not exist, and ESLint has nothing to flag. Whether that
is a finding or a false positive is the question `edges` exists to let a rule
answer.

## The rule model

Rules are declared in `codependix.config.ts`, keyed by the graph level that
judges them — `nestjsModules`, `nxProjects`, and `fileImports`, which nests by
language as `{ typescript, python }` since no edge ever crosses the two. A
level declaring no rule is never built at all, which is what keeps the gate
affordable: judging the NestJS level means booting every container in
preview mode.

Two shapes and three kinds — an access rule, written as `from`/`to` with the
verdict running one way or the other, and an `acyclic` rule scoped by `nodes`:

| Kind | Reports |
| ---- | ------- |
| `forbid` | An edge whose source matches `from` and whose target matches `to` |
| `allow` | An edge leaving `from` for anywhere `to` does not claim |
| `acyclic` | A cycle among the nodes `nodes` selects, defaulting to every node |

An access rule may also narrow **which edges** it judges, rather than which
nodes it selects:

| `edges` | Judges |
| ------- | ------ |
| unset | every edge — the stricter reading, and the right default for a rule about what a project may _depend on_ |
| `{ implicit: false }` | only edges backed by an import statement — exactly what an `@nx/enforce-module-boundaries` `depConstraint` sees |
| `{ implicit: true }` | only edges an `implicitDependencies` entry declares and no import backs |

Only the Nx level draws an implicit edge; every other level's edges are read as
explicit.

Each rule carries a `name` and, optionally, a `message` saying why it exists.
The message is **appended** to the generated sentence rather than replacing
it, so no wording a configuration chooses can cost a report the rule that
fired and both ends of what it fired on.

## Selectors

One node shape covers three vocabularies, and every field is a list of globs
matched with `path.matchesGlob`:

| Field | Matches | Available at |
| ----- | ------- | ------------ |
| `id` | The node's identifier — a project name, a file path, or a module class name | every level |
| `path` | A workspace-relative project root, or a project-relative file path | `nxProjects`, `fileImports.typescript`, `fileImports.python` |
| `project` | The Nx project a node belongs to | `nxProjects`, `fileImports.typescript`, `fileImports.python` |
| `tags` | The node's Nx tags; one tag matching is enough | `nxProjects` |

Every field a selector states must match — the fields narrow each other.
Within one field, one glob matching is enough. A selector naming a field its
level does not carry matches **nothing** rather than everything: a `path` rule
evaluated against a NestJS module graph, which carries no file paths, selects
no module instead of silently selecting all of them. A selector stating no
field at all is refused by the configuration schema, since it reads exactly
like a typo.

## The two halves, and the one seam between them

`src/modules/boundaries/` evaluates rules and knows nothing about workspaces: a
`BoundaryGraph` and a list of rules go in, and violations come out.
`src/modules/boundary-check/` is what turns a real workspace into those graphs
— one adapter per level, plus the orchestration around them.

`BoundaryGraph` is the seam, and it is deliberately not any of the four real
graph types. Each adapter flattens a `Neighborhood`, a `NestjsModuleGraph`, or
an import graph into it, so rule evaluation never sees `@nx/devkit`,
`@nestjs/core`, or `typescript` and could be lifted out again without
touching a rule.

`BoundaryCheckService.run` walks the four levels in `BOUNDARY_LEVEL_ORDER` —
cheapest first — and **skips any level with no declared rules before building
anything**. That is what keeps the gate affordable: judging the NestJS level
means booting every container in preview mode, and judging the TypeScript level
means building a `ts.Program` per project. A workspace declaring only Nx rules
pays for neither. Each level also isolates one project's failure to that
project, so a container that will not boot is collected as a
`BoundaryCheckFailure` while every other project is still judged.

Nothing here depends on `@codependix/cli` — the host calls in, never the
reverse — and a rule in `configuration/codependix.config.ts` says so, so the
two cannot close a cycle.

## Test

```bash
nx run codependix-boundaries:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run codependix-boundaries:coinagerie-check:write`.

- **acyclic**: Kind of boundary rule that forbids any cycle among the nodes its selector claims, reporting the full path.
- **ambient**: Prefix of ambientModuleNames, a NestJS project exploration field listing module names with no source file behind them.
- **anchor**: Named HTML comment block in a Markdown destination that codependix rewrites on each write, leaving the prose around it alone.
- **boundary**: Constraint a rule enforces on how projects may depend on one another, checked against every edge in the graph.
- **breadth**: Count of direct callees of one callable, which callidescope measures and limits with maximumBreadth.
- **bullet**: One list item in the boundary check's Markdown outcome report, holding a verdict in bold followed by its log line.
- **charge**: Which judged projects a violation or failure is attributed to, rendered as all judged projects or a comma list.
- **forbid**: Kind of boundary rule that names a dependency edge from one project to another which must not exist.
- **holder**: Project whose root directory contains a given file path, found by findProjectHolding for a failure's source file.
- **neighborhood**: Graph type showing one project's direct dependency neighbors, which boundary rules deliberately do not judge.
- **restrict**: Verb in no-restricted-imports, the ESLint rule that blocks importing @nx/devkit outside the nx-projects package.
- **selector**: Object naming which nodes a rule claims by project, tag, or dependency, evaluated by BoundarySelectorService.
- **shorthand**: Compact a-to-b notation the boundary unit tests use to write a graph's edges in one readable string.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-5930-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-274.48_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-6-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-40-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-6.08_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-40-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-20-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-1-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-12-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-145-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-12-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-13-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-12-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-248-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-126-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-302-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-72-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-211-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-167-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-49-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-260-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-773-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-160-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-37-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-12-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-98-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-89-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-43-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-145-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-5-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

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

![Module Files](https://img.shields.io/badge/Module_Files-3-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-9-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-3-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-3-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-12-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-0-7c3aed?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-4-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-1438-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-80-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-102-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-418-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-90-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-387-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-6-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-110-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-32-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-21-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-411-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
