---
type: application
title: Affirmancy — Affirmation Generation Pipeline
description: Python LangGraph ReAct agent that researches spiritual subjects via SearxNG, generates affirmations across 9 grammatical axes using gemma4:e2b via Ollama, validates with Pydantic, and writes JSON/markdown output.
tags: [affirmancy, langgraph, ollama, searxng, pydantic, spiritual-practices, affirmations]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-834d9e55d27cecb197701e79
    resource: repo://projects/affirmancy/AGENTS.md
  - id: openwiki-source-aa414ec11f49c0bd0511815c
    resource: repo://projects/affirmancy/project.json
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
  - id: openwiki-source-e6649d4abfe6e57dbc354632
    resource: repo://projects/affirmancy/searxng.settings.yml
  - id: openwiki-source-de400b0e93cead15077457ba
    resource: repo://projects/affirmancy/src/affirmancy.ipynb
  - id: openwiki-source-a2f679f5203c524c717c7b87
    resource: repo://projects/affirmancy/src/grammars.py
  - id: openwiki-source-1771f433d84267eb4771d6b3
    resource: repo://projects/affirmancy/src/output.py
  - id: openwiki-source-52fc6fd40a69feb907bfd8d5
    resource: repo://projects/affirmancy/src/services.py
  - id: openwiki-source-9063c56ca99ca84dfa88de67
    resource: repo://projects/affirmancy/src/subjects.py
  - id: openwiki-source-29bc3185c9e8810f2d6f2941
    resource: repo://projects/affirmancy/testing/test_services.py
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---

# Affirmancy — Affirmation Generation Pipeline

**Affirmancy** is a Python application that generates structured affirmations for spiritual practices (tarot, Lenormand, astrology, chakras, runes, kabbalah, solfeggio, and more). It uses a **LangGraph ReAct agent** to research each subject through a self-hosted **SearxNG** metasearch instance (aggregating 135+ engines including Wikipedia, DuckDuckGo, Google Scholar, ArXiv, and domain-specific spiritual sources), then generates affirmations across a full grammatical mood system using a local **gemma4:e2b** model via **Ollama**. All output is validated against **Pydantic** models before being written as JSON and Markdown files.

## Architecture Overview

```mermaid
flowchart TD
    subgraph Pipeline[Affirmancy Pipeline]
        direction TB
        Subject[Subject Selection] --> Search[SearxNG Metasearch]
        Search --> Extract[Trafilatura Extraction]
        Extract --> DocGen[Generate Reference Document]
        DocGen --> Analyze[Analyze Document]
        Analyze --> GenAff[Generate Affirmations per Grammar]
        GenAff --> ValGram[Validate Grammar]
        ValGram --> ValSubj[Validate Subject Relevance]
        ValSubj --> Write[Write JSON + Markdown]
    end

    subgraph Services[External Services]
        Ollama[(Ollama: gemma4:e2b)]
        SearxNG[(SearxNG Metasearch)]
        OpenWebUI[Open WebUI]
    end

    Search -.-> SearxNG
    GenAff -.-> Ollama
    ValGram -.-> Ollama
    ValSubj -.-> Ollama
```

### Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **LLM** | `ChatOllama` → `gemma4:e2b` | Local inference, 128k context window |
| **Agent Framework** | LangGraph `StateGraph` | Orchestrates research → generation → validation |
| **Research Tool** | SearxNG (self-hosted) | Metasearch across 135+ engines with hostname boosting for spiritual sources |
| **HTML Processing** | Trafilatura | Extracts clean text from search results |
| **Validation** | Pydantic v2 + LLM-as-judge | Structural + semantic validation of generated text |
| **Output** | JSON + Markdown | Structured files organized by practice category |

### Service Dependencies

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Ollama** | `11434` | `http://localhost:11434` | Local LLM server hosting `gemma4:e2b` |
| **Open WebUI** | `3001` | `http://localhost:3001` | Browser chat interface for Ollama |
| **SearxNG** | `8889` | `http://localhost:8889` | Metasearch engine with hostname boosting for spiritual sources |

Environment variables:
- `OLLAMA_HOST` (default: `http://localhost:11434`)
- `SEARXNG_HOST` (default: `http://localhost:8889`)

## Grammar System — 9 Axes as `DescribedEnum`

The grammar system is the distinctive feature of Affirmancy. Rather than producing flat "I am…" sentences, the pipeline enumerates **9 grammatical axes**, each modeled as a `DescribedEnum` that carries its own generation instruction and usage examples into the prompt. These compose into a `Grammar` model that the LLM is asked to write in.

