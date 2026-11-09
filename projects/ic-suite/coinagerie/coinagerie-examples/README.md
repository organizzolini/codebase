# 🪙 Coinagerie Examples

**Small invented multi-language projects, one per thing coinagerie does.**

Coinagerie lists the words a codebase uses and keeps a glossary of them in
step with the code. Reading about folding, layered glossaries, or a `--check`
that refuses to run is slower than trying them against something small enough
to hold in your head.

This package is that something. Every project is invented — none is copied
from this repository — and every command in every guide is runnable. A test
asserts each glossary and each failure message, so a guide that drifts from the
tool fails a check rather than misleading you.

```bash
nx run coinagerie-examples:examples   # run every example, gate on the exit code its guide promises
nx run coinagerie-examples:vitest     # assert every glossary and message below
```

Agents arriving from a coinagerie failure should start at
[AGENTS.md](AGENTS.md), which maps "coinagerie said X" to the example that
explains X.

## The examples

Each directory under [`examples/`](examples) is one example. It holds a
`README.md` guide and a `project/` folder, the small codebase the guide runs
coinagerie over. Read them in this order for a walkthrough; jump straight in
for an answer. Every command starts from `cd examples/<name>/project`, because
the folder a run starts in is the folder it scans unless `--config` names a
file elsewhere.

| Example | Answers |
| ------- | ------- |
| [zero-config](examples/zero-config/README.md) | What does `coinagerie` do in a folder with no configuration? |
| [exclusions](examples/exclusions/README.md) | How do I leave files and words out? |
| [exclusion-patterns](examples/exclusion-patterns/README.md) | How do I leave out a whole family of words, such as plan IDs? |
| [folding](examples/folding/README.md) | How do `aspects` and `aspect` become one entry, and `configuration` and `configure`? |
| [layered-glossaries](examples/layered-glossaries/README.md) | How does a package avoid redefining the root's words? |
| [outputs](examples/outputs/README.md) | How do I write markdown and JSON, and what does `--write` keep? |
| [check-failures](examples/check-failures/README.md) | Why did `--check` fail, and what does each message mean? |

## The fixtures

A guide's `project/` folder is the fixture: a few files, a handful of words,
small enough to count by hand. A guide quoting "four words" is only worth
reading if you can check.

- Nothing in a fixture is meant to be good code. Every file exists to be read
  for its words, and the polyglot and check-failure sources carry words in
  comments and strings that have to stay out of the glossary.
- The `coinagerie` command line is also run against these fixtures by its own
  end-to-end suite, in [coinagerie-cli](../coinagerie-cli), so a change to a
  fixture is a change to that suite.

## Layout

```text
coinagerie-examples/
├── examples/
│   └── <name>/
│       ├── README.md                  the guide for this example
│       └── project/                   the fixture the guide runs coinagerie over
└── testing/
    ├── coinagerie.ts                  the command-line driver every test goes through
    ├── runs.ts                        every documented command and the exit code its guide promises
    ├── run-examples.ts                the `examples` target's runner
    └── examples.integration.test.ts   the glossaries and messages the guides quote
```

- Every run happens in a staged copy under this package's gitignored `tmp/`,
  never in the committed fixture and never in the system temporary directory:
  a copy outside the workspace breaks the swc register hook on a Linux runner.
- There is no `src/`. Every line of TypeScript outside `examples/` is a test or
  the harness that runs one, which is why the package declares no `build`
  target and measures no coverage.

## Test

```bash
nx run coinagerie-examples:vitest
```

## License

MIT — see [LICENSE](../../../../LICENSE).

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run coinagerie-examples:coinagerie-check:write`.

- **gap**: Problem lines run-examples prints when the check-failures table disagrees with its configurations on disk, failing the examples run.
- **glossary**: The coinagerie markdown or JSON mapping of words to definitions that each example's check compares with its project's code.
- **perigee**: The point of an orbit nearest the body it circles, a planner term the outputs example defines in its markdown block.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-978-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-52.57_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-34-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-37-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-36-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-3-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-25-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-2-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-5-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-3-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-56-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-1-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-56-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-1-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-68-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-23-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-28-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-55-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-108-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-1-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-3-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-1-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-1-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-1-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-5-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-106-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-29-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-10-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-76-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-60-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-2-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-4-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-24-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-105-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-5-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-1-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-4-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-1-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-2-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-2-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-3-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-1-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-3-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-1-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-4-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-1-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-1-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-1-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-1-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-3-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-1-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-1-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-1-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-1-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-3-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-1-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-1-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-1-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-1-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-5-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-1-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-1-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-1-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-1-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-1-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-5-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-1-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-1-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-1-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-1-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-0-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-3-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-0-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-0-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-1-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-1-7c3aed?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-17-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-508-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-11-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-36-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-2-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-103-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-14-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-60-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-3-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-28-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-48-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-12-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-252-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
