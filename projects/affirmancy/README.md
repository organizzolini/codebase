# 🤲 Affirmancy

**Affirmations generated across every grammatical mood a language offers.**

A Python and Jupyter application that generates structured affirmations for
spiritual practices using LangChain, LangGraph, and a locally-hosted
`gemma4:e2b` model via Ollama. A LangGraph ReAct agent researches a subject
through SearxNG metasearch, and the model writes affirmations that are
validated against Pydantic models before being saved.

The interesting part is the grammar. Rather than producing a flat list of "I
am…" sentences, the pipeline enumerates moods, voices, tenses, aspects,
persons, numbers, polarities, and deixis — so a single subject yields
affirmations phrased as imperatives, optatives, subjunctives, and more.

## Requirements

- Python `>=3.11`
- [uv](https://docs.astral.sh/uv/) package manager
- Docker, for Ollama and SearxNG

The devcontainer provides Python 3.14.

## Setup

This application is a member of the uv workspace declared in
`configuration/pyproject.toml`, sharing
`configuration/uv.lock` and the root `.venv`. Sync from the
repository root and point uv at that workspace config.

```bash
uv sync --project configuration
```

## Quickstart

```bash
# 1. Start the local services
nx run affirmancy:ollama --configuration=start
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up

# 2. Pull the model (one-time download)
nx run affirmancy:ollama --configuration=pull-small   # gemma4:e2b

# 3. Open src/affirmancy.ipynb in VSCode and run the pipeline
#    (the notebooks raise an error naming `nx run infrastructure:searxng:up`
#    if SearxNG is not running)
```

## Project Structure

```text
projects/affirmancy/
├── src/
│   ├── affirmancy.ipynb     # Main generation pipeline
│   ├── semantics.ipynb      # Semantic exploration of subjects
│   ├── prices.ipynb         # Token accounting for a single run
│   ├── grammars.py          # Mood, Voice, Tense, Aspect, Person, Number,
│   │                        #   Polarity, Deixis, Form — and the Grammar model
│   ├── models.py            # Affirmation, GrammarAffirmations,
│   │                        #   SubjectAffirmations, ValidationResult
│   ├── prompts.py           # LangChain prompt templates
│   ├── subjects.py          # Subject and SubjectCategory definitions
│   └── output.py            # JSON and markdown writers
├── testing/                 # pytest suites, one per module
├── output/                  # Generated files (gitignored)
├── pyproject.toml
└── searxng.settings.yml
```

## Subjects

Subjects are declared in `src/subjects.py` as a `Subject` with a
`SubjectCategory`. The categories in place span tarot cards, Lenormand cards,
astrological signs, planets, nodes, asteroids, aspects and houses, modalities
and polarities, chakras, runes, sephiroth, Hebrew letters, kabbalistic worlds,
solfeggio frequencies, weekdays, and elements.

Adding a practice means adding its category and its subjects to that file —
nothing else in the pipeline needs to know about it.

## Grammar

`src/grammars.py` defines each grammatical axis as a `DescribedEnum`, so every
value carries its own description into the prompt. `Grammar` composes them into
one combination the model is asked to write in.

| Axis | Examples |
| ---- | -------- |
| `Mood` | indicative, imperative, optative, subjunctive, jussive |
| `Voice` | active, middle, passive |
| `Tense` | past, present, future |
| `Aspect` | perfective, imperfective, progressive, habitual |
| `Person` | first, second, third |
| `Number` | singular, dual, plural |
| `Polarity` | affirmative, negative |
| `Deixis` | proximal, medial, distal |
| `Form` | finite and non-finite forms |

## Nx Targets

| Target | Does |
| ------ | ---- |
| `ruff-lint` | Ruff linting |
| `ruff-format` | Ruff formatting |
| `pyright` / `ty` | Static type checking |
| `pytest` / `test-coverage` | Tests, with and without coverage |
| `vulture` | Dead code analysis |
| `bandit` | Security linting |
| `nbstripout` | Strip notebook outputs before commit |
| `spell-check`, `markdown-lint`, `yaml-lint` | Prose and configuration checks |
| `lint-codebase` | All of the above; `--configuration=write` to auto-fix |
| `ollama` | `start`, `stop`, `pull-small`, `pull-medium`, `pull-large` |

## Run tests

```bash
cd projects/affirmancy
uv run pytest
```

## Lint / format / typecheck

```bash
cd projects/affirmancy
uv run ruff check .
uv run ruff format .
uv run pyright
uv run ty check
uv run vulture src testing
uv run bandit -r src
```

## Services

| Service | Port | Purpose |
| ------- | ---- | ------- |
| Ollama | `11434` | Local LLM server (`gemma4:e2b`) |
| Open WebUI | `3001` | Browser-based chat interface for Ollama |
| SearxNG | `8889` | Self-hosted metasearch, aggregating 135+ engines |

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `SEARXNG_HOST` | `http://localhost:8889` | SearxNG server URL |

## Notes

- **CPU-only inference.** `gemma4:e2b` is the small variant deliberately —
  generation stays interactive without a GPU. `pull-medium` and `pull-large`
  fetch `gemma4:e4b` and `gemma4:e26b` when more capacity is worth the wait.
- **Model keepalive.** `OLLAMA_KEEP_ALIVE=10m` avoids reloading the model
  between cells.
- **Context budget.** `gemma4:e2b` has a 128k-token window, and research
  results are truncated to stay well inside it.
- **Notebook outputs are stripped** on commit by `nbstripout`, so a diff shows
  the code rather than the last run's results.

See [AGENTS.md](AGENTS.md) for the architecture, and the
[write-python skill](../../.agents/skills/write-python/SKILL.md) for the
workspace's Python tooling conventions.

## License

MIT — see [LICENSE](../../LICENSE).

## 👔 Conformetry

This project was generated from the [jupyter-notebook-application](../../configuration/conformetry-templates/jupyter-notebook-application) conformetry template.

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
_This project has no immediate Nx dependencies or dependents._
<!-- codependix:end name="codependix-nx-projects" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-4387-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-220.73_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-3-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-18-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-3-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-0-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-0-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-0-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-0-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-0-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-0-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-0-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-0-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-0-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-0-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-3-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-0-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-0-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-0-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-15-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-3485-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-19-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-83-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-121-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-52-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-74-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-23-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-74-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-23-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-23-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-3-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-69-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-34-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-1-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-49-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-20-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-0-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-1-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-4-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-56-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-1-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-364-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-1-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-20-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-5-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-97-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-262-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-173-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-4-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-1-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-96-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-12-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-56-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-16-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-11-64748b?style=flat-square)

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