### Axis Definitions (in `src/grammars.py`)

| Axis | Type | Values | Description |
|------|------|--------|-------------|
| **Form** | `Form` | FINITE, INFINITIVE, GERUND, PARTICIPLE, SUPINE (5 values) | Finite vs. non-finite verb forms |
| **Mood** | `Mood` | INDICATIVE, SUBJUNCTIVE, CONDITIONAL, INTERROGATIVE, POTENTIAL, DUBITATIVE, PRESUMPTIVE, ENERGETIC, INFERENTIAL, SPECULATIVE, IMPERATIVE, PROHIBITIVE, JUSSIVE, HORTATIVE, OPTATIVE, COMMISSIVE, BENEDICTIVE, AORIST, DEBITIVE, PRECATIVE, PERMISSIVE, NECESSITATIVE (21 values) | Speaker's attitude toward the proposition (realis vs. irrealis, epistemic vs. deontic) |
| **Voice** | `Voice` | ACTIVE, PASSIVE (2 values) | Relationship between subject and verb |
| **Tense** | `Tense` | PAST, RECENT_PAST, REMOTE_PAST, PLUPERFECT, NONPAST, NONFUTURE, PRESENT, FUTURE, NEAR_FUTURE, REMOTE_FUTURE, FUTURE_PERFECT, FUTURE_IN_THE_PAST (12 values) | Temporal location of the event |
| **Aspect** | `Aspect` | SIMPLE, PERFECTIVE, IMPERFECTIVE, PROGRESSIVE, CONTINUOUS, STATIVE, HABITUAL, PROSPECTIVE, GNOMIC, EPISODIC, INCEPTIVE, TERMINATIVE, EXPERIENTIAL, PERFECT_PROGRESSIVE (14 values) | Internal temporal structure |
| **Person** | `Person` | FIRST, SECOND, THIRD (3 values) | Grammatical person of the subject |
| **Number** | `Number` | SINGULAR, PLURAL, DUAL, TRIPLE, EXISTENTIAL, UNIVERSAL, PAUCAL, SUPERPLURAL (8 values) | Grammatical number |
| **Polarity** | `Polarity` | POSITIVE, NEGATIVE (2 values) | Positive vs. negative assertion |
| **Deixis** | `Deixis` | PROXIMAL, MEDIAL, DISTAL, FAR_DISTAL, IMMEDIATE, PROXIMATE_TEMPORAL, REMOTE_TEMPORAL, INCLUSIVE, EXCLUSIVE (9 values) | Anchoring to speaker's "here and now" (spatial, temporal, personal) |

Each axis is a `DescribedEnum` (a `StrEnum` subclass) that stores:
- **description**: Imperative generation instruction for the LLM
- **examples**: Six short usage examples demonstrating the specifier

### Predefined Grammar Compositions (`GRAMMARS`)

The `GRAMMARS` list in `src/grammars.py` defines 18 pre-composed `Grammar` objects that each select specific values across the axes:

| Grammar | Form | Mood | Voice | Tense | Aspect | Person | Number | Deixis | Polarity |
|---------|------|------|-------|-------|--------|--------|--------|--------|----------|
| PAST | FINITE | INDICATIVE | ACTIVE | PAST | SIMPLE | FIRST | SINGULAR | — | — |
| PRESENT | FINITE | INDICATIVE | ACTIVE | PRESENT | SIMPLE | FIRST | SINGULAR | — | — |
| FUTURE | FINITE | INDICATIVE | ACTIVE | FUTURE | SIMPLE | FIRST | SINGULAR | — | — |
| PERFECT_PROGRESSIVE | FINITE | INDICATIVE | ACTIVE | PRESENT | PERFECT_PROGRESSIVE | FIRST | SINGULAR | — | — |
| FUTURE_PERFECT | FINITE | INDICATIVE | ACTIVE | FUTURE_PERFECT | PERFECTIVE | FIRST | SINGULAR | — | — |
| FIRST_PLURAL | FINITE | INDICATIVE | ACTIVE | PRESENT | SIMPLE | FIRST | PLURAL | — | — |
| THIRD_PRESENT | FINITE | INDICATIVE | ACTIVE | PRESENT | SIMPLE | THIRD | — | — | — |
| POTENTIAL | FINITE | POTENTIAL | ACTIVE | PRESENT | SIMPLE | FIRST | SINGULAR | — | — |
| OPTATIVE | FINITE | OPTATIVE | ACTIVE | — | — | FIRST | SINGULAR | — | — |
| IMPERATIVE | FINITE | IMPERATIVE | ACTIVE | — | — | SECOND | SINGULAR | — | — |
| INTERROGATIVE | FINITE | INTERROGATIVE | ACTIVE | PRESENT | — | FIRST | SINGULAR | — | NEGATIVE |
| INFINITIVE | INFINITIVE | — | ACTIVE | — | SIMPLE | — | — | — | — |
| GERUND | GERUND | — | ACTIVE | — | — | — | — | — | — |
| PASSIVE | FINITE | INDICATIVE | PASSIVE | PRESENT | SIMPLE | FIRST | SINGULAR | — | — |
| HABITUAL | FINITE | INDICATIVE | ACTIVE | PRESENT | HABITUAL | FIRST | SINGULAR | — | — |
| NEGATIVE | FINITE | INDICATIVE | ACTIVE | PRESENT | SIMPLE | FIRST | SINGULAR | — | NEGATIVE |

