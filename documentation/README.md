NestJS CLI that refreshes the repository documentation from code. It also holds the documentation itself: `adr`, `agents`, `development`, `openwiki`, `planning`, and `research`.

## Start

```bash
nx run documentation:refresh-documentation
```

Needs the `OPENWIKI_*` and provider key environment variables OpenWiki reads. The 🧑‍🏫 Refresh Documentation workflow supplies them: a free OpenRouter model, with the key in the `OPENROUTER_API_KEY` repository secret.

## Test

```bash
nx run documentation:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run documentation:coinagerie-check:write`.

- **affirmation**: Generated phrase that the affirmations feature planning documents describe, produced by an LLM from tarot-card references.
- **band**: Horizontal strip of a meander drawing bounded by two borders, which ADR 0004 and ADR 0006 adjust for crossings and branch families.
- **border**: Edge of a meander band that ADR 0006 closes on both sides in the branch and parallel families through a MotifService hook.
- **breadth**: One of the two callidescope limits, alongside depth, that ADR 0006 keeps after dropping the other noise controls.
- **bundle**: Bundle-size measurement that ADR 0003 folds into codometer as a general change report, replacing the separate reporting module.
- **canonical**: Normalized form of a meander or its symmetry class, which ADR 0007 and ADR 0014 standardize addressing and phase around.
- **cascade**: Refers to the cascading dependents rule in ADR 0017, where a bump to one internal dependency republishes every package depending on it.
- **characteristic**: Named property of a meander, such as its letter counts, that ADR 0012 and ADR 0018 store together in one sparse JSON map.
- **corpus**: Committed historical set of meander drawings that ADR 0006 and ADR 0013 read as a test set for regression checks.
- **cut**: Seam where a meander band is split, which ADR 0006 and ADR 0013 use when comparing one drawing or family to another.
- **design**: Architectural design that an ADR records, or a rule like ADR 0002 that a pull request gate would fail every pull request by design.
- **domain**: Refers to CONTEXT.md and the domain model in agents domain documentation, the glossary of terms agents must use consistently.
- **ephemeris**: Astronomical position data that the caelundas performance plan generates year by year with local computation instead of HTTP calls.
- **family**: Meander classification group, such as the cross, branch, and parallel families whose drawing rules ADR 0004 and ADR 0006 adjust.
- **generation**: Refers to conformetry's generation package that renders code from templates, and the generation layer named in ADR 0013.
- **handoff**: Structured hand-off comment posted on a spec issue for the next session, whose repository rules agents handoffs documentation sets out.
- **historical**: Describes the historical meander corpus of committed drawings whose labels ADR 0012 and ADR 0013 treat as a test set.
- **interlace**: Woven over-and-under crossing pattern in meander drawings, which ADR 0004 breaks with a one-pitch gap at each crossing.
- **lattice**: Grid on which every meander sits, which ADR 0007 uses to address each drawing and MeanderLatticeService validates against.
- **law**: Governing rule in ADR 0011, the universal path and naming law that every project type follows for its file layout.
- **letter**: Glyph counted in each meander's letter-count map under ADR 0017, counted in all sixteen orientations for every meander.
- **meanderaw**: Meander drawing project whose cross, branch, and parallel families ADRs 0004 to 0006 change, producing the drawings in the corpus.
- **phase**: Names the canonical rotation of a meander in ADR 0014, chosen by minimizing seam components for each drawing in the corpus.
- **pipeline**: Generic meander pipeline of decode, render, compute Characteristics, and classify that ADR 0012 runs for every drawing.
- **pitch**: One grid unit on the lattice, which ADR 0004 uses to place the interrupted crossing break one pitch either side of the junction.
- **role**: Layer assignment of a package, which ADR 0013 documents so a reader learns its place without opening its index file.
- **statistic**: Per-project figure, such as the statistics block that ADR 0002 publishes in each project's README on the default branch.
- **swiss**: Short for Swiss Ephemeris, the local astronomy library that the caelundas performance plan uses instead of NASA Horizons HTTP calls.
- **triage**: Labels in agents triage-labels documentation map the status family to canonical roles for issues in this repository.
- **under**: Names the under-strand of a meander crossing, the strand that ADR 0004 breaks with a one-pitch gap at the junction.
- **wiki**: OpenWiki output under documentation openwiki that the refresh service regenerates from code, reached through the openwiki symlink.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-903-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-2.58_MB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-25-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-24-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-24-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-1-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-5-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-21-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-7-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-13-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-5-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-68-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-7-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-54-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-21-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-39-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-70-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-14-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-38-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-78-475569?style=flat-square)
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

![JSON Files](https://img.shields.io/badge/JSON_Files-38-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-7202-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-1526-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-493-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-3718-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-3116-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-35-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-1420-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-5176-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

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

![Module Files](https://img.shields.io/badge/Module_Files-2-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-1-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-1-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-2-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-1-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-6-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-0-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-118-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-21453-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-117-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-676-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-672-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-55-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-6043-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-970-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-4561-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-7-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-322-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-2359-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-670-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-22-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-279-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-14305-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-20-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-178-a16207?style=flat-square)
<!-- codometer:end -->