![Module Files](https://img.shields.io/badge/Module_Files-0-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-0-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-0-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-0-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-0-ca8a04?style=flat-square)
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

![Notebooks](https://img.shields.io/badge/Notebooks-3-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-16-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-14-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-2-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-876-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-9-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-21-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-63-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-1-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-7-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-2-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-126-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-1028-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-5-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-104-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-6-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-0-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-17-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-2-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-16-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-2-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-7-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-0-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-2-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-39-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run affirmancy:coinagerie-check:write`.

- **abc**: Appears only inside the collections.abc import in testing/test_services.py, which supplies the Callable and Iterator types.
- **affirmation**: Pydantic model in src/models.py holding one generated sentence of text, which the output writer numbers into per-grammar lists.
- **aleph**: A Subject in the Hebrew Letter category, first in order, whose metadata carries the character alef.
- **analyze**: Verb in research prompts asking the model to distill search results, and in the analyze_sources notebook step.
- **angle**: Metadata key on astrology aspects giving the degree separation between two bodies, such as zero for a conjunction.
- **annotation**: Appears in no project source file, so the README glossary list is its only occurrence and it has no role.
- **aorist**: Deontic-group mood member in grammars.py for a single bounded event at a specific moment, viewed from outside as complete.
- **aspect**: Grammatical axis in grammars.py for how an event unfolds over time, distinct from the astrology aspect category.
- **asteroid**: Subject category in subjects.py for small bodies such as Ceres and Pallas, which a Greek mythology search source covers.
- **astrology**: Subject category family in subjects.py covering signs, planets, houses, aspects and asteroids of the horoscope tradition.
- **autocomplete**: SearxNG setting left empty, because the LangGraph agent generates queries, so no suggestion provider is used.
- **backend**: Packaging engine set in pyproject.toml, which packages the project as hatchling.build, the wheel builder.
- **ban**: Used in a SearxNG settings comment for the time window a failing search engine stays blocked before retrying.
- **benedictive**: Deontic-group value in grammars.py for a blessing directed at the addressee, a benefactive optative form.
- **bool**: Python boolean type used for ValidationResult.valid and as a member of the Primitive metadata type alias in subjects.py.
- **callable**: Annotation type in test_services.py for the serve fixture, which yields a callable that takes an int and returns a str.
- **captcha**: SearxNG settings comment describing an engine failing on a brief CAPTCHA page, then resuming after five seconds.
- **card**: Subject category in subjects.py named Tarot Card, whose 78 entries like The Fool feed the prompt pipeline.
- **category**: SubjectCategory model in subjects.py grouping subjects, whose slug names the output folder and whose name feeds prompts.
- **cf**: Latin abbreviation found in no source file here, only in the README glossary list, so it names nothing.
- **chakra**: Subject category in subjects.py for energy centres, each entry such as Root Chakra (Muladhara) is a practice subject.
- **chat**: Named in the service table for Open WebUI, the browser-based chat interface wrapping the local Ollama model.
- **cl**: Fragment with no source match in this project, so it is a tokenizer artifact and names nothing here.
- **classmethod**: Decorator stacked under field_validator on strip_trailing_periods in models.py, receiving the class not an instance.
- **commissive**: Deontic-group value in grammars.py for a speaker's promise or undertaking, beside benedictive and aorist.
- **conditional**: Irrealis-epistemic mood member in grammars.py using would with an if-premise, grouped with subjunctive and potential.
- **construction**: Used in grammars.py form descriptions for a grammatical structure, such as a marker phrase expressing epistemic doubt.
- **daemon**: Keyword argument daemon=True on a test thread that serves a stub HTTP server, so it exits with pytest.
- **debitive**: Deontic-group value in grammars.py for an action required by duty or obligation, not merely desired.
- **deixi**: Truncated stem of deixis, produced by stemming, that names nothing here since deixis is the real term.
- **deny**: English verb that no code or config in this project uses, so it names nothing in affirmancy.
- **dict**: Python mapping type annotated on LangGraph node returns in the notebooks and on the subject metadata field.
- **distal**: Spatial deixis member in grammars.py for referents away from the speaker, the third step of the scale.
- **dual**: Number member in grammars.py for exactly two subjects, a grammatical count English lacks as a separate form.
- **dubitative**: Irrealis-epistemic mood member in grammars.py for expressing doubt about a claim, beside presumptive and inferential.
- **dump**: Matches no project source file, so the README glossary entry is its only trace and it names nothing here.
- **element**: Subject category in subjects.py grouping elemental subjects, one of several categories the pipeline iterates over.
- **energetic**: Irrealis-epistemic mood member in grammars.py for an emphatic assertion with more force than a plain indicative, using do-support.
- **enumerate**: Python builtin used in notebooks and output.py to number affirmations and search results from one, with start=1.
- **episodic**: Other-group aspect value in grammars.py for events occurring as a series of separate episodes.
- **evaluate**: Appears only in a pyproject.toml comment noting that Pydantic evaluates annotations at class creation time.
- **ex**: Loop variable in semantics.ipynb that filters slugs against an exclude list, and in test_grammars for examples.
- **exception**: Python error caught around LLM retry calls in affirmancy.ipynb, logged with the attempt number before retrying.
- **exclusive**: Personal deixis value in grammars.py for the we-excluding first-person plural form that omits the listener.
- **existential**: Number member in grammars.py for a subject asserting the predicate applies to some unspecified subset of the group.
- **experiential**: Other-group aspect value in grammars.py for an event viewed as having been experienced, beside inceptive and terminative.
- **far**: Qualifier in grammars.py for the far-distal spatial deixis step, and for remote tense descriptions such as remote future.
- **fence**: Matches no code or config here, so it has no role and only appears in this glossary list.
- **flake8**: Lint tool name referenced only by the pyproject.toml section tool.ruff.lint.flake8-type-checking, configuring ruff's flake8 rules.
- **float**: Numeric type annotation on make_llm temperature and embedding vectors, and a Primitive union member in subjects.py.
- **fool**: Tarot Card subject at order zero in subjects.py, used as the worked example in tests and the prices notebook.
- **forever**: English adverb that no source file in this project contains, so it has no role in the pipeline.
- **fraction**: Metadata key on astrology aspects holding the harmonic ratio, such as 1/1 for conjunction or 1/6 for sextile.
- **future**: Tense value in grammars.py for events after the speaker's now, with near, remote and perfect future subdivisions.
- **gemstone**: Subject category in subjects.py for crystal and stone subjects, whose queries attract affiliate marketplace sites.
- **general**: Top-level key in searxng.settings.yml that holds instance-wide options such as debug and instance_name.
- **gerund**: Non-finite verb form enum in grammars.py listed beside infinitive, participle and supine, used as a Form value.
- **getresponse**: Method in services.py called on the HTTP connection to read the reply status from the SearxNG health probe.
- **getsockname**: Socket method in test_services.py that reports the port bound to the stub server, so tests can connect to it.
- **gnomic**: Other-group aspect value in grammars.py for timeless general truths or proverbs, beside habitual and episodic.
- **grammar**: Pydantic model in grammars.py combining one value from each grammatical axis into the combination the model writes in.
- **habitual**: Aspect member in grammars.py, in the Other group, for events that recur as a regular practice.
- **hatch**: Build tool named in pyproject.toml tool.hatch.build.targets.wheel, which sets the wheel packaging for affirmancy.
- **hebrew**: Subject category in subjects.py grouping Hebrew Letter subjects, with alef as the first in order.
- **high**: Part of the tarot subject name The High Priestess, and of a SearxNG comment about trusted encyclopedic sites.
- **hortative**: Directive-group mood form in grammars.py for exhortations to a first-person group, such as let us go.
- **house**: Lenormand card in subjects.py, distinct from the Astrology House category that lists chart sectors.
- **human**: Contrast term in SearxNG settings comments, since the LangGraph agent, not a person, issues every query.
- **immediate**: Temporal deixis value in grammars.py for the speaker's own moment, the origo, beside proximate and remote temporal.
- **imperative**: Directive-group mood member in grammars.py for direct commands to the addressee, with prohibitive as its negated counterpart.
- **imperfective**: Aspect group in grammars.py for events viewed from inside their unfolding, covering progressive, continuous and stative members.
- **inceptive**: Other-group aspect value in grammars.py for an event viewed at its beginning, beside terminative and experiential.
- **inclusive**: Personal deixis value in grammars.py for the we-including first-person plural form that includes the listener.
- **indicative**: Default unmarked mood in grammars.py for stating a plain fact, also the mood of the minimal test grammar.
- **inferential**: Irrealis-epistemic mood member in grammars.py for a claim drawn from evidence, beside dubitative and presumptive.
- **infinitive**: Form member in grammars.py for the non-finite infinitive, listed beside gerund, participle and supine.
- **ini**: Stray token matching no file here, likely cut from a longer word, so it names nothing in affirmancy.
- **interpreter**: Matches no code here; the project's actual runtime is Python 3.11 or newer, managed by uv.
- **interrogative**: Irrealis-epistemic mood member in grammars.py for questions, grouped with subjunctive, conditional and potential.
- **ipynb**: Notebook file extension of affirmancy, semantics and prices, linted by ruff through extend-include in pyproject.toml.
- **isinstance**: Python builtin used in tests to check a value is a str or a SystemMessage or HumanMessage prompt message.
- **iterator**: Type annotation in test_services.py for the serve fixture, which yields a callable for the test to use.
- **jussive**: Directive-group mood member in grammars.py for a third-person command aimed at a party other than the speaker.
- **kabbalah**: Subject category in subjects.py for Kabbalistic worlds, a theme SearxNG also covers with dedicated engine sources.
- **kebab**: Naming style in grammars.py for the lowercase hyphenated slug built from a grammar's specified fields, without emoji.
- **lang**: Fragment with no source match here; the real dependency name is langchain, listed in pyproject.toml.
- **langchain**: Python library pinned in pyproject.toml, supplying the prompt templates and LCEL chains that prompts.py builds.
- **large**: Number member in grammars.py for a large, abundant number of subjects, which English expresses only with large-quantity quantifiers.
- **len**: Python builtin counting items in the notebooks and tests, such as affirmations, subjects and the length check against MAX_CHARS_PER_SOURCE.
- **lenormand**: Card deck name used as a subject category in subjects.py, whose 38 cards include House and Letter.
- **letter**: Lenormand card entry in subjects.py, separate from the Hebrew Letter category of alphabet characters.
- **limiter**: Setting key in searxng.settings.yml that is false, disabling SearxNG's request rate limiter for this agent-only instance.
- **low**: Adjective in searxng.settings.yml comments, as in a request timeout too low for slow engines, or low-quality content.
- **many**: Quantifier word in SearxNG comments about content farms surfacing across spiritual searches, and in a Number docstring.
- **mark**: Pytest namespace whose unit and integration decorators tag each test file's tests, as in testing/test_grammars.py.
- **marker**: Grammar description term in grammars.py for a modal or irrealis cue, and also the py.typed file in src.
- **medial**: Spatial deixis member in grammars.py for referents at a perceptible, non-immediate distance, the middle step of the scale.
- **medium**: Ollama pull target in project.json for the mid-size model, and part of the Tenth House subject name Medium Coeli.
- **metal**: Subject category in subjects.py for metals, one of many practice categories the pipeline generates affirmations for.
- **minimal**: Grammar built with only a mood set, shown in the Grammar docstring and as a minimal test fixture.
- **modality**: Subject category in subjects.py grouping possibility and necessity subjects that the grammars express.
- **monkey**: Partial token of the pytest fixture name monkeypatch, which test_output.py uses, so it has no standalone role.
- **monkeypatch**: Pytest fixture in test_output.py that redirects PROJECT_DIRECTORY to a temporary path so output files land there.
- **mood**: Grammar axis in grammars.py for the speaker's attitude toward a proposition, such as indicative or optative.
- **near**: Tense qualifier in grammars.py for events close to now, such as the near future or near past.
- **necessitative**: Deontic-group value in grammars.py for an action presented as required or unavoidable, not merely desired.
- **negative**: Polarity member in grammars.py for a proposition that is denied, also a subject under the Polarity category.
- **netloc**: Attribute of a parsed URL in services.py holding host and port, which the SearxNG connection is built from.
- **nonfuture**: Cross-cutting tense member in grammars.py for events that are present or past rather than future.
- **nonpast**: Cross-cutting tense member in grammars.py for events that are present or future rather than past.
- **optative**: Mood member in grammars.py for expressing a wish or hope, listed under the Volative group.
- **outgo**: Stray token in the glossary alone, matching no file here, so it has no role in the affirmancy codebase.
- **parametrize**: Pytest decorator in test_services.py and others that runs one test body across several status codes such as 403, 404, 500.
- **participle**: Non-finite Form member in grammars.py for a verbal adjective, listed beside infinitive, gerund and supine.
- **passive**: Voice member in grammars.py for a subject that receives the action, alongside active and middle.
- **past**: Tense value in grammars.py for events before the speaker's now, with recent, remote and pluperfect subdivisions.
- **pathlib**: Standard library module imported in output.py and tests to build output directory paths.
- **paucal**: Number member in grammars.py for a small, limited count of subjects, English has no dedicated form so it uses small-quantity words.
- **perfect**: Tense subdivision in grammars.py such as future perfect, for an event completed before a reference point in time.
- **perfective**: Completeness-group value in grammars.py for an event viewed as a whole, beside the simple aspect.
- **period**: Punctuation mark named in prompts.py as forbidden at the end of each generated affirmation sentence.
- **permissive**: Deontic-group value in grammars.py for a form that licenses an action, such as I am allowed to.
- **person**: Axis in grammars.py for first, second or third person, which every generated affirmation must conform to.
- **planet**: Astrology subject category in subjects.py for the bodies whose meanings the pipeline turns into affirmations.
- **pluperfect**: Past-group tense value in grammars.py for an event completed before another past reference point.
- **plural**: Number member in grammars.py for more than one subject, plus the inflect call pluralizing category names in notebooks.
- **polarity**: Grammatical axis in grammars.py recording whether a proposition is affirmed or negated, plus a subject category.
- **potential**: Irrealis-epistemic mood member in grammars.py for what might happen, grouped with conditional and interrogative, and part of a rune subject name.
- **precative**: Deontic-group value in grammars.py for a petitionary speech act such as a prayer or earnest entreaty.
- **predefined**: Describes the subjects and grammars declared in subjects.py and grammars.py, though the word itself appears in no source.
- **presumptive**: Irrealis-epistemic value in grammars.py for a claim assumed true on likely grounds, beside dubitative and inferential.
- **price**: Found only in the prices.ipynb filename, the pricing research notebook that tallies token cost of one run.
- **primitive**: Type alias in subjects.py for scalar metadata values, limited to str, int, float, bool or None.
- **priority**: Stray generic English noun matching no code in this project, so it names nothing here at all.
- **progressive**: Imperfective-group value in grammars.py for an event in progress at the reference time, such as continuous action.
- **prohibitive**: Directive-group value in grammars.py for a negated command with an implied second-person subject, such as do not go.
- **prospective**: Other-group aspect value in grammars.py for an event looking forward to imminent occurrence.
- **proximal**: Spatial deixis member in grammars.py for referents near the speaker, the first step of the proximal-to-far scale.
- **proximate**: Temporal deixis value in grammars.py for an event near the speaker's moment, paired with immediate and remote temporal.
- **py**: Python file suffix seen in py.typed, pyproject.toml and the notebook file_extension metadata value .py.
- **pydantic**: Python validation library whose BaseModel classes in models.py, grammars.py and subjects.py validate output before saving.
- **pyproject**: Package configuration file in the affirmancy folder, which extends the root config and sets ruff and pytest options.
- **re**: Python regular expression module imported in output.py and notebooks, and a solfeggio subject named Re.
- **reachable**: Part of the error message in services.py saying SearxNG is not reachable when its connection check fails.
- **recaptcha**: Matches no code or config here, so the Google bot-check service it names plays no role in affirmancy.
- **recent**: Past-group tense value in grammars.py for an event just before now, such as the recent past.
- **reproducible**: Build option in pyproject.toml set to true, so identical inputs produce identical wheels.
- **roundtrip**: Stemmed fragment of round-trip, which no project source names, so it has no role in affirmancy.
- **rstrip**: Python string method in models.py that strips trailing periods from each affirmation text in a validator.
- **rune**: Subject category in subjects.py for runes such as Ingwaz, whose divinatory meanings get dedicated search sources.
- **runtime**: Execution-time behavior the pyproject protects: pydantic.BaseModel field-type imports must stay real imports, not TYPE_CHECKING-only.
- **scheme**: Protocol half of the SearxNG host URL, read by services.py to pick an HTTP or HTTPS connection class.
- **searx**: The Python package name inside the SearxNG image, as in the searx.plugins.hostnames plugin path in searxng.settings.yml.
- **self**: The speaker's own person in grammar descriptions, where affirmations address the self, another, or beyond the self.
- **send**: Verb the HTTP stub in test_services.py uses through send_response and send_header to answer with fake SearxNG statuses.
- **sephiroth**: Subject category of the ten kabbalistic emanations, Kether through Malkuth, that subjects.py declares as _SEPHIROTH.
- **serialization**: How every Pydantic model is written out: model_dump_json(indent=2), turning affirmation models into the JSON files under output/.
- **setattr**: Monkeypatch call in the tests that swaps output_module's PROJECT_DIRECTORY and OUTPUT_DIRECTORY for temporary paths.
- **shortcut**: The SearxNG engine key, such as ws, ol, or wp, that lets a query target one engine directly from searxng.settings.yml.
- **simple**: Aspect member in grammars.py for a plain, unmarked action, the default value when no progressive or perfect marking applies.
- **singular**: Number member in grammars.py for one referent, one of the core values beside plural and dual.
- **slug**: Kebab-case identifier that Grammar.slug builds from specified fields only, which Subject and SubjectCategory also carry for output filenames.
- **small**: Model size tier naming gemma4:e2b, the deliberately small CPU-friendly variant fetched by the pull-small Ollama target.
- **sock**: Local variable name for a bound socket in test_services.py, used to reserve a free ephemeral port for a stub SearxNG server.
- **socket**: Python standard-library module imported by test_services.py to bind a free localhost port for a fake SearxNG server.
- **solfeggio**: Subject category of seven tones, Do through Ti, whose frequencies and chakra associations supply affirmation subjects in subjects.py.
- **speculative**: Mood member in grammars.py for conjecture, presenting an affirmation as a guess about what might be true.
- **startswith**: String method the tests call on PRESENT.name to check that the emoji prefix, a star, leads the grammar's display name.
- **staticmethod**: Decorator on DescribedEnum.create in grammars.py, letting the enum factory build members without an instance.
- **stative**: Aspect member in grammars.py for states that persist without change, rather than actions in progress or completed.
- **still**: English adverb the grammar templates use for continuation, as in I am still and I was still examples, marking unbroken ongoing states.
- **str**: Python's built-in string type, used in Pydantic models, Subject names, and LangGraph state annotations such as NotRequired str fields.
- **sub**: Regular-expression substitution calls in output.py and the notebook that strip Markdown code fences and punctuation from affirmation text.
- **subheading**: Heading below a section title in generated Markdown, which the prompts ban because model replies must be plain flowing prose.
- **subjunctive**: Mood member in grammars.py for wishes, doubts, and hypotheticals, one of the Mood values listed in the README.
- **superplural**: Number member in grammars.py for a large, abundant group of referents, which English must express lexically since it has no grammatical form.
- **supine**: Non-finite Form member in grammars.py, listed beside infinitive, gerund, and participle as one of four non-finite forms.
- **suspend**: SearxNG setting for how long a failing engine stays out of rotation; the settings file shortens it so dev engines recover faster.
- **sxng**: Shorthand for SearxNG, the self-hosted metasearch service on port 8889 that the research agent queries for sources.
- **tarot**: Subject category of arcana cards, such as Wheel of Fortune, declared as _TAROT_CARD in subjects.py for card affirmations.
- **temporal**: Deixis value marking time rather than place in grammars.py, such as PROXIMATE_TEMPORAL and REMOTE_TEMPORAL for near or distant events.
- **terminative**: Aspect value in grammars.py for an action that reaches its end, listed with inceptive and experiential aspects.
- **testpath**: Pytest path to the testing/ folder, which holds one suite per module and runs through the uv pytest target.
- **third**: Person value for a referent other than the speaker or addressee, used by third-person directive forms in grammars.py.
- **thread**: Background worker in test_services.py that runs the stub SearxNG server's serve_forever loop as a daemon.
- **tmp**: Temporary directory that test_output.py substitutes for the real output folder through pytest's tmp_path fixture.
- **too**: Adverb used in searxng.settings.yml comments to justify raising request_timeout from its 2.0 default to 8.0 seconds.
- **trail**: Word stem inside strip_trailing_periods in models.py, which removes final periods from each generated affirmation.
- **triple**: Number member in grammars.py for exactly three referents, one of the extended values beside paucal, universal, and superplural.
- **tuple**: Six-string fixed-length sequence type that DescribedEnum uses for each member's examples in grammars.py.
- **universal**: Number member in grammars.py for a quantifier applying to every member of a set without exception, such as all or every.
- **unreachable**: Failure state the SearxNG probe in services.py raises when a connection is refused, times out, or cannot resolve.
- **urllib**: Standard-library parsing package imported by services.py to split the configured SearxNG host into its parts.
- **urlsplit**: Parser that services.py applies to the SEARXNG_HOST value to read its scheme, network location, and path.
- **validator**: Role line in prompts.py telling the model to act as a grammar or subject-relevance validator that rejects off-target affirmations.
- **venv**: Python virtual environment directory, .venv, that uv creates for the affirmancy workspace and VS Code selects as its interpreter.
- **voice**: Grammar axis of active, middle, or passive, a DescribedEnum in grammars.py whose value is folded into each Grammar combination.
- **weekday**: Subject category of the seven days Monday through Sunday, declared as _WEEKDAY in subjects.py and used for output filenames.
- **weight**: SearxNG engine ranking multiplier, set to 2.0 for specialist engines so their hits outrank general web results.
- **wheel**: Tarot card subject for the Fortune card, declared in subjects.py with order 10 among the tarot cards.
- **whitelist**: Vulture exemption file, .vulture_whitelist.py, listing dead-code names to keep; affirmancy currently needs no entries in it.
- **world**: Subject category of the four Kabbalistic realms, Atziluth through Assiah, declared as _KABBALAH_WORLD in subjects.py.

<!-- coinagerie:end -->