Each `Grammar` object exposes computed properties:
- `specifiers` — ordered list of active specifier values (e.g., `["INDICATIVE", "ACTIVE", "PRESENT", "SIMPLE", "FIRST", "SINGULAR"]`)
- `name` — emoji-prefixed Capital Start Case name (e.g., `"⭐ Indicative Active Present Simple First Singular"`)
- `slug` — kebab-case slug for filenames (e.g., `"indicative-active-present-simple-first-singular"`)
- `specifier_descriptions` — assembled imperative instructions from active specifiers
- `description` — human-readable purpose of the grammar
- `examples` — template examples using `{adjective}`, `{noun}`, `{verb}`, `{verb-past}`, `{verbing}`, `{past-participle}`, `{time-unit}`, `{description}`

## Subject Taxonomy

Subjects are declared in `src/subjects.py` as `Subject` objects with a `SubjectCategory`. The taxonomy comprises 24 categories spanning major spiritual practices:

| Category | Slug | Count | Description |
|----------|------|-------|-------------|
| Tarot Card | `tarot-card` | 78 | Major Arcana (22) + Minor Arcana (56) |
| Lenormand | `lenormand` | 36 | 36 Lenormand cards |
| Astrology Sign | `astrology-sign` | 13 | 12 zodiac signs + Ophiuchus |
| Astrology Planet | `astrology-planet` | 10 | Classical + modern planets |
| Astrology Asteroid | `astrology-asteroid` | 6 | Chiron, Lilith, Ceres, Pallas, Juno, Vesta |
| Astrology Aspect | `astrology-aspect` | 17 | Major + minor aspects with angle metadata |
| Astrology House | `astrology-house` | 12 | 12 houses including angular houses |
| Modality | `modality` | 3 | Cardinal, Fixed, Mutable |
| Polarity | `polarity` | 2 | Negative, Positive |
| Chakra | `chakra` | 7 | 7 primary chakras (Muladhara → Sahasrara) |
| Rune | `rune` | 24 | Elder Futhark runes |
| Sephiroth | `sephiroth` | 10 | Tree of Life sephiroth |
| Hebrew Letter | `hebrew-letter` | 22 | 22 letters with Hebrew glyph metadata |
| Kabbalah World | `kabbalah-world` | 4 | Atziluth, Briah, Yetzirah, Assiah |
| Solfeggio | `solfeggio` | 7 | Do, Re, Mi, Fa, Sol, La, Ti |
| Weekday | `weekday` | 7 | Monday → Sunday |
| Element | `element` | 4 | Earth, Air, Fire, Water |
| Color | `color` | 12 | Black, White, Red, Orange, Yellow, Green, Blue, Indigo, Violet, Pink, Brown, Gray |
| Gemstone | `gemstone` | 12 | Garnet, Amethyst, Aquamarine, Diamond, Emerald, Pearl, Ruby, Peridot, Sapphire, Opal, Topaz, Turquoise |
| Metal | `metal` | 7 | Gold, Mercury, Copper, Silver, Iron, Tin, Lead |
| Number | `number` | 32 | One → Thirty Two |

**Total subjects: ~308** (combined `SUBJECTS` list)

Each `Subject` carries:
- `category` → `SubjectCategory(name, slug)`
- `name` — display name (e.g., "The Fool")
- `slug` — URL-safe identifier (e.g., "the-fool")
- `order` — integer sort order within category
- `metadata` — optional dict (e.g., astrology aspects store `{"angle": 120, "fraction": "1/3"}`)

Adding a new practice means adding its `SubjectCategory` and `Subject` entries to `src/subjects.py` — nothing else in the pipeline needs to change.

## Pipeline Execution Flow

The main pipeline lives in `src/affirmancy.ipynb` as a sequence of LangGraph `StateGraph` compilations that progressively build up the state:

### 1. Search Sources (`search_sources` node)
- Builds a query: `"{subject_name} {category_name} meaning interpretation significance symbolism themes"`
- Queries SearxNG via `SearxSearchWrapper` (12 results)
- Extracts text from each URL via Trafilatura (`fetch_url` → `extract`)
- Truncates each source to 32,000 chars
- Returns concatenated sources in state

### 2. Analyze Sources (`analyze_sources` node)
- Uses `llm_analytical` (temperature 0.12) with `affirmations_analyze_sources_prompt_template`
- Produces a concise factual research brief with uncertainty flags
- Retries up to 6 attempts with exponential backoff (tenacity)

### 3. Generate Document (`generate_document` node)
- Uses `llm_generative` (temperature 0.24) with `affirmations_generate_document_prompt_template`
- Produces a 1000-word flowing prose reference document (no markdown)
- Writes to `output/affirmations/documents/{category}/{order}-{slug}.md`

### 4. Analyze Document (`analyze_document` node)
- Uses `llm_analytical` with `affirmations_analyze_document_prompt_template`
- Produces structured analysis for affirmation generation

### 5. Generate Affirmations (`generate_affirmations` node)
- Iterates over all 18 `GRAMMARS`
- For each grammar, uses `llm_creative` (temperature 0.48) with `affirmations_generate_affirmations_prompt_template`
- Prompt includes: `grammar_name`, `grammar_description`, `grammar_specifier_descriptions`, `grammar_specifiers`, `grammar_examples`, `grammar_emoji`
- Parses JSON5 output into `GeneratedAffirmations` (list of strings)
- Strips leading/trailing punctuation, wraps in `Affirmation` model
- Accumulates `GrammarAffirmations(grammar, affirmations)` list

### 6. Validate Grammar (`validate_affirmations_grammars` node)
- Uses `llm_validator` (temperature 0.06) with `affirmations_validate_affirmation_prompt_template`
- Validates each affirmation against its grammar's specifiers
- Collects failures with grammar name, affirmation text, and reason

### 7. Validate Subject Relevance (`validate_affirmations_subject` node)
- Uses `llm_validator` with `affirmations_validate_affirmation_subject_prompt_template`
- Checks each affirmation against the source document for subject relevance
- Collects failures

### 8. Write Output (`write_affirmations` node)
- Constructs `SubjectAffirmations(subject, grammars)`
- Writes JSON to `output/affirmations/{category}/{order}-{slug}.json` (via `model_dump_json(indent=2)`)
- Writes Markdown to `output/affirmations/{category}/{order}-{slug}.md` (structured by grammar)

The final loop iterates over `SUBJECTS` invoking the full compiled graph per subject.

## LLM Configuration

Four `ChatOllama` instances with different temperatures:

| Variable | Temperature | Purpose |
|----------|-------------|---------|
| `llm_validator` | 0.06 | Grammar + subject validation (deterministic) |
| `llm_analytical` | 0.12 | Source/document analysis |
| `llm_generative` | 0.24 | Reference document generation |
| `llm_creative` | 0.48 | Affirmation generation |

All use:
- `model="gemma4:e2b"`
- `base_url=os.environ.get("OLLAMA_HOST", "http://localhost:11434")`
- `keep_alive="12m"`
- `reasoning=False`
- `TokenCountsCallbackHandler` for token accounting

### Ollama Model Variants

| Model | Pull Command | Use Case |
|-------|--------------|----------|
| `gemma4:e2b` | `nx run affirmancy:ollama --configuration=pull-small` | Primary model (128k context) |
| `gemma4:27b` | `nx run affirmancy:ollama --configuration=pull-large` | Larger model for quality (if available) |

## SearxNG Configuration

The `searxng.settings.yml` configures a private instance layered on upstream defaults (`use_default_settings: true`):

### Key Settings
- **Hostname boosting** (`hostnames:` plugin): 100+ high-priority patterns for spiritual sources (sacred-texts.com, hermetic.com, biddytarot.com, labyrinthos.co, chabad.org, sefaria.org, runesecrets.com, crystalvaults.com, etc.)
- **Low priority**: SEO farms, generic horoscope sites, dictionaries
- **Remove**: Non-English content farms, medical sites, image-only sites, affiliate marketplaces
- **Safe search**: Off (0) — spiritual content often misclassified
- **Engine weights**: Wikisource (2.0), Open Library (2.0), Wikipedia (1.5), Startpage (1.5), Reddit (1.2), DuckDuckGo (1.0), Brave (0.9), Bing (0.7)
- **Timeouts**: 8s request / 15s max for LLM tolerance

## Nx Targets

Targets defined in `nx.json` (inherited via `targetDefaults`) and `pyproject.toml`:

| Target | Command | Description |
|--------|---------|-------------|
| `ruff-lint` | `ruff check src testing` | Linting |
| `ruff-format` | `ruff format src testing` | Formatting |
| `pyright` | `pyright` | Primary type checker (strict) |
| `ty` | `ty check` | Supplementary type checker |
| `pytest` | `pytest testing` | All tests (unit + integration) |
| `pytest:unit` | `pytest testing -m unit` | Unit tests only |
| `pytest:integration` | `pytest testing -m integration` | Integration tests (require services) |
| `test-coverage` | `pytest --cov=src testing` | Coverage report |
| `vulture` | `vulture src --exclude=__init__.py` | Dead code detection |
| `bandit` | `bandit -r src` | Security linter |
| `nbstripout` | `nbstripout src/*.ipynb` | Strip notebook outputs |
| `typecheck` | `pyright` + `ty` (parallel) | Composite type checking |
| `lint` | `ruff-lint` + `bandit` + `vulture` | Composite linting |
| `format` | `ruff-format` + `nbstripout` | Composite formatting |
| `gate` | `typecheck` + `lint` + `pytest` | Full quality gate |

### Service Management Targets

| Target | Configuration | Description |
|--------|---------------|-------------|
| `affirmancy:ollama` | `start` / `stop` / `pull-small` / `pull-large` | Ollama container lifecycle + model pulls |
| `infrastructure:searxng` | `up` / `down` / `open` | SearxNG container + browser |
| `infrastructure:open-webui` | `up` / `down` / `open` | Open WebUI container + browser |

## Project Structure

```
projects/affirmancy/
├── src/
│   ├── __init__.py              # Package marker
│   ├── affirmancy.ipynb         # Main Jupyter notebook pipeline
│   ├── grammars.py              # Grammar enums (9 axes) + Grammar model + GRAMMARS list
│   ├── models.py                # Pydantic models (Affirmation, GrammarAffirmations, SubjectAffirmations, ValidationResult)
│   ├── output.py                # JSON/Markdown file I/O utilities
│   ├── prices.ipynb             # Token pricing research notebook
│   ├── prompts.py               # LangChain prompt templates (8 templates)
│   ├── py.typed                 # PEP 561 typed package marker
│   ├── semantics.ipynb          # Semantic analysis notebook
│   ├── services.py              # SearxNG health check (fails loudly if not running)
│   └── subjects.py              # Subject + SubjectCategory definitions (~308 subjects)
├── testing/
│   ├── __init__.py
│   ├── test_grammars.py
│   ├── test_models.py
│   ├── test_output.py
│   ├── test_prompts.py
│   ├── test_services.py
│   └── test_subjects.py
├── output/
│   └── .gitkeep                 # Generated files (gitignored)
├── AGENTS.md
├── pyproject.toml
├── uv.lock
├── searxng.settings.yml
└── README.md
```

## Key Dependencies (`pyproject.toml`)

**Runtime** (≥ Python 3.15):
- `langchain>=1.4.5`, `langchain-core>=1.6.7`, `langchain-ollama>=1.0`, `langchain-community>=0.4`
- `langgraph>=0.3`
- `pydantic>=2.14.1`
- `jupyter>=1.1`, `ipykernel>=6.29`, `tornado>=6.5.8`
- `wikipedia>=1.4`, `trafilatura>=2.0`, `inflect>=7.5.0`, `pandas>=2.0`

**Dev**:
- `ruff>=0.16.10`, `pyright>=1.1`, `ty>=0.0.28`
- `pytest>=9.0.3`, `pytest-cov>=6.0`
- `bandit[toml]>=1.9.4`, `vulture>=2.14`, `nbstripout>=0.8`

## Related Pages

- [Ollama & SearxNG Integration](../integrations/ollama-searxng.md) — Service setup and configuration details
- [Local Development](../operations/local-development.md) — Running the pipeline locally
- [Architecture Overview](../architecture/common-packages.md) — Shared workspace conventions
- [Testing Affirmancy](../testing/affirmancy.md) — Test organization and running
